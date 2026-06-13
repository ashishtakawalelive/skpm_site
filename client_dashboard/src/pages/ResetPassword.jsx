import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(async () => {
        await supabase.auth.signOut()
        navigate('/login')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Decorative floating aurora */}
      <div className="aurora-blob" style={{ width: 360, height: 360, top: '-90px', left: '-80px', background: '#60a5fa' }} />
      <div className="aurora-blob" style={{ width: 320, height: 320, bottom: '-100px', right: '-70px', background: '#a78bfa', animationDelay: '4s' }} />
      <div className="aurora-blob" style={{ width: 260, height: 260, top: '42%', right: '14%', background: '#5eead4', animationDelay: '8s' }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
              boxShadow: '0 12px 28px rgba(37,99,235,0.35)',
              border: '1px solid rgba(255,255,255,0.5)',
            }}
          >
            SK
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1e3a5f' }}>SKPM</h1>
          <p className="text-slate-500 text-sm mt-1">Set your new password</p>
        </div>

        <div className="glass-panel rounded-2xl p-8" style={{ boxShadow: '0 18px 48px rgba(15,23,42,0.12)' }}>
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">✓</span>
              </div>
              <p className="font-medium text-slate-900">Password updated!</p>
              <p className="text-sm text-slate-500 mt-1">Redirecting to login…</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Verifying reset link…</p>
              <p className="text-xs text-slate-400 mt-2">If nothing happens, the link may have expired. <button onClick={() => navigate('/login')} className="text-blue-600 underline">Go to login</button></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-sm text-red-700">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-all"
                style={{ backgroundColor: '#2563eb' }}
              >
                {loading ? 'Updating…' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
