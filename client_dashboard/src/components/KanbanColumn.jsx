import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, MoreHorizontal, Edit2, Trash2, GripVertical, Lock, LockOpen, Info } from 'lucide-react'
import KanbanCard from './KanbanCard'

// Full column theme — each column is a colored swim-lane with its own identity
function getColumnTheme(name) {
  const n = name.toLowerCase()

  if (n.includes('progress') || n.includes('working') || n.includes('ongoing') || n.includes('active')) {
    return {
      accentColor:  '#b45309',
      dotColor:     '#f59e0b',
      columnBg:     'rgba(254,243,199,0.32)',
      headerBg:     'rgba(253,230,138,0.42)',
      headerBorder: 'rgba(251,191,36,0.22)',
      topBorder:    '#f59e0b',
      cardZoneBg:   'rgba(254,249,217,0.18)',
      dropBg:       'rgba(253,230,138,0.38)',
      dropOutline:  '#fbbf24',
      columnBorder: 'rgba(251,191,36,0.18)',
    }
  }

  if (n.includes('done') || n.includes('complete') || n.includes('finish') || n.includes('closed') || n.includes('approved')) {
    return {
      accentColor:  '#065f46',
      dotColor:     '#10b981',
      columnBg:     'rgba(209,250,229,0.32)',
      headerBg:     'rgba(167,243,208,0.42)',
      headerBorder: 'rgba(52,211,153,0.22)',
      topBorder:    '#10b981',
      cardZoneBg:   'rgba(220,252,231,0.18)',
      dropBg:       'rgba(167,243,208,0.38)',
      dropOutline:  '#34d399',
      columnBorder: 'rgba(52,211,153,0.18)',
    }
  }

  if (n.includes('overdue') || n.includes('delay') || n.includes('hold') || n.includes('block') || n.includes('issue')) {
    return {
      accentColor:  '#991b1b',
      dotColor:     '#ef4444',
      columnBg:     'rgba(254,226,226,0.32)',
      headerBg:     'rgba(254,202,202,0.42)',
      headerBorder: 'rgba(248,113,113,0.22)',
      topBorder:    '#ef4444',
      cardZoneBg:   'rgba(255,237,237,0.18)',
      dropBg:       'rgba(254,202,202,0.38)',
      dropOutline:  '#f87171',
      columnBorder: 'rgba(248,113,113,0.18)',
    }
  }

  if (n.includes('review') || n.includes('pending') || n.includes('waiting') || n.includes('approval')) {
    return {
      accentColor:  '#5b21b6',
      dotColor:     '#8b5cf6',
      columnBg:     'rgba(237,233,254,0.32)',
      headerBg:     'rgba(221,214,254,0.42)',
      headerBorder: 'rgba(167,139,250,0.22)',
      topBorder:    '#8b5cf6',
      cardZoneBg:   'rgba(245,243,255,0.18)',
      dropBg:       'rgba(221,214,254,0.38)',
      dropOutline:  '#a78bfa',
      columnBorder: 'rgba(167,139,250,0.18)',
    }
  }

  // Default — blue (To Do, etc.)
  return {
    accentColor:  '#1d4ed8',
    dotColor:     '#3b82f6',
    columnBg:     'rgba(219,234,254,0.32)',
    headerBg:     'rgba(191,219,254,0.42)',
    headerBorder: 'rgba(147,197,253,0.22)',
    topBorder:    '#3b82f6',
    cardZoneBg:   'rgba(239,246,255,0.18)',
    dropBg:       'rgba(191,219,254,0.38)',
    dropOutline:  '#93c5fd',
    columnBorder: 'rgba(147,197,253,0.18)',
  }
}

