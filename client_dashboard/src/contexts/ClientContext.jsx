import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ClientContext = createContext(null)

export function ClientProvider({ children }) {
  const { isSKPM, isClient, profile } = useAuth()
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [loadingClients, setLoadingClients] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (isClient && profile?.client_id) {
      setSelectedClientId(profile.client_id)
      fetchClientById(profile.client_id)
    } else if (isSKPM) {
      fetchClients()
    } else {
      setLoadingClients(false)
    }
  }, [isSKPM, isClient, profile])

  async function fetchClientById(clientId) {
    setLoadingClients(true)
    const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single()
    if (!error) setClients([data])
    setLoadingClients(false)
  }

  async function fetchClients() {
    setLoadingClients(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name')

    if (!error) {
      setClients(data)
      if (data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id)
      }
    }
    setLoadingClients(false)
  }

  const selectedClient = clients.find(c => c.id === selectedClientId) || null

  async function createClient(name, attendanceEnabled, attendanceTarget, taskChartEnabled = false) {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name,
        attendance_enabled: attendanceEnabled,
        attendance_target: attendanceTarget,
        task_chart_enabled: taskChartEnabled,
      })
      .select()
      .single()

    if (!error) {
      setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedClientId(data.id)
    }
    return { data, error }
  }

  async function updateClient(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error) {
      setClients(prev => prev.map(c => c.id === id ? data : c))
    }
    return { data, error }
  }

  async function deleteClient(id) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) {
      setClients(prev => prev.filter(c => c.id !== id))
      if (selectedClientId === id) {
        const remaining = clients.filter(c => c.id !== id)
        setSelectedClientId(remaining.length > 0 ? remaining[0].id : null)
      }
    }
    return { error }
  }

  return (
    <ClientContext.Provider value={{
      clients,
      selectedClientId,
      setSelectedClientId,
      selectedClient,
      loadingClients,
      fetchClients,
      createClient,
      updateClient,
      deleteClient,
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
    }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  return useContext(ClientContext)
}
