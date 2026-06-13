import { useState } from 'react'
import { Plus, Trash2, X, Type, Hash, Calendar, List, Check } from 'lucide-react'

const FIELD_TYPES = [
  { value: 'text',     label: 'Text',     icon: Type,     hint: 'Names, titles, short notes' },
  { value: 'number',   label: 'Number',   icon: Hash,     hint: 'Amounts, quantities, counts' },
  { value: 'date',     label: 'Date',     icon: Calendar, hint: 'Deadlines, due dates' },
  { value: 'dropdown', label: 'Choices',  icon: List,     hint: 'Pick from a list you define' },
]

const PRESETS = [
  {
    label: 'Task',
    emoji: '✅',
    fields: [
      { label: 'Task Name',   type: 'text' },
      { label: 'Due Date',    type: 'date' },
      { label: 'Priority',    type: 'dropdown', options: ['Low', 'Medium', 'High'] },
      { label: 'Assigned To', type: 'text' },
    ],
  },
  {
    label: 'Invoice',
    emoji: '🧾',
    fields: [
      { label: 'Invoice No.',  type: 'text' },
      { label: 'Client Name',  type: 'text' },
      { label: 'Amount (₹)',   type: 'number' },
      { label: 'Due Date',     type: 'date' },
    ],
  },
  {
    label: 'Follow-up',
    emoji: '📞',
    fields: [
      { label: 'Contact Name', type: 'text' },
      { label: 'Phone / Email',type: 'text' },
      { label: 'Follow-up On', type: 'date' },
      { label: 'Notes',        type: 'text' },
    ],
  },
  {
    label: 'Document',
    emoji: '📄',
    fields: [
      { label: 'Document Name',type: 'text' },
      { label: 'Reference No.',type: 'text' },
      { label: 'Filed On',     type: 'date' },
      { label: 'Remarks',      type: 'text' },
    ],
  },
]

function makeField(label = '', type = 'text', options = []) {
  return { id: crypto.randomUUID(), label, type, options }
}

export default function TemplateEditor({ column, template, onSave, onClose }) {
  const [fields, setFields] = useState(
    template?.fields?.length
      ? template.fields
      : []
  )
  const [presetUsed, setPresetUsed] = useState(!!template?.fields?.length)
  const [optionInput, setOptionInput] = useState({}) // fieldId → current typing

  function applyPreset(preset) {
    setFields(preset.fields.map(f => makeField(f.label, f.type, f.options || [])))
    setPresetUsed(true)
  }

  function addField() {
    setFields(f => [...f, makeField()])
  }

  function updateField(id, updates) {
    setFields(f => f.map(field => field.id === id ? { ...field, ...updates } : field))
  }

  function removeField(id) {
    setFields(f => f.filter(field => field.id !== id))
  }

  function addOption(fieldId, value) {
    const trimmed = value.trim()
    if (!trimmed) return
    updateField(fieldId, {
      options: [...(fields.find(f => f.id === fieldId)?.options || []), trimmed],
    })
    setOptionInput(prev => ({ ...prev, [fieldId]: '' }))
  }

  function removeOption(fieldId, opt) {
    const field = fields.find(f => f.id === fieldId)
    updateField(fieldId, { options: (field?.options || []).filter(o => o !== opt) })
  }

  function handleSave() {
    onSave(column.id, column.name, fields, template?.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Set Up Card Fields</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Column: <span className="font-medium text-slate-700">"{column.name}"</span> - define what info goes on each card
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-4 shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-4 space-y-5">

          {/* Presets (show only when no fields yet OR as a quick-reset) */}
          {!presetUsed && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Start with a preset - or build your own below
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-all group"
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{preset.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{preset.fields.map(f => f.label).join(', ')}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">or start from scratch</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>
          )}

          {/* Fields list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">
                {fields.length === 0 ? 'No fields yet' : `${fields.length} field${fields.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex gap-2">
                {presetUsed && (
                  <button
                    onClick={() => { setPresetUsed(false); setFields([]) }}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Use a preset instead
                  </button>
                )}
                <button
                  onClick={addField}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={13} /> Add Field
                </button>
              </div>
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <p className="text-sm">Click a preset above or "+ Add Field" to get started</p>
              </div>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const TypeIcon = FIELD_TYPES.find(t => t.value === field.type)?.icon || Type
                return (
                  <div key={field.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    {/* Field name + type */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 shrink-0">
                        <TypeIcon size={14} className="text-slate-500" />
                      </div>
                      <input
                        type="text"
                        value={field.label}
                        onChange={e => updateField(field.id, { label: e.target.value })}
                        placeholder={`Field ${index + 1} name (e.g. "Due Date")`}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeField(field.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove this field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Type picker */}
                    <div className="flex gap-2 pl-11">
                      {FIELD_TYPES.map(t => {
                        const Icon = t.icon
                        const active = field.type === t.value
                        return (
                          <button
                            key={t.value}
                            onClick={() => updateField(field.id, { type: t.value })}
                            title={t.hint}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              active
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            }`}
                          >
                            <Icon size={11} />
                            {t.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Choices options */}
                    {field.type === 'dropdown' && (
                      <div className="pl-11 space-y-2">
                        <p className="text-xs text-slate-500">People will pick from these choices:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(field.options || []).map(opt => (
                            <span key={opt} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                              {opt}
                              <button
                                onClick={() => removeOption(field.id, opt)}
                                className="text-slate-300 hover:text-red-500 ml-0.5"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={optionInput[field.id] || ''}
                            onChange={e => setOptionInput(prev => ({ ...prev, [field.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(field.id, optionInput[field.id] || '') } }}
                            placeholder="Type a choice and press Enter"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                          <button
                            onClick={() => addOption(field.id, optionInput[field.id] || '')}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            <Check size={15} />
            Save Card Fields
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
