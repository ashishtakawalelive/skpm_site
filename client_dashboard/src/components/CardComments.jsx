import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCardComments } from '../hooks/useCardComments'

function formatTime(ts) {
  const d = new Date(ts)
  return (
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  )
}

export default function CardComments({ cardId }) {
  const { profile, isSKPM } = useAuth()
  const { comments, loading, addComment, deleteComment } = useCardComments(cardId)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    await addComment(text.trim(), profile?.name || 'Unknown')
    setText('')
    setSubmitting(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-slate-400" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Comments{comments.length > 0 ? ` (${comments.length})` : ''}
        </p>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-52 overflow-y-auto mb-3 pr-1">
        {loading && (
          <p className="text-xs text-slate-400 py-2">Loading comments…</p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-slate-400 py-2">No comments yet. Be the first to add one.</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-2.5 group">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ backgroundColor: '#2563eb' }}
            >
              {(c.user_name?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-slate-700">{c.user_name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{formatTime(c.created_at)}</span>
              </div>
              <div className="flex items-start justify-between gap-2 mt-0.5">
                <p className="text-sm text-slate-600 break-words leading-snug">{c.body}</p>
                {(isSKPM || c.user_id === profile?.id) && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-red-400 transition-all shrink-0 mt-0.5"
                    title="Delete comment"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment… (Enter to send)"
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-3 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-colors shrink-0"
          style={{ backgroundColor: '#2563eb' }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
