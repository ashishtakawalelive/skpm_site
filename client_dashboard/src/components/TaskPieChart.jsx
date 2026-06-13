const SLICES = [
  { key: 'default',     label: 'To Do',       color: '#3b82f6' },
  { key: 'in_progress', label: 'In Progress',  color: '#f59e0b' },
  { key: 'done',        label: 'Done',         color: '#22c55e' },
]

const OVERDUE_COLOR = '#ef4444'

function isPastDue(card) {
  if (card.status === 'done') return false
  const due = card.data?.due_date
  if (!due) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(due + 'T12:00:00') < today
}

function isCompletedLate(card) {
  if (!card.completed_at || !card.data?.due_date) return false
  return new Date(card.completed_at) > new Date(card.data.due_date + 'T23:59:59')
}

function getStatusKey(card) {
  return !card.status || card.status === 'default' ? 'default' : card.status
}

export default function TaskPieChart({ cards }) {
  const taskCards = cards.filter(c => c.data?.has_status)
  const total = taskCards.length
  const totalAllCards = cards.length

  const counts = SLICES.map(s => ({
    ...s,
    count: taskCards.filter(c => getStatusKey(c) === s.key).length,
  }))

  const LATE_COLOR = '#d97706'
  const overdueCounts = SLICES.map(s => {
    const isDone = s.key === 'done'
    return {
      key: s.key + '_due',
      label: isDone ? 'Done · Completed Late' : s.label + ' · Past Due',
      color: isDone ? LATE_COLOR : OVERDUE_COLOR,
      count: isDone
        ? taskCards.filter(c => getStatusKey(c) === s.key && isCompletedLate(c)).length
        : taskCards.filter(c => getStatusKey(c) === s.key && isPastDue(c)).length,
    }
  })

  const size = 110
  const cx = size / 2
  const cy = size / 2
  const r = 38
  const circumference = 2 * Math.PI * r

  let cumulativePct = 0

  // Interleave: [To Do, To Do Due, In Progress, In Progress Due, Done, Done Due]
  const legendRows = SLICES.flatMap((s, i) => [counts[i], overdueCounts[i]])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="mb-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <span>📊</span> Task Overview
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {totalAllCards} card{totalAllCards !== 1 ? 's' : ''} across all columns
        </p>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="w-20 h-20 rounded-full border-8 border-dashed border-slate-200 flex items-center justify-center mb-3">
            <span className="text-xl">📋</span>
          </div>
          <p className="text-sm text-slate-400">No tracked tasks yet</p>
          <p className="text-xs text-slate-300 mt-0.5">Add task cards with status tracking on</p>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          {/* SVG Donut — 3 primary segments only */}
          <div className="shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
              {counts.map(item => {
                if (item.count === 0) return null
                const pct = (item.count / total) * 100
                const dashLen = (pct / 100) * circumference - 1.5
                const dashArray = `${dashLen} ${circumference}`
                const rotation = -90 + (cumulativePct / 100) * 360
                cumulativePct += pct
                return (
                  <circle
                    key={item.key}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="18"
                    strokeDasharray={dashArray}
                    transform={`rotate(${rotation} ${cx} ${cy})`}
                    strokeLinecap="butt"
                  />
                )
              })}
              <circle cx={cx} cy={cy} r={r - 10} fill="white" />
              <text x={cx} y={cy - 3} textAnchor="middle" fill="#0f172a" fontSize="15" fontWeight="800">{total}</text>
              <text x={cx} y={cy + 11} textAnchor="middle" fill="#94a3b8" fontSize="9">tasks</text>
            </svg>
          </div>

          {/* Legend — 6 rows, grouped in pairs */}
          <div className="flex flex-col gap-0 flex-1 min-w-0">
            {legendRows.map((item, i) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              const isFirstOfPair = i % 2 === 0
              const isOverdue = i % 2 === 1
              return (
                <div key={item.key}>
                  {isFirstOfPair && i > 0 && <div className="border-t border-slate-100 my-1.5" />}
                  <div className={isFirstOfPair ? 'mb-1' : 'mb-0'}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium" style={{ color: isOverdue ? item.color : '#475569' }}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: isOverdue ? item.color : '#1e293b' }}>
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
