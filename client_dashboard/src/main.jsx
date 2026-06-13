import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Password-recovery self-heal.
// Supabase can drop the `/reset-password` path and land the recovery token
// (or an `otp_expired` error) on the dashboard root — e.g. when the redirect
// URL isn't in the allow-list, it falls back to the Site URL. Detect those
// params anywhere and re-route to /reset-password, preserving the token/error,
// before React Router mounts so the reset screen always handles them.
;(function rerouteRecovery() {
  const base = '/client-dashboard'
  const { pathname, hash, search } = window.location
  const carrier = `${hash} ${search}`
  const isRecovery =
    /type=recovery/.test(carrier) ||
    /token_hash=/.test(search) ||
    /error_code=|error=access_denied/.test(carrier)
  const alreadyThere = pathname.replace(/\/$/, '').endsWith('/reset-password')
  if (isRecovery && !alreadyThere) {
    window.history.replaceState(null, '', `${base}/reset-password${search}${hash}`)
  }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
