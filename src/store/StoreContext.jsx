import { createContext, useContext, useState, useCallback } from 'react'

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch { return fallback }
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

// Migrate old single-cycle data to array format
function loadCycles() {
  const existing = loadLS('tg_cycles_v2', null)
  if (existing) return existing
  // Migrate from old format
  const oldCycle = loadLS('tg_cycle', null)
  if (oldCycle) {
    const cycles = [oldCycle]
    saveLS('tg_cycles_v2', cycles)
    return cycles
  }
  return []
}

const DEFAULT_METRIC_DEFS = [
  { id: 'def_weight', name: 'Peso', unit: 'kg' },
  { id: 'def_sleep',  name: 'Sueño', unit: 'h'  },
]

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [cycles, setCycles] = useState(() => loadCycles())
  const [metrics, setMetrics] = useState(() => loadLS('tg_metrics_v2', []))
  const [metricDefs, setMetricDefs] = useState(() => loadLS('tg_metric_defs', DEFAULT_METRIC_DEFS))

  const activeCycles = cycles.filter(c => c.active)
  const history = cycles.filter(c => !c.active)

  function updateCycle(id, updater) {
    setCycles(prev => {
      const updated = prev.map(c => c.id === id ? updater(c) : c)
      saveLS('tg_cycles_v2', updated)
      return updated
    })
  }

  const autoClosePastDays = useCallback(() => {
    const today = todayStr()
    setCycles(prev => {
      let anyChanged = false
      const next = prev.map(cycle => {
        if (!cycle.active) return cycle
        let changed = false
        const log = { ...cycle.log }
        Object.keys(log).forEach(date => {
          if (date < today) {
            const dl = { ...log[date] }
            let dc = false
            Object.keys(dl).forEach(tid => {
              if (dl[tid] === 'pending') { dl[tid] = 'missed'; dc = true }
            })
            if (dc) { log[date] = dl; changed = true }
          }
        })
        if (!changed) return cycle
        anyChanged = true
        return { ...cycle, log }
      })
      if (!anyChanged) return prev
      saveLS('tg_cycles_v2', next)
      return next
    })
  }, [])

  const initTodayLog = useCallback((cycleId) => {
    const today = todayStr()
    updateCycle(cycleId, cycle => {
      if (cycle.log[today]) return cycle
      const dl = {}
      cycle.tasks.forEach(t => { dl[t.id] = 'pending' })
      return { ...cycle, log: { ...cycle.log, [today]: dl } }
    })
  }, [])

  const initAllTodayLogs = useCallback(() => {
    const today = todayStr()
    setCycles(prev => {
      let changed = false
      const next = prev.map(cycle => {
        if (!cycle.active || cycle.log[today]) return cycle
        const dl = {}
        cycle.tasks.forEach(t => { dl[t.id] = 'pending' })
        changed = true
        return { ...cycle, log: { ...cycle.log, [today]: dl } }
      })
      if (!changed) return prev
      saveLS('tg_cycles_v2', next)
      return next
    })
  }, [])

  const markTask = useCallback((cycleId, date, taskId, status) => {
    updateCycle(cycleId, cycle => ({
      ...cycle,
      log: {
        ...cycle.log,
        [date]: { ...(cycle.log[date] || {}), [taskId]: status }
      }
    }))
  }, [])

  const startCycle = useCallback((data) => {
    const newCycle = { ...data, id: genId(), active: true, log: {} }
    setCycles(prev => {
      const updated = [...prev, newCycle]
      saveLS('tg_cycles_v2', updated)
      return updated
    })
    return newCycle.id
  }, [])

  const closeCycle = useCallback((id) => {
    setCycles(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, active: false } : c)
      saveLS('tg_cycles_v2', updated)
      return updated
    })
  }, [])

  const saveMetricValue = useCallback((date, metricId, value) => {
    setMetrics(prev => {
      const filtered = prev.filter(m => !(m.date === date && m.metricId === metricId))
      const updated = value !== '' && value != null
        ? [...filtered, { date, metricId, value: parseFloat(value) }]
        : filtered
      updated.sort((a, b) => a.date.localeCompare(b.date))
      saveLS('tg_metrics_v2', updated)
      return updated
    })
  }, [])

  const addMetricDef = useCallback((name, unit) => {
    setMetricDefs(prev => {
      const updated = [...prev, { id: genId(), name: name.trim(), unit: unit.trim() }]
      saveLS('tg_metric_defs', updated)
      return updated
    })
  }, [])

  const removeMetricDef = useCallback((id) => {
    setMetricDefs(prev => {
      const updated = prev.filter(d => d.id !== id)
      saveLS('tg_metric_defs', updated)
      return updated
    })
    setMetrics(prev => {
      const updated = prev.filter(m => m.metricId !== id)
      saveLS('tg_metrics_v2', updated)
      return updated
    })
  }, [])

  return (
    <StoreContext.Provider value={{
      cycles, activeCycles, history,
      metrics, metricDefs,
      autoClosePastDays, initAllTodayLogs, initTodayLog, markTask,
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
