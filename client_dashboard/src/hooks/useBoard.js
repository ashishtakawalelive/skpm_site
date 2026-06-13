import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBoard(clientId, month, year) {
  const [columns, setColumns] = useState([])
  const [cards, setCards] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBoard = useCallback(async () => {
    if (!clientId) { setLoading(false); return }
    setLoading(true)

    const [colsRes, cardsRes, tmplRes] = await Promise.all([
      supabase.from('columns').select('*').eq('client_id', clientId).order('position'),
      supabase.from('cards').select('*').eq('month', month).eq('year', year).order('position'),
      supabase.from('card_templates').select('*'),
    ])

    if (!colsRes.error) setColumns(colsRes.data)

    if (!colsRes.error && !cardsRes.error) {
      const columnIds = new Set(colsRes.data.map(c => c.id))
      setCards(cardsRes.data.filter(card => columnIds.has(card.column_id)))
    }

    if (!tmplRes.error && !colsRes.error) {
      const columnIds = new Set(colsRes.data.map(c => c.id))
      setTemplates(tmplRes.data.filter(t => columnIds.has(t.column_id)))
    }

    setLoading(false)
  }, [clientId, month, year])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  // ── COLUMNS ──────────────────────────────────────────────

  async function addColumn(name) {
    const position = columns.length
    const { data, error } = await supabase
      .from('columns')
      .insert({ client_id: clientId, name, position })
      .select()
      .single()
    if (!error) setColumns(prev => [...prev, data])
    return { error }
  }

  async function updateColumn(id, updates) {
    const { data, error } = await supabase.from('columns').update(updates).eq('id', id).select().single()
    if (!error) setColumns(prev => prev.map(c => c.id === id ? data : c))
    return { error }
  }

  async function deleteColumn(id) {
    const { error } = await supabase.from('columns').delete().eq('id', id)
    if (!error) {
      setColumns(prev => prev.filter(c => c.id !== id))
      setCards(prev => prev.filter(c => c.column_id !== id))
      setTemplates(prev => prev.filter(t => t.column_id !== id))
    }
    return { error }
  }

  // ── TEMPLATES ────────────────────────────────────────────

  async function upsertTemplate(columnId, name, fields, existingId = null) {
    const payload = { column_id: columnId, name, fields }
    let data, error

    if (existingId) {
      ({ data, error } = await supabase.from('card_templates').update(payload).eq('id', existingId).select().single())
      if (!error) setTemplates(prev => prev.map(t => t.id === existingId ? data : t))
    } else {
      ({ data, error } = await supabase.from('card_templates').insert(payload).select().single())
      if (!error) setTemplates(prev => [...prev, data])
    }
    return { data, error }
  }

  async function deleteTemplate(id) {
    const { error } = await supabase.from('card_templates').delete().eq('id', id)
    if (!error) setTemplates(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  // ── CARDS ─────────────────────────────────────────────────

  async function addCard(columnId, data, status = 'default') {
    const colCards = cards.filter(c => c.column_id === columnId)
    const position = colCards.length
    const { data: newCard, error } = await supabase
      .from('cards')
      .insert({ column_id: columnId, data, status, position, month, year })
      .select()
      .single()
    if (!error) setCards(prev => [...prev, newCard])
    return { error }
  }

  async function updateCard(id, updates) {
    const { data, error } = await supabase.from('cards').update(updates).eq('id', id).select().single()
    if (!error) setCards(prev => prev.map(c => c.id === id ? data : c))
    return { error }
  }

  async function toggleColumnLock(id, locked) {
    return updateColumn(id, { is_locked: locked })
  }

  async function reorderColumns(orderedIds) {
    const reordered = orderedIds.map(id => columns.find(c => c.id === id)).filter(Boolean)
    setColumns(reordered)
    await Promise.all(
      reordered.map((col, idx) =>
        supabase.from('columns').update({ position: idx }).eq('id', col.id)
      )
    )
  }

  async function moveCard(cardId, toColumnId, newPosition, status = null) {
    // Track when a card is completed or moved back out of done
    let completedAt
    if (status === 'done') completedAt = new Date().toISOString()
    else if (status !== null) completedAt = null  // moved out of done — clear it

    // Optimistic update
    setCards(prev => {
      const card = prev.find(c => c.id === cardId)
      if (!card) return prev
      const patch = { column_id: toColumnId, position: newPosition }
      if (status !== null) patch.status = status
      if (completedAt !== undefined) patch.completed_at = completedAt
      return prev.map(c => c.id === cardId ? { ...c, ...patch } : c)
    })

    const updates = { column_id: toColumnId, position: newPosition }
    if (status !== null) updates.status = status
    if (completedAt !== undefined) updates.completed_at = completedAt

    const { error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)

    if (error) fetchBoard() // rollback
    return { error }
  }

  async function deleteCard(id) {
    const { error } = await supabase.from('cards').delete().eq('id', id)
    if (!error) setCards(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  return {
    columns, cards, templates, loading,
    addColumn, updateColumn, deleteColumn, reorderColumns, toggleColumnLock,
    upsertTemplate, deleteTemplate,
    addCard, updateCard, moveCard, deleteCard,
    refetch: fetchBoard,
  }
}
