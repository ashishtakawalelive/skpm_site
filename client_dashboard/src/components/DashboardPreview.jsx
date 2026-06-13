import { Calendar, LayoutList, User, MapPin, CalendarDays } from 'lucide-react'

// Static marketing preview of a client dashboard, shown to visitors on the
// login page. All content is fictional ("Horizon Industries (Sample)") and
// hardcoded — no Supabase, no contexts, no drag-and-drop.

const STATUS_BADGE = {
  default:     { label: 'To Do',       bg: '#eff6ff', color: '#2563eb' },
  in_progress: { label: 'In Progress', bg: '#fffbeb', color: '#d97706' },
  done:        { label: 'Done',        bg: '#ecfdf5', color: '#059669' },
}

const STATUS_BORDER = {
  default:     '#2563eb',
  in_progress: '#f59e0b',
  done:        '#10b981',
}

const COLUMNS = [
  {
    name: 'To Do',
    dot: '#3b82f6',
    cards: [
      { title: 'GSTR-3B Filing - June',        status: 'default', due: '20 Jun' },
      { title: 'Advance Tax Computation Q1',   status: 'default', due: '15 Jun' },
    ],
  },
  {
    name: 'In Progress',
    dot: '#f59e0b',
    cards: [
      { title: 'TDS Return 24Q - FY 25-26',    status: 'in_progress', due: '31 Jul' },
      { title: 'Statutory Audit Preparation',  status: 'in_progress', due: '30 Sep' },
    ],
  },
  {
    name: 'Completed',
    dot: '#22c55e',
    cards: [
      { title: 'ITR Filing - FY 2024-25',      status: 'done', due: '31 May' },
      { title: 'ROC Annual Return (AOC-4)',    status: 'done', due: '28 May' },
      { title: 'Bank Reconciliation - May',    status: 'done', due: '10 Jun' },
    ],
  },
]

const DONUT_STATS = [
  { label: 'To Do',       count: 2, color: '#3b82f6', textColor: '#93c5fd', pill: 'on track' },
  { label: 'In Progress', count: 2, color: '#f59e0b', textColor: '#fcd34d', pill: 'on track' },
  { label: 'Completed',   count: 3, color: '#22c55e', textColor: '#86efac', pill: 'on time' },
]

function MiniDonut() {
  const size = 64, cx = 32, cy = 32, r = 23
  const circumference = 2 * Math.PI * r
  const total = DONUT_STATS.reduce((s, i) => s + i.count, 0)
  let cum = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
      {DONUT_STATS.map(item => {
        const pct = (item.count / total) * 100
        const dash = (pct / 100) * circumference - 1.2
        const rot = -90 + (cum / 100) * 360
        cum += pct
        return (
          <circle
            key={item.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={item.color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(${rot} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        )
      })}
      <text x={cx} y={cy - 1} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">{total}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6">tasks</text>
    </svg>
  )
}

export default function DashboardPreview() {
  return (
    <div>
      {/* App window frame */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 50px rgba(2,8,23,0.55)',
        }}
      >
        {/* Chrome / toolbar bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.09)' }}
        >
          <span className="text-xs font-semibold text-white">Horizon Industries (Sample)</span>
          <span
            className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-md"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
          >
            <Calendar size={10} />
            Jun 2026
          </span>
        </div>

        <div className="p-3 space-y-3">
          {/* Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Attendance mini-card */}
            <div className="glass-dark rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(96,165,250,0.16)' }}>
                  <Calendar size={11} className="text-blue-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white leading-tight">Attendance - Jun 2026</p>
                  <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>14 of 20 visits completed</p>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '70%',
                    background: 'linear-gradient(90deg, #60a5fa, #2563eb)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>0</span>
                <span className="font-semibold" style={{ color: '#93c5fd' }}>70%</span>
                <span>20</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <span className="flex items-center gap-1">
                  <User size={9} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  R. Sharma
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={9} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  Client Site
                </span>
              </div>
            </div>

            {/* Task summary mini-card */}
            <div className="glass-dark rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(96,165,250,0.16)' }}>
                  <LayoutList size={11} className="text-blue-300" />
                </div>
                <p className="text-[11px] font-semibold text-white">Task Summary</p>
              </div>
              <div className="flex items-center gap-3">
                <MiniDonut />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {DONUT_STATS.map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-medium flex-1 truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.label}</span>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: item.textColor }}>{item.count}</span>
                      <span
                        className="hidden xl:inline text-[8px] px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                      >
                        {item.pill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mini Kanban board */}
          <div className="grid grid-cols-3 gap-2.5">
            {COLUMNS.map(col => (
              <div key={col.name} className="min-w-0">
                {/* Column header */}
                <div className="flex items-center gap-1.5 mb-2 px-0.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.dot }} />
                  <span className="text-[10px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{col.name}</span>
                  <span
                    className="text-[8px] font-semibold px-1 rounded-full shrink-0"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    {col.cards.length}
                  </span>
                </div>
                {/* Cards */}
                <div className="space-y-1.5">
                  {col.cards.map(card => {
                    const badge = STATUS_BADGE[card.status]
                    return (
                      <div
                        key={card.title}
                        className="rounded-lg p-2"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          borderLeft: `3px solid ${STATUS_BORDER[card.status]}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                        }}
                      >
                        <p className="text-[10px] font-semibold leading-snug line-clamp-2" style={{ color: '#1e293b' }}>
                          {card.title}
                        </p>
                        <div className="flex items-center justify-between gap-1 mt-1.5">
                          <span
                            className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full truncate"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                          <span className="hidden sm:flex items-center gap-0.5 text-[8px] shrink-0" style={{ color: '#64748b' }}>
                            <CalendarDays size={8} />
                            {card.due}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Sample preview - every SKPM client gets a private, always-on dashboard tracking tasks, deadlines and site visits as they happen.
      </p>
    </div>
  )
}
