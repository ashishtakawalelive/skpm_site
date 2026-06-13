import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit2, X, Check, Users, Settings } from 'lucide-react'
import { useClient } from '../contexts/ClientContext'
import { useAuth } from '../contexts/AuthContext'
import CreateUserModal from '../components/CreateUserModal'
import ManageUsersModal from '../components/ManageUsersModal'

export default function Clients() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { clients, createClient, updateClient, deleteClient, setSelectedClientId } = useClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showUserModal, setShowUserModal] = useState(false)
  const [showManageUsers, setShowManageUsers] = useState(false)
  const [form, setForm] = useState({ name: '', attendance_enabled: false, attendance_target: 20, task_chart_enabled: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    const { error } = await createClient(form.name.trim(), form.attendance_enabled, Number(form.attendance_target), form.task_chart_enabled)
    if (error) setError(error.message)
    else {
      setForm({ name: '', attendance_enabled: false, attendance_target: 20, task_chart_enabled: false })
      setShowCreate(false)
    }
    setSaving(false)
  }

  function startEdit(client) {
    setEditingId(client.id)
    setEditValues({ name: client.name, attendance_enabled: client.attendance_enabled, attendance_target: client.attendance_target, task_chart_enabled: !!client.task_chart_enabled })
  }

  async function saveEdit(id) {
    setSaving(true)
    await updateClient(id, {
      name: editValues.name,
      attendance_enabled: editValues.attendance_enabled,
      attendance_target: Number(editValues.attendance_target),
      task_chart_enabled: editValues.task_chart_enabled,
    })
    setEditingId(null)
    setSaving(false)
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete client "${name}"? This will remove all their data.`)) return
    const { error } = await deleteClient(id)
    if (error) alert(error.message)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowManageUsers(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings size={15} />
              Manage Users
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Users size={15} />
              Add User
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#2563eb' }}
            >
              <Plus size={15} />
              New Client
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-panel rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">New Client</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Mehta Industries"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.attendance_enabled}
                    onChange={e => setForm(f => ({ ...f, attendance_enabled: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-700">Enable Attendance Tracking</span>
                </label>
                {form.attendance_enabled && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-700">Monthly Target</label>
                    <input
                      type="number"
                      min="1"
                      value={form.attendance_target}
                      onChange={e => setForm(f => ({ ...f, attendance_target: e.target.value }))}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.task_chart_enabled}
                  onChange={e => setForm(f => ({ ...f, task_chart_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">Show Task Overview Chart</span>
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-colors"
                style={{ backgroundColor: '#2563eb' }}
              >
                {saving ? 'Creating…' : 'Create Client'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError('') }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients List */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <div className="glass-panel rounded-xl p-12 text-center">
            <Users size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No clients yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first client to get started</p>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="glass-panel glass-hover rounded-xl p-5">
              {editingId === client.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editValues.name}
                    onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editValues.attendance_enabled}
                          onChange={e => setEditValues(v => ({ ...v, attendance_enabled: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-slate-700">Attendance Tracking</span>
                      </label>
                      {editValues.attendance_enabled && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700">Target</span>
                          <input
                            type="number"
                            min="1"
                            value={editValues.attendance_target}
                            onChange={e => setEditValues(v => ({ ...v, attendance_target: e.target.value }))}
                            className="w-20 px-2 py-1 rounded border border-slate-300 text-sm focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editValues.task_chart_enabled}
                        onChange={e => setEditValues(v => ({ ...v, task_chart_enabled: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">Task Overview Chart</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(client.id)} disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white bg-green-600 hover:bg-green-700 transition-colors">
                      <Check size={13} /> Save
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors">
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        client.attendance_enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {client.attendance_enabled ? `Attendance ON (target: ${client.attendance_target})` : 'Attendance OFF'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        client.task_chart_enabled
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {client.task_chart_enabled ? 'Chart ON' : 'Chart OFF'}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedClientId(client.id); navigate('/') }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Dashboard
                      </button>
                      <button
                        onClick={() => startEdit(client)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showUserModal && (
        <CreateUserModal onClose={() => setShowUserModal(false)} clients={clients} />
      )}
      {showManageUsers && (
        <ManageUsersModal onClose={() => setShowManageUsers(false)} clients={clients} />
      )}
    </div>
  )
}
