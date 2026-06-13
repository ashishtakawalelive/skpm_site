import { useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit2, Trash2, User, CalendarDays } from 'lucide-react'

const STATUS_BORDER = {
  default:     'border-l-[#2563eb]',
  in_progress: 'border-l-[#f59e0b]',
  done:        'border-l-[#10b981]',
  overdue:     'border-l-[#ef4444]',
}

const STATUS_BADGE = {
  default:     { label: 'To Do',       bg: '#eff6ff', color: '#2563eb'  },
  in_progress: { label: 'In Progress', bg: '#fffbeb', color: '#d97706'  },
  done:        { label: 'Done',        bg: '#ecfdf5', color: '#059669'  },
  overdue:     { label: 'Overdue',     bg: '#fef2f2', color: '#dc2626'  },
}

export default function KanbanCard({ card, onView, onEdit, onDelete, isSKPM, isLocked, onCardContextMenu }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
    disabled: !!isLocked && !isSKPM,
  })

  // Prevent a card click from firing right after a drag ends
  const wasDragging = useRef(false)
  useEffect(() => {
    if (isDragging) wasDragging.current = true
  }, [isDragging])

  function handleContextMenu(e) {
    e.preventDefault()
    e.stopPropagation()
    onCardContextMenu?.(card, e.clientX, e.clientY)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const data = card.data || {}
  const isNote = data.type === 'note'
  const borderClass = STATUS_BORDER[card.status] || STATUS_BORDER.default
  const badge = STATUS_BADGE[card.status] || STATUS_BADGE.default

  // Due date color coding
  let dueDateColor = '#64748b'
  let dueDateBg = 'transparent'
  const dueDate = !isNote && data.due_date ? data.due_date : null
  let isPastDue = false
  if (dueDate) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate + 'T12:00:00')
    const diffDays = Math.ceil((due - today) / 86400000)
    if (diffDays < 0 && card.status !== 'done') { dueDateColor = '#dc2626'; dueDateBg = '#fef2f2'; isPastDue = true }
    else if (diffDays <= 3 && card.status !== 'done') { dueDateColor = '#d97706'; dueDateBg = '#fffbeb' }
  }

  // Late completion: done card where completed_at is after due_date
  let daysLate = 0
  if (card.status === 'done' && card.completed_at && dueDate) {
    daysLate = Math.ceil((new Date(card.completed_at) - new Date(dueDate + 'T23:59:59')) / 86400000)
    if (daysLate < 0) daysLate = 0
  }

  const isActiveStatus = card.status === 'default' || card.status === 'in_progress'
  const cardBg = isActiveStatus && isPastDue ? 'rgba(255,228,228,0.92)' : 'rgba(255,255,255,0.88)'

  function handleCardClick() {
    if (wasDragging.current) { wasDragging.current = false; return }
    onView?.(card)
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ ...style, boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.07)', backgroundColor: cardBg }}
      className={`rounded-xl border border-white/70 border-l-4 p-4 group relative cursor-grab active:cursor-grabbing ${borderClass} ${
        isDragging ? 'rotate-1' : 'hover:shadow-md hover:-translate-y-0.5'
      } transition-all duration-200`}
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
    >
      {/* Drag handle indicator (visual only) */}
      <div className="absolute left-1.5 top-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical size={13} />
      </div>

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug line-clamp-3" style={{ color: '#1e293b' }}>
            {data.title || 'Untitled'}
          </p>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {(isSKPM || !isLocked) && (
              <button
                onClick={e => { e.stopPropagation(); onEdit(card) }}
                className="p-1 rounded-md transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                title="Edit card"
              >
                <Edit2 size={12} />
              </button>
            )}
            {isSKPM && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(card.id) }}
                className="p-1 rounded-md transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = '' }}
                title="Delete card"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Note content preview */}
        {isNote && data.content && (
          <p className="text-xs mt-1.5 line-clamp-2" style={{ color: '#64748b' }}>{data.content}</p>
        )}

        {/* Details preview (task only) */}
        {!isNote && data.details && (
          <p className="text-xs mt-1.5 line-clamp-2" style={{ color: '#64748b' }}>{data.details}</p>
        )}

        {/* Assignee */}
        {!isNote && data.has_assignee && data.assignee && (
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#64748b' }}>
            <span
              className="flex items-center justify-center w-[18px] h-[18px] rounded-full text-white font-bold shrink-0 select-none"
              style={{ fontSize: '9px', background: 'linear-gradient(135deg, #64748b, #475569)' }}
            >
              {data.assignee.trim()[0]?.toUpperCase() || <User size={9} />}
            </span>
            <span className="truncate">{data.assignee}</span>
          </div>
        )}

        {/* Due date */}
        {dueDate && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div
              className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md w-fit font-medium"
              style={{ color: dueDateColor, backgroundColor: dueDateBg }}
            >
              <CalendarDays size={11} />
              {new Date(dueDate + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {daysLate > 0 && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600">
                {daysLate}d late
              </span>
            )}
          </div>
        )}

        {/* Status badge */}
        {!isNote && data.has_status && (
          <div className="mt-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: badge.bg, color: badge.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.color }} />
              {badge.label}
            </span>
          </div>
        )}
      </div>

    </div>
  )
}
