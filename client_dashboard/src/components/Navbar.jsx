import { LogOut, ChevronDown, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useClient } from '../contexts/ClientContext'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoSrc from '../../images/s-k-p-m-associates-llp-chartered-accountants-1.png'

export default function Navbar() {
  const { profile, signOut, isSKPM, isAdmin } = useAuth()
  const { clients, selectedClientId, setSelectedClientId } = useClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const selectedClient = clients.find(c => c.id === selectedClientId)

  return (
    <nav
      data-export-nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.5)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">

        {/* Logo — full colour on the light glass bar, matching the website */}
        <a href="/" className="flex items-center shrink-0 group" title="Go to SKPM website">
          <img
            src={logoSrc}
            alt="SKPM"
            className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </a>

        {/* Client Selector - center (SKPM staff/admin only) */}
        {isSKPM && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[160px] justify-between"
              style={{
                background: 'rgba(13,71,161,0.06)',
                border: '1px solid rgba(13,71,161,0.16)',
                color: '#0d47a1',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(13,71,161,0.11)'
                e.currentTarget.style.borderColor = 'rgba(13,71,161,0.28)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(13,71,161,0.06)'
                e.currentTarget.style.borderColor = 'rgba(13,71,161,0.16)'
              }}
            >
              <span className="truncate max-w-[160px]">
                {selectedClient ? selectedClient.name : 'Select Client'}
              </span>
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                style={{ color: 'rgba(13,71,161,0.55)' }}
              />
            </button>

            {dropdownOpen && (
              <div className="modal-enter absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
                style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
                {clients.length === 0 ? (
                  <p className="text-sm text-slate-500 px-4 py-3">No clients yet</p>
                ) : (
                  clients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => { setSelectedClientId(client.id); setDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        client.id === selectedClientId
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {client.name}
                    </button>
                  ))
                )}
                {isAdmin && (
                  <>
                    <div className="border-t border-slate-100" />
                    <Link
                      to="/clients"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                    >
                      <Users size={14} />
                      Manage Clients
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Client role: show their client name */}
        {!isSKPM && selectedClient && (
          <span className="text-sm font-semibold" style={{ color: '#0d47a1' }}>
            {selectedClient?.name}
          </span>
        )}

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {/* Avatar initials */}
          <div
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-xs font-bold text-white shrink-0 select-none"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1e3a5f 100%)',
              boxShadow: '0 2px 6px rgba(13,71,161,0.3)',
            }}
            title={profile?.name}
          >
            {(profile?.name || '?')
              .split(' ')
              .map(w => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none" style={{ color: '#1e293b' }}>
              {profile?.name}
            </p>
            <p className="text-xs mt-0.5 capitalize" style={{ color: '#64748b' }}>
              {profile?.role?.replace('_', ' ')}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7" style={{ background: 'rgba(15,23,42,0.10)' }} />

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#64748b' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#0d47a1'
              e.currentTarget.style.background = 'rgba(13,71,161,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#64748b'
              e.currentTarget.style.background = 'transparent'
            }}
            title="Sign out"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>

      {/* Brand accent line — absolute so the nav stays exactly h-16 (the board toolbar is sticky at top-16) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #1e3a5f 0%, #2563eb 40%, #8b5cf6 75%, #14b8a6 100%)', opacity: 0.55 }}
      />

      {/* Click-outside overlay to close dropdown */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </nav>
  )
}
