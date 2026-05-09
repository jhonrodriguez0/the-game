import { createContext, useContext, useState, useCallback } from 'react'

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function genId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const DEFAULT_METRIC_DEFS = [
  { id: 'def_weight', name: 'Peso', unit: 'kg' },
  { id: 'def_sleep', name: 'Sueño', unit: 'h' },
]

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [cycle, setCycleState] = useState(() => loadLS('tg_cycle', null))
  // [{date, metricId, value}]
  const [metrics, setMetricsState] = useState(() => loadLS('tg_metrics_v2', []))
  // [{id, name, unit}]
  const [metricDefs, setMetricDefsState] = useState(
    () => loadLS('tg_metric_defs', DEFAULT_METRIC_DEFS)
  )
  const [history, setHistoryState] = useState(() => loadLS('tg_history', []))

  const autoClosePastDays = useCallback(() => {
    setCycleState(prev => {
      if (!prev || !prev.active) return prev
      const today = todayStr()
      let changed = false
      const log = { ...prev.log }
      Object.keys(log).forEach(date => {
        if (date < today) {
          const dayLog = { ...log[date] }
          let dayChanged = false
          Object.keys(dayLog).forEach(taskId => {
            if (dayLog[taskId] === 'pending') {
              dayLog[taskId] = 'missed'
              dayChanged = true
            }
          })
          if (dayChanged) { log[date] = dayLog; changed = true }
        }
      })
      if (!changed) return prev
      const updated = { ...prev, log }
      saveLS('tg_cycle', updated)
      return updated
    })
  }, [])

  const initTodayLog = useCallback(() => {
    setCycleState(prev => {
      if (!prev || !prev.active) return prev
      const today = todayStr()
      if (prev.log[today]) return prev
      const dayLog = {}
      prev.tasks.forEach(t => { dayLog[t.id] = 'pending' })
      const updated = { ...prev, log: { ...prev.log, [today]: dayLog } }
      saveLS('tg_cycle', updated)
      return updated
    })
  }, [])

  const markTask = useCallback((date, taskId, status) => {
    setCycleState(prev => {
      if (!prev) return prev
      const updated = {
        ...prev,
        log: { ...prev.log, [date]: { ...prev.log[date], [taskId]: status } }
      }
      saveLS('tg_cycle', updated)
      return updated
    })
  }, [])

  const startCycle = useCallback((cycleData) => {
    const c = { ...cycleData, id: genId(), active: true, log: {} }
    setCycleState(c)
    saveLS('tg_cycle', c)
  }, [])

  const closeCycle = useCallback(() => {
    setCycleState(prev => {
      if (!prev) return null
      const archived = { ...prev, active: false }
      setHistoryState(hist => {
        const newHist = [archived, ...hist]
        saveLS('tg_history', newHist)
        return newHist
      })
      saveLS('tg_cycle', null)
      return null
    })
  }, [])

  const saveMetricValue = useCallback((date, metricId, value) => {
    setMetricsState(prev => {
      const filtered = prev.filter(m => !(m.date === date && m.metricId === metricId))
      const updated = value !== '' && value != null
        ? [...filtered, { date, metricId, value: parseFloat(value) }]
        : filtered
      updated.sort((a, b) => a.date.localeCompare(b.date) || a.metricId.localeCompare(b.metricId))
      saveLS('tg_metrics_v2', updated)
      return updated
    })
  }, [])

  const addMetricDef = useCallback((name, unit) => {
    setMetricDefsState(prev => {
      const updated = [...prev, { id: genId(), name: name.trim(), unit: unit.trim() }]
      saveLS('tg_metric_defs', updated)
      return updated
    })
  }, [])

  const removeMetricDef = useCallback((id) => {
    setMetricDefsState(prev => {
      const updated = prev.filter(d => d.id !== id)
      saveLS('tg_metric_defs', updated)
      return updated
    })
    setMetricsState(prev => {
      const updated = prev.filter(m => m.metricId !== id)
      saveLS('tg_metrics_v2', updated)
      return updated
    })
  }, [])

  return (
    <StoreContext.Provider value={{
      cycle, metrics, metricDefs, history,
      autoClosePastDays, initTodayLog, markTask,
      startCycle, closeCycle,
      saveMetricValue, addMetricDef, removeMetricDef,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
