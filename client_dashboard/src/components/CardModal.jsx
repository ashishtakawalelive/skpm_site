import { useState } from 'react'
import { X, User, CalendarDays, Plus, AlignLeft } from 'lucide-react'
import CardComments from './CardComments'

export default function CardModal({ card, columnName, onSave, onClose, canEdit = true }) {
  const existing = card?.data || {}
  const [cardType, setCardType]       = useState(existing.type || 'task')
  const [title, setTitle]             = useState(existing.title || '')
  const [content, setContent]         = useState(existing.content || '')
  const [details, setDetails]         = useState(existing.details || '')
  const [showDetails, setShowDetails] = useState(!!(existing.details))
  const [assignee, setAssignee]       = useState(existing.assignee || '')
  const [dueDate, setDueDate]         = useState(existing.due_date || '')
  const [status, setStatus]           = useState(card?.status || 'default')

  const isExisting = !!card?.id

  function handleSave() {
    const data = {
      type: cardType,
      title: title.trim(),
      ...(cardType === 'note' ? { content: content.trim() } : {}),
      ...(cardType === 'task' ? { details: details.trim() } : {}),
      has_assignee: true,
      assignee: assignee.trim(),
      has_status: true,
      due_date: cardType === 'task' && dueDate ? dueDate : '',
    }
    onSave({ data, status: isExisting ? card.status : status })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg shadow-2xl flex flex-col max-h-[92vh] rounded-t-2xl">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {!isExisting ? 'Add New Card' : canEdit ? 'Edit Card' : 'Card Details'}
            </h2>
            {columnName && <p className="text-xs text-slate-400 mt-0.5">in "{columnName}"</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-4">

          {/* ── Edit / Create mode ── */}
          {canEdit && (
            <>
              {/* Card type selector */}
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { value: 'task', label: '✅ Task' },
                  { value: 'note', label: '📝 Note / Document' },
                ].map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setCardType(t.value)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      cardType === t.value
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {cardType === 'task' ? 'Task Title' : 'Title'}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Note content */}
              {cardType === 'note' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Content
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Enter content or details"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  />
                </div>
              )}

              {/* Details toggle (task only) */}
              {cardType === 'task' && (
                <div>
                  {!showDetails ? (
                    <button
                      type="button"
                      onClick={() => setShowDetails(true)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Plus size={13} />
                      Add Details
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <AlignLeft size={12} />
                          Details
                        </label>
                        <button
                          type="button"
                          onClick={() => { setShowDetails(false); setDetails('') }}
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        autoFocus
                        rows={3}
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                        placeholder="Add any additional information about this task…"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Task-only options */}
              {cardType === 'task' && (
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/60 space-y-4">

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2.5">Assign To</p>
                    <input
                      type="text"
                      value={assignee}
                      onChange={e => setAssignee(e.target.value)}
                      placeholder="Enter assignee name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Due Date</p>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="mt-2.5 w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
                        className="mt-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Clear date
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── View-only mode (click-to-view or locked column) ── */}
          {!canEdit && isExisting && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-900 leading-snug">
                {existing.title || 'Untitled'}
              </h3>
              {existing.details && (
                <div className="flex gap-2 text-sm text-slate-600">
                  <AlignLeft size={13} className="shrink-0 text-slate-400 mt-0.5" />
                  <p className="leading-relaxed whitespace-pre-wrap">{existing.details}</p>
                </div>
              )}
              {existing.assignee && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <User size={13} className="shrink-0 text-slate-400" />
                  {existing.assignee}
                </div>
              )}
              {existing.due_date && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={13} className="shrink-0 text-slate-400" />
                  {new Date(existing.due_date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {existing.content && (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {existing.content}
                </p>
              )}
            </div>
          )}

          {/* ── Comments — shown for all existing cards ── */}
          {isExisting && (
            <div className="border-t border-slate-100 pt-4">
              <CardComments cardId={card.id} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          {canEdit ? (
            <>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors shadow-sm"
                style={{ backgroundColor: '#2563eb' }}
              >
                {isExisting ? 'Save Changes' : 'Add Card'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
