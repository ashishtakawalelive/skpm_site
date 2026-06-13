import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import DashboardPreview from '../components/DashboardPreview'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  async function handleForgot(e) {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo })
    if (error) {
      setForgotError(error.message)
    } else {
      setForgotSent(true)
    }
    setForgotLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[58%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(155deg, #071528 0%, #0c1d3a 45%, #112750 100%)' }}
      >
        {/* SVG background: dot grid + abstract financial chart lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 900 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="skpm-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="0.9" fill="rgba(255,255,255,0.055)" />
            </pattern>
          </defs>

          {/* Dot grid */}
          <rect width="900" height="900" fill="url(#skpm-dots)" />

          {/* Subtle vertical grid lines */}
          <line x1="180" y1="0" x2="180" y2="900" stroke="rgba(255,255,255,0.028)" strokeWidth="1" />
          <line x1="360" y1="0" x2="360" y2="900" stroke="rgba(255,255,255,0.028)" strokeWidth="1" />
          <line x1="540" y1="0" x2="540" y2="900" stroke="rgba(255,255,255,0.028)" strokeWidth="1" />
          <line x1="720" y1="0" x2="720" y2="900" stroke="rgba(255,255,255,0.028)" strokeWidth="1" />

          {/* Subtle horizontal grid lines */}
          <line x1="0" y1="300" x2="900" y2="300" stroke="rgba(255,255,255,0.022)" strokeWidth="1" />
          <line x1="0" y1="520" x2="900" y2="520" stroke="rgba(255,255,255,0.022)" strokeWidth="1" />
          <line x1="0" y1="720" x2="900" y2="720" stroke="rgba(255,255,255,0.022)" strokeWidth="1" />

          {/* Primary chart area fill */}
          <polygon
            points="0,600 90,550 200,568 330,488 460,508 590,415 720,432 860,328 900,340 900,900 0,900"
            fill="rgba(37,99,235,0.065)"
          />
          {/* Primary chart line */}
          <polyline
            points="0,600 90,550 200,568 330,488 460,508 590,415 720,432 860,328 900,340"
            fill="none"
            stroke="rgba(96,165,250,0.32)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points on primary line */}
          <circle cx="90"  cy="550" r="4" fill="rgba(96,165,250,0.55)" />
          <circle cx="330" cy="488" r="4" fill="rgba(96,165,250,0.55)" />
          <circle cx="590" cy="415" r="4" fill="rgba(96,165,250,0.55)" />
          <circle cx="860" cy="328" r="4" fill="rgba(96,165,250,0.55)" />

          {/* Secondary chart area fill */}
          <polygon
            points="0,710 140,680 270,692 410,655 555,665 700,628 900,595 900,900 0,900"
            fill="rgba(99,102,241,0.038)"
          />
          {/* Secondary chart line */}
          <polyline
            points="0,710 140,680 270,692 410,655 555,665 700,628 900,595"
            fill="none"
            stroke="rgba(139,92,246,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Accent glow at bottom-right */}
          <radialGradient id="glow" cx="80%" cy="90%" r="35%">
            <stop offset="0%" stopColor="rgba(37,99,235,0.14)" />
            <stop offset="100%" stopColor="rgba(37,99,235,0)" />
          </radialGradient>
          <rect width="900" height="900" fill="url(#glow)" />
        </svg>

        {/* Back to main website */}
        <a
          href="/"
          className="absolute top-8 left-12 xl:left-16 z-20 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.95)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          <ArrowLeft size={16} />
          Back to Home
        </a>

        {/* Left panel content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">

          {/* Middle: main branding */}
          <div>
            <p
              className="text-xs font-semibold mb-4 tracking-widest uppercase"
              style={{ color: 'rgba(96,165,250,0.75)', letterSpacing: '0.18em' }}
            >
              Chartered Accountants
            </p>
            <h1
              className="font-bold text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.25rem)', letterSpacing: '-0.025em' }}
            >
              SKPM Client Dashboard
            </h1>
            <p
              className="text-sm leading-relaxed max-w-md mb-7"
              style={{ color: 'rgba(255,255,255,0.48)', lineHeight: '1.7' }}
            >
              Every task, deadline, and site visit - tracked in real time from one secure platform.
            </p>

            {/* Sample dashboard preview for visitors */}
            <div className="w-full">
              {/* Sample label */}
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full"
                  style={{
                    color: 'rgba(96,165,250,0.95)',
                    backgroundColor: 'rgba(96,165,250,0.1)',
                    border: '1px solid rgba(96,165,250,0.25)',
                    letterSpacing: '0.12em',
                  }}
                >
                  Sample Dashboard
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  A preview of the workspace your team receives
                </span>
              </div>

              <DashboardPreview />

              {/* Key benefits */}
              <div className="mt-5 space-y-2.5">
                {[
                  'Track every task, deadline, and site visit in real time.',
                  'A single secure, role-based platform for your entire team.',
                ].map(benefit => (
                  <div key={benefit} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: 'rgba(96,165,250,0.85)' }} />
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: copyright */}
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
            © {new Date().getFullYear()} SKPM Associates LLP. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-form-panel relative flex-1 flex items-center justify-center bg-white px-8 py-14">

        {/* Back to main website (mobile only — left panel is hidden < lg) */}
        <a
          href="/"
          className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Home
        </a>

        <div className="w-full max-w-[340px]">

          {/* Mobile-only brand (hidden on lg+) */}
          <div className="lg:hidden text-center mb-10">
            <p className="font-bold text-slate-900 text-lg">SKPM Client Dashboard</p>
            <p className="text-xs text-slate-500 mt-0.5">Chartered Accountants</p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2
              className="font-bold text-slate-900 mb-1.5"
              style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}
            >
              {showForgot ? 'Reset password' : 'Welcome back'}
            </h2>
            <p className="text-sm text-slate-500">
              {showForgot
                ? 'Enter your email to receive a reset link.'
                : 'Sign in to your SKPM account.'}
            </p>
          </div>

          {/* ── SIGN IN FORM ── */}
          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 transition-all duration-150 focus:outline-none"
                  style={{
                    borderColor: '#e2e8f0',
                    backgroundColor: '#f8fafc',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563eb'
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'
                    e.target.style.backgroundColor = '#fff'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.backgroundColor = '#f8fafc'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotEmail(email); setError('') }}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#2563eb' }}
                    onMouseEnter={e => e.target.style.color = '#1d4ed8'}
                    onMouseLeave={e => e.target.style.color = '#2563eb'}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-slate-900 transition-all duration-150 focus:outline-none"
                    style={{
                      borderColor: '#e2e8f0',
                      backgroundColor: '#f8fafc',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#2563eb'
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'
                      e.target.style.backgroundColor = '#fff'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                      e.target.style.backgroundColor = '#f8fafc'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg px-4 py-2.5 text-sm text-red-600"
                  style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 mt-1"
                style={{
                  background: loading
                    ? '#93c5fd'
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.3)',
                }}
                onMouseEnter={e => {
                  if (!loading) e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.42)'
                }}
                onMouseLeave={e => {
                  if (!loading) e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)'
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

          ) : forgotSent ? (
            /* ── RESET SENT ── */
            <div className="text-center py-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <span className="text-xl" style={{ color: '#16a34a' }}>✓</span>
              </div>
              <p className="font-semibold text-slate-900">Check your inbox</p>
              <p className="text-sm text-slate-500 mt-1.5">
                We sent a reset link to{' '}
                <strong className="text-slate-700 font-medium">{forgotEmail}</strong>
              </p>
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
                className="mt-6 text-sm font-medium transition-colors"
                style={{ color: '#2563eb' }}
                onMouseEnter={e => e.target.style.color = '#1d4ed8'}
                onMouseLeave={e => e.target.style.color = '#2563eb'}
              >
                ← Back to sign in
              </button>
            </div>

          ) : (
            /* ── FORGOT PASSWORD FORM ── */
            <form onSubmit={handleForgot} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 transition-all duration-150 focus:outline-none"
                  style={{
                    borderColor: '#e2e8f0',
                    backgroundColor: '#f8fafc',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563eb'
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'
                    e.target.style.backgroundColor = '#fff'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.backgroundColor = '#f8fafc'
                  }}
                />
              </div>

              {forgotError && (
                <div className="rounded-lg px-4 py-2.5 text-sm text-red-600"
                  style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  {forgotError}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                style={{
                  background: '#2563eb',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                }}
              >
                {forgotLoading ? 'Sending…' : 'Send reset link'}
              </button>

              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotError('') }}
                className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* Mobile-only sample dashboard preview (left panel is hidden < lg) */}
          <div className="lg:hidden mt-12">
            <span
              className="inline-block text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full mb-2.5"
              style={{
                color: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.2)',
                letterSpacing: '0.12em',
              }}
            >
              Sample Dashboard
            </span>
            <p className="text-sm font-semibold text-slate-900 mb-1">A preview of what your team receives</p>
            <p className="text-xs text-slate-500 mb-4">
              A live look at the workspace every SKPM client gets - tasks, deadlines, and site visits tracked in real time.
            </p>
            {/* The preview is dark-themed, so give it the same navy backdrop as the desktop panel */}
            <div
              className="rounded-2xl p-4 -mx-2"
              style={{ background: 'linear-gradient(155deg, #071528 0%, #0c1d3a 45%, #112750 100%)' }}
            >
              <DashboardPreview />
            </div>
            {/* Key benefits */}
            <div className="mt-4 space-y-2">
              {[
                'Track every task, deadline, and site visit in real time.',
                'A single secure, role-based platform for your entire team.',
              ].map(benefit => (
                <div key={benefit} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: '#2563eb' }} />
                  <p className="text-xs text-slate-500 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-slate-400 mt-10">
            © {new Date().getFullYear()} SKPM Associates LLP. All rights reserved.
          </p>
        </div>
      </div>

    </div>
  )
}
