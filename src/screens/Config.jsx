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
const PILLAR_LABEL = Object.fromEntries(PILLARS.map(p => [p.id, p.label]))

function fmt(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const inputStyle = {
  width: '100%',
  background: '#0D0D0D',
  border: '1px solid #1C1C1C',
  borderRadius: 8,
  padding: '13px 14px',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  color: '#FFF',
  outline: 'none',
}

const labelStyle = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.14em',
  color: '#555',
  display: 'block',
  marginBottom: 8,
}

function emptyTask() {
  return { id: genId(), name: '', pillar: 'fisico', why: '' }
}

function ActiveCycleView({ cycle, onNewCycle }) {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="px-6 py-8">
      <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#555', marginBottom: 8 }}>
        CICLO ACTIVO
      </p>
      <p style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: 800, color: '#FFF', lineHeight: 1, marginBottom: 8 }}>
        {cycle.name}
      </p>
      <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#444', marginBottom: 40 }}>
        {fmt(cycle.startDate)} — {fmt(addDays(cycle.startDate, cycle.durationDays - 1))} · {cycle.durationDays} días
      </p>

      <p style={{ ...labelStyle, marginBottom: 0 }}>TAREAS</p>
      <div style={{ borderTop: '1px solid #141414', marginBottom: 40 }}>
        {cycle.tasks.map(t => (
          <div
            key={t.id}
            className="flex items-start py-4"
            style={{ borderBottom: '1px solid #141414' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#FFF', marginBottom: t.why ? 3 : 0 }}>{t.name}</p>
              {t.why && <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#444' }}>{t.why}</p>}
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#555', marginLeft: 16, marginTop: 3 }}>
              {PILLAR_LABEL[t.pillar]}
            </span>
          </div>
        ))}
      </div>

      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          style={{ width: '100%', padding: '16px 0', background: 'transparent', border: '1px solid #222', borderRadius: 8, fontFamily: 'Inter', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#555' }}
        >
          NUEVO CICLO
        </button>
      ) : (
        <div style={{ border: '1px solid #1C1C1C', borderRadius: 8, padding: 20 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#FFF', marginBottom: 20 }}>
            ¿Terminar este ciclo y archivar los datos?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirm(false)}
              style={{ flex: 1, padding: '13px 0', border: '1px solid #222', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#555', background: 'transparent' }}
            >
              CANCELAR
            </button>
            <button
              onClick={onNewCycle}
              style={{ flex: 1, padding: '13px 0', background: '#EF4444', border: 'none', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#FFF' }}
            >
              TERMINAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
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
    <div className="overflow-y-auto h-full px-6 py-8">
      <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#555', marginBottom: 28 }}>
        NUEVO CICLO
      </p>

      <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>NOMBRE</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DURACIÓN (DÍAS)</label>
            <input type="number" min="1" max="365" value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>INICIO</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <p style={{ ...labelStyle, marginBottom: 16 }}>TAREAS</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {tasks.map((task, i) => (
          <div
            key={task.id}
            style={{ border: '1px solid #1C1C1C', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#444', width: 18 }}>{i + 1}</span>
              <input
                type="text"
                placeholder="Nombre de la tarea"
                value={task.name}
                onChange={e => updateTask(task.id, 'name', e.target.value)}
                style={{ ...inputStyle, flex: 1, padding: '10px 12px', fontSize: 14 }}
              />
              {tasks.length > 1 && (
                <button onClick={() => removeTask(task.id)} style={{ color: '#333', flexShrink: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, paddingLeft: 28 }}>
              <select
                value={task.pillar}
                onChange={e => updateTask(task.id, 'pillar', e.target.value)}
                style={{ background: '#000', border: '1px solid #1C1C1C', borderRadius: 6, padding: '8px 10px', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: '#FFF', outline: 'none' }}
              >
                {PILLARS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <input
                type="text"
                placeholder="Por qué (opcional)"
                value={task.why}
                maxLength={80}
                onChange={e => updateTask(task.id, 'why', e.target.value)}
                style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: 13, color: '#888' }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addTask}
        style={{ width: '100%', padding: '13px 0', background: 'transparent', border: '1px dashed #222', borderRadius: 8, fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#444', marginBottom: 28 }}
      >
        + AGREGAR TAREA
      </button>

      {error && (
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</p>
      )}

      <button
        onClick={handleStart}
        style={{ width: '100%', padding: '17px 0', background: '#FFF', borderRadius: 8, fontFamily: 'Inter', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', color: '#000', border: 'none' }}
      >
        INICIAR CICLO
      </button>

      <div style={{ height: 32 }} />
    </div>
  )
}
