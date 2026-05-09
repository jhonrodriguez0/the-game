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

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [cycle, setCycleState] = useState(() => loadLS('tg_cycle', null))
  const [metrics, setMetricsState] = useState(() => loadLS('tg_metrics', []))
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
          if (dayChanged) {
            log[date] = dayLog
            changed = true
          }
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
        log: {
          ...prev.log,
          [date]: { ...prev.log[date], [taskId]: status }
        }
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

  const saveMetric = useCallback((entry) => {
    setMetricsState(prev => {
      const filtered = prev.filter(m => m.date !== entry.date)
      const updated = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date))
      saveLS('tg_metrics', updated)
      return updated
    })
  }, [])

  return (
    <StoreContext.Provider value={{
      cycle, metrics, history,
      autoClosePastDays, initTodayLog, markTask,
      startCycle, closeCycle, saveMetric
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