export default function KanbanColumn({
  column, cards, isSKPM,
  onAddCard, onEditCard, onDeleteCard, onViewCard,
  onDeleteColumn, onRenameColumn, onToggleLock,
  onCardContextMenu,
}) {
  const isClientLocked = column.is_locked && !isSKPM
  const isTodoColumn = column.name.toLowerCase().includes('to do')
  const theme = getColumnTheme(column.name)

  const {
    setNodeRef: setSortableRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${column.id}`,
    data: { type: 'column-drop', columnId: column.id },
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(column.name)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function saveName() {
    const trimmed = nameVal.trim()
    if (trimmed && trimmed !== column.name) await onRenameColumn(column.id, trimmed)
    setEditingName(false)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    // Outer wrapper = the colored swim-lane
    <div
      ref={setSortableRef}
      style={{
        ...style,
        background: theme.columnBg,
        border: `1px solid ${theme.columnBorder}`,
        borderRadius: '16px',
        padding: '10px',
        boxShadow: '0 2px 12px rgba(15,23,42,0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      className="kanban-column flex-1 min-w-[80vw] sm:min-w-[200px] sm:max-w-[360px]"
    >

      {/* ── Column Header ── */}
      <div
        className="flex items-center justify-between mb-3 px-3 py-2.5 gap-1"
        style={{
          background: theme.headerBg,
          borderRadius: '10px',
          borderTop: `3px solid ${theme.topBorder}`,
          border: `1px solid ${theme.headerBorder}`,
          borderTopWidth: '3px',
          borderTopColor: theme.topBorder,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {isSKPM && !editingName && (
          <div
            {...attributes}
            {...listeners}
            className="p-0.5 cursor-grab active:cursor-grabbing shrink-0 opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: theme.accentColor }}
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </div>
        )}

        {editingName ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveName()
                if (e.key === 'Escape') setEditingName(false)
              }}
              onBlur={saveName}
              className="flex-1 px-2.5 py-1 rounded-md border text-sm font-semibold focus:outline-none focus:ring-2 bg-white"
              style={{ borderColor: theme.topBorder, color: '#1e293b' }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="shrink-0 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme.dotColor, boxShadow: `0 0 0 3px ${theme.dotColor}28` }}
            />
            <h3
              className="font-bold text-sm truncate"
              style={{ color: theme.accentColor, letterSpacing: '-0.01em' }}
            >
              {column.name}
            </h3>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full shrink-0 font-semibold"
              style={{
                background: 'rgba(255,255,255,0.75)',
                color: theme.accentColor,
                border: `1px solid ${theme.headerBorder}`,
              }}
            >
              {cards.length}
            </span>
            {column.is_locked && (
              <Lock size={11} className="shrink-0" style={{ color: theme.accentColor, opacity: 0.5 }} title="Column locked" />
            )}
            {isTodoColumn && (
              <div className="relative group shrink-0">
                <Info size={12} style={{ color: theme.accentColor, opacity: 0.55 }} className="cursor-default" />
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 px-3 py-2 rounded-lg shadow-lg text-xs text-center pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: '#1e3a5f', color: '#fff' }}
                >
                  Drag cards to change their status
                </div>
              </div>
            )}
          </div>
        )}

        {isSKPM && !editingName && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-1 rounded-md transition-all duration-150 opacity-40 hover:opacity-80"
              style={{ color: theme.accentColor }}
              title="Column options"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl overflow-hidden z-30"
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.14)', border: '1px solid #f1f5f9' }}
              >
                <button
                  onClick={() => { setEditingName(true); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  style={{ color: '#475569' }}
                >
                  <Edit2 size={13} style={{ color: '#94a3b8' }} />
                  Rename Column
                </button>
                <button
                  onClick={() => { onToggleLock(column.id, !column.is_locked); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  style={{ color: '#475569' }}
                >
                  {column.is_locked
                    ? <><LockOpen size={13} style={{ color: '#94a3b8' }} />Unlock Column</>
                    : <><Lock size={13} style={{ color: '#94a3b8' }} />Lock Column</>
                  }
                </button>
                <div className="border-t border-slate-100" />
                <button
                  onClick={() => { onDeleteColumn(column.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={13} />
                  Delete Column
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Cards Drop Zone ── */}
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setDropRef}
          className="min-h-28 rounded-xl p-2 space-y-2.5 transition-all duration-200"
          style={{
            background: (!isClientLocked && isOver) ? theme.dropBg : theme.cardZoneBg,
            border: (!isClientLocked && isOver)
              ? `2px dashed ${theme.dropOutline}`
              : '2px dashed transparent',
            borderRadius: '10px',
          }}
        >
          {cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onView={onViewCard}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              isSKPM={isSKPM}
              isLocked={!!column.is_locked}
              onCardContextMenu={onCardContextMenu}
            />
          ))}

          {cards.length === 0 && !isOver && (
            <div className="flex items-center justify-center py-8">
              {isClientLocked
                ? <p className="text-xs font-medium" style={{ color: theme.accentColor, opacity: 0.4 }}>🔒 Locked</p>
                : <p className="text-xs font-medium" style={{ color: theme.accentColor, opacity: 0.4 }}>Drop cards here</p>
              }
            </div>
          )}
        </div>
      </SortableContext>

      {/* ── Add Card — To Do columns only ── */}
      {!isClientLocked && isTodoColumn && (
        <button
          onClick={() => onAddCard(column)}
          className="mt-2 w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            color: theme.accentColor,
            opacity: 0.65,
            border: `1.5px dashed ${theme.topBorder}`,
            background: 'rgba(255,255,255,0.4)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'rgba(255,255,255,0.7)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.65'
            e.currentTarget.style.background = 'rgba(255,255,255,0.4)'
          }}
        >
          <Plus size={13} />
          Add Card
        </button>
      )}
    </div>
  )
}
