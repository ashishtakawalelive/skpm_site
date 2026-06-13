import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const MONTH_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const STATUS_LABEL = {
  default:     'To Do',
  in_progress: 'In Progress',
  done:        'Done',
  overdue:     'Overdue',
}

const COLUMN_TYPE_KEYWORDS = {
  todo:        ['to do', 'todo'],
  in_progress: ['in progress', 'inprogress'],
  completed:   ['done', 'completed', 'complete', 'finished'],
}

function matchColumnType(colName) {
  const lower = colName.toLowerCase()
  for (const [key, kws] of Object.entries(COLUMN_TYPE_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) return key
  }
  return null
}

function isPastDue(card) {
  if (card.status === 'done') return false
  const due = card.data?.due_date
  if (!due) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(due + 'T12:00:00') < today
}

function isCompletedLate(card) {
  if (!card.completed_at || !card.data?.due_date) return false
  return new Date(card.completed_at) > new Date(card.data.due_date + 'T23:59:59')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Draws a filled rounded-rect stat box
function drawSummaryBox(doc, x, y, w, h, { label, valueLines, accent }) {
  const [r, g, b] = accent
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F')
  doc.setFillColor(r, g, b)
  doc.rect(x, y, 3, h, 'F')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(label, x + 7, y + 7)

  let vy = y + 15
  valueLines.forEach(line => {
    doc.setFontSize(line.size || 10)
    doc.setFont('helvetica', line.bold ? 'bold' : 'normal')
    doc.setTextColor(...(line.color || [15, 23, 42]))
    doc.text(line.text, x + 7, vy)
    vy += (line.gap || 5)
  })
}

// Draws the mini page header (continuation pages only)
function drawPageHeader(doc, pageW, mg, client, monthName, year) {
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageW, 9, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)
  doc.text(
    `SKPM Associates LLP  |  ${client.name}  |  ${monthName} ${year}`,
    mg, 6,
  )
  doc.text(
    `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
    pageW - mg, 6,
    { align: 'right' },
  )
}

export function exportDashboardPDF({ client, month, year, columns, cards, visits = [] }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()   // 297
  const pageH = doc.internal.pageSize.getHeight()  // 210
  const mg = 18

  const monthName  = MONTH_FULL[month - 1]
  const generatedOn = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── PAGE 1: COVER HEADER ─────────────────────────────────
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageW, 26, 'F')

  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('SKPM Associates LLP', mg, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(186, 210, 255)
  doc.text('Monthly Client Report', mg, 19)

  doc.setFontSize(8)
  doc.setTextColor(186, 210, 255)
  doc.text(`Generated: ${generatedOn}`, pageW - mg, 19, { align: 'right' })

  // ── Client name + period pill ─────────────────────────────
  let y = 38
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(client.name, mg, y)

  // Period badge (right side)
  const badgeLabel = `${monthName} ${year}`
  const badgeW = doc.getTextWidth(badgeLabel) + 10
  const badgeX = pageW - mg - badgeW
  doc.setFillColor(239, 246, 255)
  doc.roundedRect(badgeX, y - 6, badgeW, 9, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(37, 99, 235)
  doc.text(badgeLabel, badgeX + 5, y)

  y += 5
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(mg, y, pageW - mg, y)

  // ── SUMMARY SECTION ──────────────────────────────────────
  y += 8
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('SUMMARY', mg, y)
  y += 5

  // Collect task groups
  const STATUS_KW = ['in progress', 'inprogress', 'to do', 'todo', 'done', 'completed', 'complete', 'finished']
  function extractGroupLabel(colName) {
    let label = colName
    STATUS_KW.forEach(kw => { label = label.replace(new RegExp(kw, 'gi'), '') })
    return label.trim()
  }
  const groupMap = {}
  columns.forEach(col => {
    const isTracked = STATUS_KW.some(kw => col.name.toLowerCase().includes(kw))
    if (!isTracked) return
    const groupLabel = extractGroupLabel(col.name) || 'General'
    const key = groupLabel.toLowerCase()
    if (!groupMap[key]) groupMap[key] = { label: groupLabel, columns: [] }
    groupMap[key].columns.push(col)
  })
  const columnGroups = Object.values(groupMap)

  const showAttendance = !!client.attendance_enabled
  const summaryCount = (showAttendance ? 1 : 0) + columnGroups.length
  const boxH = 34
  const gapX = 5
  const contentW = pageW - mg * 2
  const boxW = summaryCount > 0 ? (contentW - gapX * (summaryCount - 1)) / summaryCount : contentW

  let bx = mg

  if (showAttendance) {
    const target = client.attendance_target || 20
    const pct = Math.min(Math.round((visits.length / target) * 100), 100)
    drawSummaryBox(doc, bx, y, boxW, boxH, {
      label: `ATTENDANCE  |  ${monthName.toUpperCase()} ${year}`,
      accent: [37, 99, 235],
      valueLines: [
        { text: `${visits.length} / ${target}`, size: 18, bold: true, color: [37, 99, 235], gap: 6 },
        { text: `${pct}% of target visits completed`, size: 7, bold: false, color: [100, 116, 139], gap: 5 },
      ],
    })
    bx += boxW + gapX
  }

  columnGroups.forEach(group => {
    const colIds = new Set(group.columns.map(c => c.id))
    const groupCards = cards.filter(c => colIds.has(c.column_id))

    const todoCount   = groupCards.filter(c => matchColumnType(columns.find(col => col.id === c.column_id)?.name) === 'todo').length
    const inProgCount = groupCards.filter(c => matchColumnType(columns.find(col => col.id === c.column_id)?.name) === 'in_progress').length
    const doneCount   = groupCards.filter(c => matchColumnType(columns.find(col => col.id === c.column_id)?.name) === 'completed').length
    const overdueCount = groupCards.filter(isPastDue).length
    const lateCount    = groupCards.filter(isCompletedLate).length

    const flags = []
    if (overdueCount) flags.push(`${overdueCount} past due`)
    if (lateCount)    flags.push(`${lateCount} completed late`)
    if (!flags.length) flags.push('All tasks on track')

    // Draw box manually for multi-stat layout
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(bx, y, boxW, boxH, 2.5, 2.5, 'F')
    doc.setFillColor(37, 99, 235)
    doc.rect(bx, y, 3, boxH, 'F')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(`TASK SUMMARY  |  ${group.label.toUpperCase()}`, bx + 7, y + 7)

    const statItems = [
      { label: 'To Do',       val: todoCount,   rgb: [37, 99, 235] },
      { label: 'In Progress', val: inProgCount,  rgb: [217, 119, 6] },
      { label: 'Done',        val: doneCount,    rgb: [5, 150, 105] },
    ]
    const statSlotW = (boxW - 10) / 3
    statItems.forEach((s, i) => {
      const sx = bx + 7 + i * statSlotW
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...s.rgb)
      doc.text(String(s.val), sx, y + 20)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(s.label, sx, y + 26)
    })

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...(overdueCount || lateCount ? [220, 38, 38] : [100, 116, 139]))
    doc.text(flags.join('  |  '), bx + 7, y + 32)

    bx += boxW + gapX
  })

  y += boxH + 8

  // ── BOARD SECTION HEADER ─────────────────────────────────
  doc.setFillColor(248, 250, 252)
  doc.rect(mg, y, contentW, 9, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Kanban Board', mg + 4, y + 6)

  // Column count
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(
    `${columns.length} column${columns.length !== 1 ? 's' : ''}  ·  ${cards.length} card${cards.length !== 1 ? 's' : ''}  ·  ${monthName} ${year}`,
    pageW - mg - 4, y + 6,
    { align: 'right' },
  )

  y += 13

  // ── KANBAN TABLES ─────────────────────────────────────────
  const COL_STYLES = {
    todo:        { headerFill: [239, 246, 255], headerText: [30, 64, 175],  accent: [37, 99, 235] },
    in_progress: { headerFill: [255, 251, 235], headerText: [120, 53, 15],  accent: [217, 119, 6] },
    completed:   { headerFill: [240, 253, 244], headerText: [6, 78, 59],    accent: [5, 150, 105] },
    other:       { headerFill: [248, 250, 252], headerText: [51, 65, 85],   accent: [100, 116, 139] },
  }

  columns.forEach(column => {
    const colCards = cards
      .filter(c => c.column_id === column.id)
      .sort((a, b) => a.position - b.position)

    // Always include all columns (even empty ones show as a header with no rows)

    const typeKey = matchColumnType(column.name) || 'other'
    const cs = COL_STYLES[typeKey] || COL_STYLES.other
    const [hfr, hfg, hfb] = cs.headerFill
    const [htr, htg, htb] = cs.headerText

    // Build rows + per-row metadata for cell styling
    const rowMeta = []
    const rows = colCards.map(card => {
      const d = card.data || {}
      const isNote = d.type === 'note'

      const dueStr  = !isNote && d.due_date ? formatDate(d.due_date) : ''
      const pastDue = isPastDue(card)
      const late    = isCompletedLate(card)
      const status  = isNote ? '' : (STATUS_LABEL[card.status] || 'To Do')

      // Due date display: date + inline flag
      let dueCellText = dueStr
      if (dueStr && pastDue) dueCellText = dueStr + ' (Past Due)'
      else if (dueStr && late) dueCellText = dueStr + ' (Late)'

      rowMeta.push({
        pastDue,
        late,
        statusKey: card.status,
        isNote,
      })

      return [
        d.title || 'Untitled',
        !isNote && d.has_assignee && d.assignee ? d.assignee : '',
        dueCellText,
        status,
        isNote ? (d.content || '') : (d.details || ''),
      ]
    })

    const colTitle = `${column.name}${column.is_locked ? '  (Locked)' : ''}  -  ${colCards.length} card${colCards.length !== 1 ? 's' : ''}`

    autoTable(doc, {
      startY: y,
      margin: { left: mg, right: mg },
      tableWidth: pageW - mg * 2,
      head: [[ { content: colTitle, colSpan: 5 } ]],
      body: rows,
      theme: 'plain',
      headStyles: {
        fillColor: [hfr, hfg, hfb],
        textColor: [htr, htg, htb],
        fontStyle: 'bold',
        fontSize: 8.5,
        font: 'helvetica',
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      },
      // Column sub-header row (drawn manually via didDrawCell for the first data row header)
      columnStyles: {
        0: { cellWidth: 68,   fontStyle: 'bold', fontSize: 8,   font: 'helvetica' },
        1: { cellWidth: 38,   fontSize: 7.5,     font: 'helvetica', textColor: [71, 85, 105] },
        2: { cellWidth: 40,   fontSize: 7.5,     font: 'helvetica' },
        3: { cellWidth: 28,   fontSize: 7.5,     font: 'helvetica', fontStyle: 'bold' },
        4: { cellWidth: 'auto', fontSize: 7.5,   font: 'helvetica', textColor: [100, 116, 139] },
      },
      alternateRowStyles: { fillColor: [250, 251, 253] },
      bodyStyles: {
        textColor: [51, 65, 85],
        cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
        lineColor: [226, 232, 240],
        lineWidth: 0.25,
        font: 'helvetica',
      },
      didParseCell(data) {
        if (data.section !== 'body') return
        const meta = rowMeta[data.row.index]
        if (!meta) return

        // Status cell coloring
        if (data.column.index === 3) {
          const sKey = meta.statusKey
          if (sKey === 'in_progress') data.cell.styles.textColor = [217, 119, 6]
          else if (sKey === 'done')   data.cell.styles.textColor = [5, 150, 105]
          else if (sKey === 'overdue') data.cell.styles.textColor = [220, 38, 38]
          else                         data.cell.styles.textColor = [37, 99, 235]
        }

        // Due date coloring
        if (data.column.index === 2) {
          if (meta.pastDue) data.cell.styles.textColor = [220, 38, 38]
          else if (meta.late) data.cell.styles.textColor = [217, 119, 6]
          else data.cell.styles.textColor = [71, 85, 105]
        }

        // Title coloring for past-due active cards
        if (data.column.index === 0 && meta.pastDue) {
          data.cell.styles.textColor = [153, 27, 27]
        }
      },
      willDrawCell(data) {
        // Left accent bar on the first column
        if (data.section === 'body' && data.column.index === 0) {
          const [ar, ag, ab] = cs.accent
          doc.setFillColor(ar, ag, ab)
          doc.rect(data.cell.x, data.cell.y, 2, data.cell.height, 'F')
        }
      },
      didDrawPage(data) {
        // Only re-draw header on continuation pages (page 1 already has the main header)
        if (doc.internal.getCurrentPageInfo().pageNumber === 1) return
        drawPageHeader(doc, pageW, mg, client, monthName, year)
      },
    })

    y = doc.lastAutoTable.finalY + 6
  })

  // ── FOOTER ───────────────────────────────────────────────
  const lastPage = doc.internal.getNumberOfPages()
  doc.setPage(lastPage)

  const footerY = pageH - 8
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(mg, footerY - 2, pageW - mg, footerY - 2)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text(
    `SKPM Associates LLP  |  Confidential  |  ${client.name}  |  ${monthName} ${year}`,
    pageW / 2,
    footerY + 2,
    { align: 'center' },
  )

  // ── SAVE ─────────────────────────────────────────────────
  const filename = `SKPM_${client.name.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`
  doc.save(filename)
}
