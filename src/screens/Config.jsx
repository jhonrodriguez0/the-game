import { useState } from 'react'
import { useStore, todayStr, addDays, genId } from '../store/StoreContext'

const PILLARS = [
  { id: 'fisico', label: 'FÍSICO', icon: '◆' },
  { id: 'dinero', label: 'DINERO', icon: '$' },
  { id: 'social', label: 'SOCIAL', icon: '◎' },
  { id: 'mente', label: 'MENTE', icon: '▲' },
  { id: 'alma', label: 'ALMA', icon: '✦' },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const PILLAR_ICON = Object.fromEntries(PILLARS.map(p => [p.id, p.icon]))
const PILLAR_LABEL = Object.fromEntries(PILLARS.map(p => [p.id, p.label]))

function ActiveCycleView({ cycle, onNewCycle }) {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="px-5 py-5">
      <div className="mb-6">
        <p className="font-mono text-xs text-muted tracking-wide mb-1">CICLO ACTIVO</p>
        <p className="font-mono text-base text-primary font-bold">{cycle.name}</p>
        <p className="font-mono text-xs text-muted/60 mt-1">
          {formatDate(cycle.startDate)} — {formatDate(addDays(cycle.startDate, cycle.durationDays - 1))}
          {' · '}{cycle.durationDays} días
        </p>
      </div>

      <div className="mb-8">
        <div className="font-mono text-[10px] text-muted tracking-wide mb-3">TAREAS</div>
        <div className="space-y-2">
          {cycle.tasks.map(t => (
            <div key={t.id} className="flex items-start gap-3 py-3 border-b border-border/40">
              <span className="text-xs text-muted font-mono mt-0.5">{PILLAR_ICON[t.pillar]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-primary font-sans">{t.name}</p>
                {t.why && (
                  <p className="text-[11px] text-muted mt-0.5 truncate">{t.why}</p>
                )}
              </div>
              <span className="text-[10px] font-mono text-muted shrink-0">{PILLAR_LABEL[t.pillar]}</span>
            </div>
          ))}
        </div>
      </div>

      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-full py-3 border border-border font-mono text-xs text-muted rounded tracking-wide active:opacity-70"
        >
          NUEVO CICLO
        </button>
      ) : (
        <div className="bg-surface rounded-lg p-4">
          <p className="text-sm text-primary font-sans mb-4">
            ¿Terminar el ciclo actual y archivar los datos?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 py-2.5 border border-border font-mono text-xs text-muted rounded"
            >
              CANCELAR
            </button>
            <button
              onClick={onNewCycle}
              className="flex-1 py-2.5 bg-missed font-mono text-xs text-white rounded"
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function emptyTask() {
  return { id: genId(), name: '', pillar: 'fisico', why: '' }
}

export default function Config({ onCycleStarted }) {
  const { cycle, startCycle, closeCycle } = useStore()

  const [name, setName] = useState('Ciclo 1')
  const [duration, setDuration] = useState('30')
  const [startDate, setStartDate] = useState(todayStr())
  const [tasks, setTasks] = useState([emptyTask()])
  const [error, setError] = useState('')

  function handleNewCycle() {
    closeCycle()
  }

  function addTask() {
    setTasks(prev => [...prev, emptyTask()])
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function updateTask(id, field, value) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  function handleStart() {
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    const validTasks = tasks.filter(t => t.name.trim())
    if (validTasks.length === 0) { setError('Agrega al menos una tarea.'); return }
    setError('')
    startCycle({
      name: name.trim(),
      durationDays: Math.max(1, parseInt(duration) || 30),
      startDate,
      tasks: validTasks.map(t => ({ ...t, name: t.name.trim(), why: t.why.trim() })),
    })
    onCycleStarted()
  }

  if (cycle && cycle.active) {
    return (
      <div className="overflow-y-auto h-full">
        <ActiveCycleView cycle={cycle} onNewCycle={handleNewCycle} />
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full px-5 py-5">
      <div className="font-mono text-[10px] text-muted tracking-wide mb-4">NUEVO CICLO</div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="font-mono text-xs text-muted block mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-primary font-sans focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-mono text-xs text-muted block mb-1">Duración (días)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-primary font-mono focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="font-mono text-xs text-muted block mb-1">Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-primary font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      <div className="font-mono text-[10px] text-muted tracking-wide mb-3">TAREAS</div>

      <div className="space-y-3 mb-4">
        {tasks.map((task, i) => (
          <div key={task.id} className="bg-surface rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted">{i + 1}.</span>
              <input
                type="text"
                placeholder="Nombre de la tarea"
                value={task.name}
                onChange={e => updateTask(task.id, 'name', e.target.value)}
                className="flex-1 bg-bg border border-border rounded px-2 py-1.5 text-sm text-primary font-sans focus:outline-none focus:border-accent"
              />
              {tasks.length > 1 && (
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-muted font-mono text-base leading-none hover:text-missed"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <select
                value={task.pillar}
                onChange={e => updateTask(task.id, 'pillar', e.target.value)}
                className="bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-primary focus:outline-none focus:border-accent"
              >
                {PILLARS.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Por qué (opcional)"
                value={task.why}
                maxLength={80}
                onChange={e => updateTask(task.id, 'why', e.target.value)}
                className="flex-1 bg-bg border border-border rounded px-2 py-1.5 text-xs text-muted font-sans focus:outline-none focus:border-accent focus:text-primary"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addTask}
        className="w-full py-2.5 border border-border border-dashed font-mono text-xs text-muted rounded mb-6 active:opacity-70"
      >
        + AGREGAR TAREA
      </button>

      {error && (
        <p className="text-xs text-missed font-mono mb-3">{error}</p>
      )}

      <button
        onClick={handleStart}
        className="w-full py-3 bg-accent font-mono text-xs text-white rounded tracking-wide active:opacity-70"
      >
        INICIAR CICLO
      </button>

      <div className="h-4" />
    </div>
  )
}
