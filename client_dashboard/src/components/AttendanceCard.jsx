import { useState, useEffect } from 'react'
import { Plus, MapPin, User, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function AttendanceCard({ client, isSKPM, month, year }) {
  const { profile } = useAuth()
  const [visits, setVisits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ visited_by: profile?.name || '', location: '', note: '' })

  useEffect(() => {
    fetchVisits()
  }, [client.id, month, year])

  async function fetchVisits() {
    setLoading(true)
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('client_id', client.id)
      .eq('month', month)
      .eq('year', year)
      .order('visited_at', { ascending: false })

    if (!error) setVisits(data)
    setLoading(false)
  }

  async function handleLogVisit(e) {
    e.preventDefault()
    if (!form.visited_by.trim() || !form.location.trim()) return
    setSubmitting(true)

    const { error } = await supabase.from('visits').insert({
      client_id: client.id,
      visited_by: form.visited_by.trim(),
      location: form.location.trim(),
      note: form.note.trim(),
      visited_at: new Date().toISOString(),
      month,
      year,
    })

    if (!error) {
      await fetchVisits()
      setShowForm(false)
      setForm(f => ({ ...f, location: '', note: '' }))
    }
    setSubmitting(false)
  }

  const target = client.attendance_target || 20
  const completed = visits.length
  const percentage = Math.min((completed / target) * 100, 100)
  const lastVisit = visits[0]

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthName = monthNames[month - 1]

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="glass-dark glass-hover rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(96,165,250,0.16)' }}>
            <Calendar size={16} className="text-blue-300" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">
              Attendance - {monthName} {year}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {completed} of {target} visits completed
            </p>
          </div>
        </div>
        {isSKPM && (
          <button
            onClick={() => setShowForm(s => !s)}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
          >
            <Plus size={14} />
            Log Visit
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              background: percentage >= 100
                ? 'linear-gradient(90deg, #34d399, #10b981)'
                : percentage >= 60
                  ? 'linear-gradient(90deg, #60a5fa, #2563eb)'
                  : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              boxShadow: percentage > 0 ? 'inset 0 1px 0 rgba(255,255,255,0.35)' : 'none',
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>0</span>
          <span className="font-semibold" style={{ color: percentage >= 100 ? '#34d399' : '#93c5fd' }}>
            {percentage.toFixed(0)}%
          </span>
          <span>{target}</span>
        </div>
      </div>

      {/* Last Visit Info */}
      {lastVisit && (
        <div className="rounded-xl p-3 text-sm mb-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Last Visit</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
            <span className="flex items-center gap-1">
              <User size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
              {lastVisit.visited_by}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
              {lastVisit.location}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDate(lastVisit.visited_at)}</span>
          </div>
          {lastVisit.note && (
            <p className="text-xs mt-1 italic" style={{ color: 'rgba(255,255,255,0.5)' }}>"{lastVisit.note}"</p>
          )}
        </div>
      )}

      {/* Log Visit Form */}
      {showForm && (
        <form onSubmit={handleLogVisit} className="pt-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Visited By</label>
              <input
                required
                type="text"
                value={form.visited_by}
                onChange={e => setForm(f => ({ ...f, visited_by: e.target.value }))}
                placeholder="Your name"
                className="input-dark w-full px-3 py-2 rounded-lg text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Location</label>
              <input
                required
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Office, Client Site…"
                className="input-dark w-full px-3 py-2 rounded-lg text-sm transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Note (optional)</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Brief note about the visit"
              className="input-dark w-full px-3 py-2 rounded-lg text-sm transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Logging…' : 'Log Visit'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
