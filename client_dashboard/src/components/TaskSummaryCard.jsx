import { LayoutList } from 'lucide-react'

const COLUMN_TYPES = [
  { key: 'todo',        label: 'To Do',       color: '#3b82f6', textColor: '#93c5fd', keywords: ['to do', 'todo'] },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b', textColor: '#fcd34d', keywords: ['in progress', 'inprogress'] },
  { key: 'completed',   label: 'Completed',   color: '#22c55e', textColor: '#86efac', keywords: ['done', 'completed', 'complete', 'finished'] },
]

function matchColumnType(colName) {
  const lower = colName.toLowerCase()
  for (const type of COLUMN_TYPES) {
    if (type.keywords.some(k => lower.includes(k))) return type.key
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

export default function TaskSummaryCard({ columns, cards, title = 'Task Summary' }) {
  const stats = COLUMN_TYPES.map(type => {
    const matchedCols = columns.filter(col => matchColumnType(col.name) === type.key)
    const colIds = new Set(matchedCols.map(c => c.id))
    const colCards = cards.filter(c => colIds.has(c.column_id))
    return {
      ...type,
      count: colCards.length,
      overdue: colCards.filter(isPastDue).length,
      late: type.key === 'completed' ? colCards.filter(isCompletedLate).length : 0,
    }
  })

  const total = stats.reduce((s, r) => s + r.count, 0)

  // Donut
  const size = 84, cx = 42, cy = 42, r = 30
  const circumference = 2 * Math.PI * r
  let cum = 0

  return (
    <div className="glass-dark glass-hover rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(96,165,250,0.16)' }}>
          <LayoutList size={15} className="text-blue-300" />
        </div>
        <span className="font-semibold text-white text-sm">{title}</span>
      </div>

      {/* Body: donut left, rows right */}
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="13" />
            {total > 0 && stats.map(item => {
              if (item.count === 0) return null
              const pct = (item.count / total) * 100
              const dash = (pct / 100) * circumference - 1.2
              const rot = -90 + (cum / 100) * 360
              cum += pct
              return (
                <circle
                  key={item.key}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="13"
                  strokeDasharray={`${dash} ${circumference}`}
                  transform={`rotate(${rot} ${cx} ${cy})`}
                  strokeLinecap="butt"
                />
              )
            })}
            <text x={cx} y={cy - 2} textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="800">{total}</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">tasks</text>
          </svg>
        </div>

        {/* Inline rows */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {stats.map(item => (
            <div key={item.key} className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.label}</span>
              <span className="text-base font-bold w-6 text-right shrink-0" style={{ color: item.textColor }}>{item.count}</span>
              {item.key === 'completed'
                ? item.late > 0
                  ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-20 text-center shrink-0" style={{ background: 'rgba(245,158,11,0.18)', color: '#fcd34d' }}>{item.late} late</span>
                  : <span className="text-xs px-2 py-0.5 rounded-full w-20 text-center shrink-0" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>on time</span>
                : item.overdue > 0
                  ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-20 text-center shrink-0" style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>{item.overdue} past due</span>
                  : <span className="text-xs px-2 py-0.5 rounded-full w-20 text-center shrink-0" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>on track</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
