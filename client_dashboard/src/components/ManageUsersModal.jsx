import { useState, useEffect } from 'react'
import { X, Mail, Loader2, CheckCircle2, RefreshCw, Trash2, AlertTriangle, Pencil, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABEL = {
  skpm_admin: 'Admin',
  skpm_staff: 'Staff',
  client: 'Client',
}
// Admin display names are frozen to start with this word.
const ADMIN_PREFIX = 'Admin'
const ROLE_COLOR = {
  skpm_admin: 'bg-purple-100 text-purple-700',
  skpm_staff: 'bg-blue-100 text-blue-700',
  client: 'bg-slate-100 text-slate-600',
}

export default function ManageUsersModal({ onClose, clients }) {
  const { session } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [resetSent, setResetSent] = useState({}) // userId → true
  const [confirmUser, setConfirmUser] = useState(null) // user pending delete confirmation
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [editingId, setEditingId] = useState(null) // user being renamed
  const [editValue, setEditValue] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')
      if (!error) setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  async function sendResetLink(user) {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo })
    if (!error) {
      setResetSent(prev => ({ ...prev, [user.id]: true }))
    } else {
      alert(`Failed to send reset link: ${error.message}`)
    }
  }

  async function deleteUser(user) {
    setDeletingId(user.id)
    setDeleteError('')
    try {
      const { error } = await supabase.rpc('delete_user', { target_user_id: user.id })
      if (error) {
        setDeleteError(error.message || 'Failed to delete user')
      } else {
        setUsers(prev => prev.filter(u => u.id !== user.id))
        setConfirmUser(null)
      }
    } catch (err) {
      setDeleteError(`Network error: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  function startEdit(user) {
    setEditError('')
    // For admins, the "Admin" prefix is frozen — only edit the remainder.
    const editable = user.role === 'skpm_admin'
      ? user.name.replace(new RegExp(`^${ADMIN_PREFIX}\\s*`, 'i'), '')
      : user.name
    setEditValue(editable)
    setEditingId(user.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
    setEditError('')
  }

  async function saveName(user) {
    const trimmed = editValue.trim()
    const newName = user.role === 'skpm_admin'
      ? `${ADMIN_PREFIX} ${trimmed}`.trim()
      : trimmed

    if (!newName || (user.role === 'skpm_admin' && !trimmed)) {
      setEditError('Name cannot be empty')
      return
    }

    setSavingName(true)
    setEditError('')
    const { error } = await supabase
      .from('users')
      .update({ name: newName })
      .eq('id', user.id)
    setSavingName(false)

    if (error) {
      setEditError(error.message || 'Failed to save')
    } else {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, name: newName } : u)))
      cancelEdit()
    }
  }

  function getClientName(clientId) {
    return clients.find(c => c.id === clientId)?.name || '-'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-semibold text-slate-900">Manage Users</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    {editingId === user.id ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          {user.role === 'skpm_admin' && (
                            <span className="text-sm font-medium text-slate-400 shrink-0 select-none" title="This word is fixed for admins">
                              {ADMIN_PREFIX}
                            </span>
                          )}
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveName(user)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            placeholder={user.role === 'skpm_admin' ? 'rest of name' : 'name'}
                            className="min-w-0 flex-1 text-sm font-medium text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                          />
                          <button
                            onClick={() => saveName(user)}
                            disabled={savingName}
                            className="flex items-center justify-center p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shrink-0"
                            title="Save"
                          >
                            {savingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={savingName}
                            className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-60 shrink-0"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {editError && <p className="text-xs text-red-600 mt-1">{editError}</p>}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[user.role]}`}>
                            {ROLE_LABEL[user.role]}
                          </span>
                          <button
                            onClick={() => startEdit(user)}
                            className="flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit name"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
                        {user.role === 'client' && user.client_id && (
                          <p className="text-xs text-slate-400 mt-0.5">{getClientName(user.client_id)}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 shrink-0 ${editingId === user.id ? 'hidden' : ''}`}>
                    <button
                      onClick={() => sendResetLink(user)}
                      disabled={!!resetSent[user.id]}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-60"
                      style={resetSent[user.id] ? { borderColor: '#bbf7d0', color: '#15803d', backgroundColor: '#f0fdf4' } : { borderColor: '#e2e8f0', color: '#475569' }}
                      title="Send password reset email"
                    >
                      {resetSent[user.id] ? (
                        <><CheckCircle2 size={12} /> Sent</>
                      ) : (
                        <><RefreshCw size={12} /> Reset Password</>
                      )}
                    </button>
                    {session?.user?.id !== user.id && user.role !== 'skpm_admin' && (
                      <button
                        onClick={() => { setDeleteError(''); setConfirmUser(user) }}
                        className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <p className="text-xs text-slate-400 flex items-start gap-1.5">
            <Mail size={12} className="mt-0.5 shrink-0" />
            "Reset Password" sends a link to the user's email. They click it to set a new password.
          </p>
        </div>
      </div>

      {confirmUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget && !deletingId) setConfirmUser(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">Delete user?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This permanently removes <span className="font-medium text-slate-700">{confirmUser.name}</span> ({confirmUser.email}) and their login. This cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <p className="text-xs text-red-600 mt-3">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmUser(null)}
                disabled={!!deletingId}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(confirmUser)}
                disabled={!!deletingId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId ? (
                  <><Loader2 size={14} className="animate-spin" /> Deleting…</>
                ) : (
                  <><Trash2 size={14} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
