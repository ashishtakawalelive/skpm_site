import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCardComments(cardId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cardId) { setComments([]); return }

    let cancelled = false
    setLoading(true)

    supabase
      .from('card_comments')
      .select('id, card_id, user_id, user_name, body, created_at')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setComments(data || [])
          setLoading(false)
        }
      })

    const channel = supabase
      .channel(`card-comments-${cardId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'card_comments',
        filter: `card_id=eq.${cardId}`,
      }, (payload) => {
        if (!cancelled) {
          setComments(prev =>
            prev.some(c => c.id === payload.new.id) ? prev : [...prev, payload.new]
          )
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'card_comments',
        filter: `card_id=eq.${cardId}`,
      }, (payload) => {
        if (!cancelled) {
          setComments(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [cardId])

  async function addComment(body, userName) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      card_id: cardId,
      user_id: user.id,
      user_name: userName,
      body,
      created_at: new Date().toISOString(),
    }
    setComments(prev => [...prev, optimistic])

    const { data, error } = await supabase
      .from('card_comments')
      .insert({ card_id: cardId, user_id: user.id, user_name: userName, body })
      .select('id, card_id, user_id, user_name, body, created_at')
      .single()

    if (error) {
      setComments(prev => prev.filter(c => c.id !== tempId))
    } else {
      setComments(prev => prev.map(c => c.id === tempId ? data : c))
    }

    return { error }
  }

  async function deleteComment(commentId) {
    setComments(prev => prev.filter(c => c.id !== commentId))
    const { error } = await supabase
      .from('card_comments')
      .delete()
      .eq('id', commentId)
    if (error) {
      // refetch on failure
      const { data } = await supabase
        .from('card_comments')
        .select('id, card_id, user_id, user_name, body, created_at')
        .eq('card_id', cardId)
        .order('created_at', { ascending: true })
      setComments(data || [])
    }
  }

  return { comments, loading, addComment, deleteComment }
}
