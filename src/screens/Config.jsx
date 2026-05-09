import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore, todayStr, addDays, genId } from '../store/StoreContext'

const PILLARS = [
  { id: 'fisico', label: 'FÍSICO' },
  { id: 'dinero', label: 'DINERO' },
  { id: 'social', label: 'SOCIAL' },
  { id: 'mente',  label: 'MENTE'  },
  { id: 'alma',   label: 'ALMA'   },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const PILLAR_LABEL = Object.fromEntries(PILLARS.map(p => [p.id, p.label]))

function ActiveCycleView({ cycle, onNewCycle }) {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="px-5 py-6">
      <div className="mb-6">
        <p className="font-mono text-[10px] text-muted tracking-widest mb-2">CICLO ACTIVO</p>
        <p className="font-mono text-xl font-bold text-primary">{cycle.name}</p>
        <p className="font-mono text-xs text-muted mt-1">
          {formatDate(cycle.startDate)} — {formatDate(addDays(cycle.startDate, cycle.durationDays - 1))}
          {' · '}{cycle.durationDays} días
        </p>
      </div>

      <p className="font-mono text-[10px] text-muted tracking-widest mb-3">TAREAS</p>
      <div className="border border-border rounded-lg overflow-hidden mb-8">
        {cycle.tasks.map((t, i) => (
          <div
            key={t.id}
            className="flex items-start gap-3 px-4 py-3.5"
            style={{ borderBottom: i < cycle.tasks.length - 1 ? '1px solid #222' : 'none' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary">{t.name}</p>
              {t.why && <p className="text-xs text-muted mt-0.5 truncate">{t.why}</p>}
            </div>
            <span className="font-mono text-[10px] text-muted shrink-0 mt-0.5">{PILLAR_LABEL[t.pillar]}</span>
          </div>
        ))}
      </div>

      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-full py-3 border border-border rounded font-mono text-xs text-muted tracking-wide"
        >
          NUEVO CICLO
        </button>
      ) : (
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-primary mb-4">¿Terminar este ciclo y archivar los datos?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 py-2.5 border border-border rounded font-mono text-xs text-muted"
            >
              CANCELAR
            </button>
            <button
              onClick={onNewCycle}
              className="flex-1 py-2.5 bg-missed rounded font-mono text-xs text-white"
            >
              TERMINAR
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

  function addTask() { setTasks(p => [...p, emptyTask()]) }
  function removeTask(id) { setTasks(p => p.filter(t => t.id !== id)) }
  function updateTask(id, field, value) {
    setTasks(p => p.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  function handleStart() {
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    const valid = tasks.filter(t => t.name.trim())
    if (!valid.length) { setError('Agrega al menos una tarea.'); return }
    setError('')
    startCycle({
      name: name.trim(),
      durationDays: Math.max(1, parseInt(duration) || 30),
      startDate,
      tasks: valid.map(t => ({ ...t, name: t.name.trim(), why: t.why.trim() })),
    })
    onCycleStarted()
  }

  if (cycle && cycle.active) {
    return (
      <div className="overflow-y-auto h-full">
        <ActiveCycleView cycle={cycle} onNewCycle={closeCycle} />
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full px-5 py-6">
      <p className="font-mono text-[10px] text-muted tracking-widest mb-5">NUEVO CICLO</p>

      <div className="space-y-4 mb-7">
        <div>
          <label className="font-mono text-[10px] text-muted tracking-wider block mb-1.5">NOMBRE</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-primary font-sans focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="font-mono text-[10px] text-muted tracking-wider block mb-1.5">DURACIÓN (DÍAS)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-primary font-mono focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="font-mono text-[10px] text-muted tracking-wider block mb-1.5">INICIO</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-primary font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      <p className="font-mono text-[10px] text-muted tracking-widest mb-3">TAREAS</p>

      <div className="space-y-2 mb-3">
        {tasks.map((task, i) => (
          <div key={task.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted w-5 shrink-0">{i + 1}</span>
              <input
                type="text"
                placeholder="Nombre de la tarea"
                value={task.name}
                onChange={e => updateTask(task.id, 'name', e.target.value)}
                className="flex-1 bg-bg border border-border rounded px-3 py-2 text-sm text-primary font-sans focus:outline-none focus:border-accent"
              />
              {tasks.length > 1 && (
                <button onClick={() => removeTask(task.id)} className="text-muted hover:text-missed shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2 pl-7">
              <select
                value={task.pillar}
                onChange={e => updateTask(task.id, 'pillar', e.target.value)}
                className="bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-primary focus:outline-none focus:border-accent"
              >
                {PILLARS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
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
        className="w-full py-2.5 border border-dashed border-border rounded-lg font-mono text-xs text-muted mb-7 active:opacity-60"
      >
        + AGREGAR TAREA
      </button>

      {error && <p className="text-xs font-mono text-missed mb-3">{error}</p>}

      <button
        onClick={handleStart}
        className="w-full py-3.5 bg-accent rounded-lg font-mono text-xs text-white tracking-widest active:opacity-70"
      >
        INICIAR CICLO
      </button>

      <div className="h-6" />
    </div>
  )
}
