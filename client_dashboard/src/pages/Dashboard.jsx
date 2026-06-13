import { useState } from 'react'
import {
  DndContext, MouseSensor, TouchSensor, useSensor, useSensors,
  DragOverlay, closestCorners,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Loader2, X, Columns3, Calendar, ChevronDown, ArrowRight, FileDown } from 'lucide-react'
import { useBoard } from '../hooks/useBoard'
import { useClient } from '../contexts/ClientContext'
import { useAuth } from '../contexts/AuthContext'
import KanbanColumn from '../components/KanbanColumn'
import KanbanCard from '../components/KanbanCard'
import AttendanceCard from '../components/AttendanceCard'
import TaskSummaryCard from '../components/TaskSummaryCard'
import CardModal from '../components/CardModal'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEAR_OPTIONS = (() => { const y = new Date().getFullYear(); return [y-2,y-1,y,y+1,y+2] })()

// ── Add Column Modal ──────────────────────────────────────

function AddColumnModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onAdd(name.trim())
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-enter bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
              <Columns3 size={17} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-900">Add New Column</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Column Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='e.g. "To Do", "In Progress", "Completed"'
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add Column'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────

export default function Dashboard() {
  const { selectedClient, selectedClientId, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = useClient()
  const { isSKPM } = useAuth()
  const {
    columns, cards, loading,
    addColumn, updateColumn, deleteColumn, reorderColumns, toggleColumnLock,
    addCard, updateCard, moveCard, deleteCard,
  } = useBoard(selectedClientId, selectedMonth, selectedYear)

  const [showAddCol, setShowAddCol] = useState(false)
  const [activeCard, setActiveCard] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)
  const [cardModal, setCardModal] = useState(null)   // { column, card? }
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, card, targetColumns }
  const [exporting, setExporting] = useState(false)

  const sensors = useSensors(
    // Desktop: unchanged — drag starts after an 8px mouse move.
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Mobile: press-and-hold to drag, so a normal swipe scrolls the board instead.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  function getColumnCards(columnId) {
    return cards
      .filter(c => c.column_id === columnId)
      .sort((a, b) => a.position - b.position)
  }

  // ── DnD ─────────────────────────────────────────────────

  function handleDragStart({ active }) {
    if (active.data?.current?.type === 'column') {
      setActiveColumn(columns.find(c => c.id === active.id) || null)
    } else {
      setActiveCard(cards.find(c => c.id === active.id) || null)
    }
  }

  async function handleDragEnd({ active, over }) {
    setActiveCard(null)
    setActiveColumn(null)
    if (!over) return

    // ── Column reorder ─────────────────────────────────────
    if (active.data?.current?.type === 'column') {
      const oldIdx = columns.findIndex(c => c.id === active.id)

      // over.id may be the column id, 'drop-{columnId}' (inner droppable), or a card id.
      // Use columnId from data when available — it's set on both the column sortable
      // and the inner droppable, so this always resolves to the correct column.
      let targetColId = over.data?.current?.columnId || null
      if (!targetColId) {
        // over is a card — use its parent column
        const overCard = cards.find(c => c.id === over.id)
        targetColId = overCard ? overCard.column_id : over.id
      }

      const newIdx = columns.findIndex(c => c.id === targetColId)
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        await reorderColumns(arrayMove(columns, oldIdx, newIdx).map(c => c.id))
      }
      return
    }

    // ── Card move ──────────────────────────────────────────
    const draggedCard = cards.find(c => c.id === active.id)
    if (!draggedCard) return

    // Block clients from moving cards in/out of locked columns
    if (!isSKPM) {
      const fromColumn = columns.find(c => c.id === draggedCard.column_id)
      if (fromColumn?.is_locked) return
    }

    let targetColumnId = over.data?.current?.columnId || null
    if (!targetColumnId) {
      const overCard = cards.find(c => c.id === over.id)
      if (overCard) targetColumnId = overCard.column_id
    }
    if (!targetColumnId) return

    const targetColumn = columns.find(c => c.id === targetColumnId)
    if (!isSKPM && targetColumn?.is_locked) return

    // Block cross-group drags (e.g. SKPM card cannot be dragged into Alufin columns)
    const fromColumn = columns.find(c => c.id === draggedCard.column_id)
    const fromIsTracked = STATUS_KEYWORDS.some(kw => fromColumn?.name.toLowerCase().includes(kw))
    const toIsTracked = STATUS_KEYWORDS.some(kw => targetColumn?.name.toLowerCase().includes(kw))
    if (fromIsTracked && toIsTracked) {
      const fromGroup = extractGroupLabel(fromColumn.name).toLowerCase() || 'general'
      const toGroup = extractGroupLabel(targetColumn.name).toLowerCase() || 'general'
      if (fromGroup !== toGroup) return
    }

    const targetCards = cards
      .filter(c => c.column_id === targetColumnId && c.id !== draggedCard.id)
      .sort((a, b) => a.position - b.position)

    let newPosition = targetCards.length
    const overCard = cards.find(c => c.id === over.id)
    if (overCard && overCard.column_id === targetColumnId) {
      const idx = targetCards.findIndex(c => c.id === over.id)
      if (idx >= 0) newPosition = idx
    }

    // Auto-update status when card has status tracking and column name matches
    let autoStatus = null
    const cardData = draggedCard.data || {}
    if (cardData.has_status && targetColumn) {
      const name = targetColumn.name.toLowerCase()
      if (name.includes('to do') || name.includes('todo')) autoStatus = 'default'
      else if (name.includes('in progress') || name.includes('inprogress')) autoStatus = 'in_progress'
      else if (name.includes('done') || name.includes('completed') || name.includes('complete') || name.includes('finished')) autoStatus = 'done'
    }

    await moveCard(draggedCard.id, targetColumnId, newPosition, autoStatus)
  }

  // ── Actions ──────────────────────────────────────────────

  async function handleDeleteColumn(id) {
    if (!window.confirm('Delete this column and all its cards?')) return
    await deleteColumn(id)
  }

  function handleAddCard(column) {
    setCardModal({ column, card: null, canEdit: true })
  }

  function handleViewCard(card) {
    const column = columns.find(c => c.id === card.column_id)
    setCardModal({ column, card, canEdit: false })
  }

  function handleEditCard(card) {
    const column = columns.find(c => c.id === card.column_id)
    const canEdit = isSKPM || !column?.is_locked
    setCardModal({ column, card, canEdit })
  }

  async function handleSaveCard({ data, status }) {
    const { column, card } = cardModal
    if (card) {
      await updateCard(card.id, { data, status })
    } else {
      await addCard(column.id, data, status)
    }
  }

  async function handleDeleteCard(id) {
    if (!window.confirm('Remove this card?')) return
    await deleteCard(id)
  }

  async function handleMoveToColumn(card, targetColumnId) {
    const targetColumn = columns.find(c => c.id === targetColumnId)
    const fromColumn = columns.find(c => c.id === card.column_id)
    if (!isSKPM) {
      if (fromColumn?.is_locked || targetColumn?.is_locked) return
    }
    const newPosition = cards.filter(c => c.column_id === targetColumnId && c.id !== card.id).length
    let autoStatus = null
    const cardData = card.data || {}
    if (cardData.has_status && targetColumn) {
      const name = targetColumn.name.toLowerCase()
      if (name.includes('to do') || name.includes('todo')) autoStatus = 'default'
      else if (name.includes('in progress') || name.includes('inprogress')) autoStatus = 'in_progress'
      else if (name.includes('done') || name.includes('completed') || name.includes('complete') || name.includes('finished')) autoStatus = 'done'
    }
    await moveCard(card.id, targetColumnId, newPosition, autoStatus)
  }

  function handleCardContextMenu(card, x, y) {
    const fromCol = columns.find(c => c.id === card.column_id)
    if (!fromCol) return
    if (!isSKPM && fromCol.is_locked) return

    const fromIsTracked = STATUS_KEYWORDS.some(kw => fromCol.name.toLowerCase().includes(kw))
    const fromGroup = fromIsTracked
      ? (extractGroupLabel(fromCol.name).toLowerCase() || 'general')
      : 'untracked'

    const targetColumns = columns.filter(col => {
      if (col.id === card.column_id) return false
      if (!isSKPM && col.is_locked) return false
      const isTracked = STATUS_KEYWORDS.some(kw => col.name.toLowerCase().includes(kw))
      const group = isTracked ? (extractGroupLabel(col.name).toLowerCase() || 'general') : 'untracked'
      return group === fromGroup
    })

    if (!targetColumns.length) return
    setContextMenu({ x, y, card, targetColumns })
  }

  // ── PDF Export ───────────────────────────────────────────

  async function handleExportPDF() {
    setExporting(true)

    // Close any open dropdowns / menus so they don't appear in the capture
    setMonthDropdownOpen(false)
    setYearDropdownOpen(false)
    setContextMenu(null)

    const inner = document.querySelector('[data-kanban-inner]')
    const prevInnerMinH   = inner ? inner.style.minHeight : null
    const prevInnerPadB   = inner ? inner.style.paddingBottom : null

    function restore() {
      if (inner) {
        inner.style.minHeight     = prevInnerMinH ?? ''
        inner.style.paddingBottom = prevInnerPadB ?? ''
      }
    }

    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF }   = await import('jspdf')

      // Collapse the board's tall min-height so we don't capture a huge empty
      // area below the cards.
      if (inner) {
        inner.style.minHeight     = '0px'
        inner.style.paddingBottom = '24px'
      }
      await new Promise(r => requestAnimationFrame(r))
      await new Promise(r => setTimeout(r, 80))

      const PAGE_BG = '#eceef4'
      const SCALE   = 2

      // Capture each section as its own canvas. Capturing an element DIRECTLY
      // measures its full scrollWidth/scrollHeight — so even if the board
      // overflows on a narrow window (columns hit their min-width), ALL
      // columns are captured regardless of the horizontal scroll clip.
      const sections = [
        document.querySelector('[data-export-nav]'),
        document.querySelector('[data-export-summary]'),
        document.querySelector('[data-export-toolbar]'),
        inner,
      ].filter(Boolean)

      // html2canvas clones the DOM and re-renders it. Any CSS entrance
      // animation (the staggered column/card slide-up) RESTARTS in that clone
      // from its `opacity: 0` keyframe — so columns with an animation-delay get
      // snapshotted while still invisible, and silently drop out of the PDF.
      // Killing all animation/transition in the clone forces final-state render.
      const prepClone = (doc) => {
        const style = doc.createElement('style')
        // 1. DISABLE the entrance animations. Removing the animation lets the
        //    column/card fall back to its base style (opacity 1) — so we must
        //    NOT force opacity, or normally-hidden hover tooltips (opacity-0
        //    group-hover:opacity-100) would become visible in the capture.
        // 2. Hide the "Export PDF" button — it shows "Exporting…" mid-capture,
        //    which doesn't belong in the report.
        // 3. The navbar's live "glass" look (50% white + backdrop-filter blur)
        //    can't be rendered by html2canvas (no backdrop-filter support), so
        //    give it a solid white background for the capture.
        style.textContent =
          '*,*::before,*::after{animation:none!important;transition:none!important}' +
          '[data-export-btn]{display:none!important}' +
          '[data-export-nav]{background:#fff!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
        doc.head.appendChild(style)
      }

      const canvases = []
      for (const el of sections) {
        const w = el.scrollWidth
        const h = el.scrollHeight
        const c = await html2canvas(el, {
          scale: SCALE,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: PAGE_BG,
          width:  w,
          height: h,
          windowWidth:  Math.max(document.documentElement.clientWidth, w),
          windowHeight: Math.max(document.documentElement.clientHeight, h),
          scrollX: 0,
          scrollY: 0,
          onclone: (doc) => prepClone(doc),
        })
        canvases.push(c)
      }

      restore()

      // Stack the section canvases vertically into one composite image, with a
      // gap between them (their live margins aren't included in scrollHeight).
      // The board is the widest; narrower sections are centered above it.
      const GAP = 16 * SCALE
      const compW = Math.max(...canvases.map(c => c.width))
      const compH = canvases.reduce((s, c) => s + c.height, 0) + GAP * (canvases.length - 1)
      const comp  = document.createElement('canvas')
      comp.width  = compW
      comp.height = compH
      const ctx = comp.getContext('2d')
      ctx.fillStyle = PAGE_BG
      ctx.fillRect(0, 0, compW, compH)
      let yOff = 0
      canvases.forEach((c, i) => {
        const x = Math.round((compW - c.width) / 2)
        ctx.drawImage(c, x, yOff)
        yOff += c.height + (i < canvases.length - 1 ? GAP : 0)
      })

      // Slice the tall composite across landscape A4 pages.
      const imgData = comp.toDataURL('image/jpeg', 0.95)
      const pdf     = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW   = pdf.internal.pageSize.getWidth()
      const pageH   = pdf.internal.pageSize.getHeight()

      const scaledTotalH = pageW * (comp.height / comp.width)

      let page = 0
      while (page * pageH < scaledTotalH - 0.5) {
        if (page > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -(page * pageH), pageW, scaledTotalH)
        page++
      }

      const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
      const monthName = months[selectedMonth - 1]
      pdf.save(`SKPM_${(selectedClient?.name || 'Report').replace(/\s+/g, '_')}_${monthName}_${selectedYear}.pdf`)

    } catch (err) {
      restore()
      console.error('PDF export failed:', err)
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  // ── Empty / loading states ────────────────────────────────

  if (!selectedClientId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-base font-medium">No client selected</p>
        <p className="text-sm mt-1">Choose a client from the dropdown in the top bar</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4 md:px-6 pt-6">
        {/* Summary cards skeleton */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
          {[0, 1, 2].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
        {/* Toolbar skeleton */}
        <div className="skeleton h-12 rounded-xl mb-6" />
        {/* Columns skeleton */}
        <div className="flex gap-5 overflow-hidden">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex-1 min-w-[200px] max-w-[360px] space-y-3">
              <div className="skeleton h-12 rounded-xl" />
              <div className="skeleton h-28 rounded-xl" style={{ animationDelay: `${i * 120}ms` }} />
              <div className="skeleton h-20 rounded-xl" style={{ animationDelay: `${i * 120 + 60}ms` }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const showAttendance = !!selectedClient?.attendance_enabled

  // Detect column groups by stripping status keywords from column names.
  // e.g. "To Do SKPM" → group "SKPM", "In Progress Alufin" → group "Alufin"
  const STATUS_KEYWORDS = ['in progress', 'inprogress', 'to do', 'todo', 'done', 'completed', 'complete', 'finished']
  function extractGroupLabel(colName) {
    let label = colName
    STATUS_KEYWORDS.forEach(kw => { label = label.replace(new RegExp(kw, 'gi'), '') })
    return label.trim()
  }

  const columnGroups = (() => {
    const map = {}
    columns.forEach(col => {
      const isTracked = STATUS_KEYWORDS.some(kw => col.name.toLowerCase().includes(kw))
      if (!isTracked) return
      const groupLabel = extractGroupLabel(col.name) || 'General'
      const key = groupLabel.toLowerCase()
      if (!map[key]) map[key] = { label: groupLabel, columns: [] }
      map[key].columns.push(col)
    })
    return Object.values(map)
  })()

  const showSummary = columnGroups.length > 0

  return (
    <div>
      {/* Top row: Attendance + per-group Task Summary Cards — dark navy band, matching the website's alternating sections */}
      {(showAttendance || showSummary) && (
        <div data-export-summary className="dark-band px-4 md:px-6 py-6">
          <div className={`grid gap-4 grid-cols-1 ${
            (() => {
              const count = (showAttendance ? 1 : 0) + columnGroups.length
              if (count === 2) return 'md:grid-cols-2'
              if (count === 3) return 'md:grid-cols-3'
              if (count >= 4) return 'md:grid-cols-4'
              return ''
            })()
          }`}>
            {showAttendance && <AttendanceCard client={selectedClient} isSKPM={isSKPM} month={selectedMonth} year={selectedYear} />}
            {showSummary && columnGroups.map(group => (
              <TaskSummaryCard
                key={group.label}
                columns={group.columns}
                cards={cards}
                title={`Task Summary ${group.label}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Board toolbar */}
      <div data-export-toolbar className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 px-4 md:px-6 py-3 glass-toolbar sticky top-16 z-20">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <span className="text-sm font-semibold text-slate-700 truncate max-w-[45vw] sm:max-w-none">{selectedClient?.name}</span>
          <span className="text-slate-300">·</span>

          {/* Month dropdown */}
          <div className="relative">
            <button
              onClick={() => { setMonthDropdownOpen(o => !o); setYearDropdownOpen(false) }}
              className="btn-ghost flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm text-slate-600 font-medium"
            >
              <Calendar size={13} className="text-slate-400" />
              {MONTH_NAMES[selectedMonth - 1]}
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${monthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {monthDropdownOpen && (
              <div className="modal-enter absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 max-h-72 overflow-y-auto">
                {MONTH_FULL.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedMonth(idx + 1); setMonthDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      idx + 1 === selectedMonth ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year dropdown */}
          <div className="relative">
            <button
              onClick={() => { setYearDropdownOpen(o => !o); setMonthDropdownOpen(false) }}
              className="btn-ghost flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm text-slate-600 font-medium"
            >
              {selectedYear}
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${yearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {yearDropdownOpen && (
              <div className="modal-enter absolute top-full left-0 mt-2 w-28 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30">
                {YEAR_OPTIONS.map(y => (
                  <button
                    key={y}
                    onClick={() => { setSelectedYear(y); setYearDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      y === selectedYear ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-300">·</span>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100/80 border border-slate-200/60">
            {columns.length} column{columns.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            data-export-btn
            onClick={handleExportPDF}
            disabled={exporting}
            className="btn-ghost flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 disabled:opacity-50"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export PDF'}</span>
            <span className="sm:hidden">{exporting ? '…' : 'PDF'}</span>
          </button>
          {isSKPM && (
            <button
              onClick={() => setShowAddCol(true)}
              className="btn-primary flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-sm font-semibold text-white"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Column</span>
              <span className="sm:hidden">Column</span>
            </button>
          )}
        </div>
      </div>

      {/* Columns scroll area */}
      <div data-kanban-scroll className="overflow-x-auto">
        <div data-kanban-inner className="flex gap-5 px-4 md:px-6 py-6 min-h-[calc(100vh-200px)]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {columns.length === 0 && (
              <div className="flex w-full items-center justify-center py-12">
                <div className="glass-panel rounded-2xl flex flex-col items-center text-center px-12 py-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
                    <Columns3 size={26} className="text-blue-500" />
                  </div>
                  <p className="font-semibold text-slate-700">No columns yet</p>
                  {isSKPM ? (
                    <p className="text-sm text-slate-400 mt-1.5 max-w-xs">
                      Click <strong className="text-slate-500">"Add Column"</strong> above to set up this client's board
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 mt-1.5 max-w-xs">
                      Your board will appear here once it's set up
                    </p>
                  )}
                </div>
              </div>
            )}

            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={getColumnCards(column.id)}
                  isSKPM={isSKPM}
                  onAddCard={handleAddCard}
                  onViewCard={handleViewCard}
                  onEditCard={handleEditCard}
                  onDeleteCard={handleDeleteCard}
                  onDeleteColumn={handleDeleteColumn}
                  onRenameColumn={(id, name) => updateColumn(id, { name })}
                  onToggleLock={toggleColumnLock}
                  onCardContextMenu={handleCardContextMenu}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeCard && (
                <KanbanCard
                  card={activeCard}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isSKPM={isSKPM}
                />
              )}
              {activeColumn && (
                <div className="flex-shrink-0 w-72 rotate-2 opacity-90">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <h3 className="font-semibold text-slate-800 text-sm">{activeColumn.name}</h3>
                  </div>
                  <div className="bg-slate-100/80 rounded-2xl p-3 min-h-28 shadow-xl" />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Click outside to close toolbar dropdowns */}
      {(monthDropdownOpen || yearDropdownOpen) && (
        <div className="fixed inset-0 z-10" onClick={() => { setMonthDropdownOpen(false); setYearDropdownOpen(false) }} />
      )}

      {/* Modals */}
      {showAddCol && (
        <AddColumnModal
          onAdd={addColumn}
          onClose={() => setShowAddCol(false)}
        />
      )}

      {cardModal && (
        <CardModal
          card={cardModal.card}
          columnName={cardModal.column?.name}
          canEdit={cardModal.canEdit !== false}
          onSave={handleSaveCard}
          onClose={() => setCardModal(null)}
        />
      )}

      {/* Context menu backdrop + menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null) }}
          />
          <div
            className="modal-enter fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden py-1 min-w-[192px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
              Move to
            </div>
            {contextMenu.targetColumns.map(col => (
              <button
                key={col.id}
                onClick={() => { handleMoveToColumn(contextMenu.card, col.id); setContextMenu(null) }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors text-left"
                style={{ color: '#475569' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                <ArrowRight size={13} style={{ color: '#94a3b8' }} />
                {col.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
