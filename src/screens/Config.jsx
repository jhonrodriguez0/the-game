import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { useStore, todayStr, addDays, genId } from '../store/StoreContext'

const PILLARS = [
  { id: 'fisico', label: 'FÍSICO' },
  { id: 'dinero', label: 'DINERO' },
  { id: 'social', label: 'SOCIAL' },
  { id: 'mente',  label: 'MENTE'  },
  { id: 'alma',   label: 'ALMA'   },
]
const PILLAR_LABEL = Object.fromEntries(PILLARS.map(p => [p.id, p.label]))

function fmtShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function daysLeft(cycle) {
  const end = addDays(cycle.startDate, cycle.durationDays - 1)
  const today = todayStr()
  if (end < today) return 0
  const diff = Math.floor(
    (new Date(end + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000
  )
  return Math.max(0, diff + 1)
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
  fontFamily: 'Inter',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.14em',
  color: '#FFF',
  display: 'block',
  marginBottom: 8,
}

function emptyTask() {
  return { id: genId(), name: '', pillar: 'fisico', why: '' }
}

function ActiveCycleRow({ cycle, onClose }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const left = daysLeft(cycle)

  return (
    <div style={{ borderBottom: '1px solid #141414' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center py-4 text-left">
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#FFF', marginBottom: 3 }}>{cycle.name}</p>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888' }}>
            {fmtShort(cycle.startDate)} — {fmtShort(addDays(cycle.startDate, cycle.durationDays - 1))}
            {' · '}{left} días restantes
          </p>
        </div>
        {open ? <ChevronUp size={15} color="#555" /> : <ChevronDown size={15} color="#555" />}
      </button>

      {open && (
        <div style={{ paddingBottom: 20 }}>
          {/* Tasks preview */}
          <div style={{ marginBottom: 16 }}>
            {cycle.tasks.map((t, i) => (
              <div
                key={t.id}
                style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < cycle.tasks.length - 1 ? '1px solid #141414' : 'none' }}
              >
                <span style={{ flex: 1, fontFamily: 'Inter', fontSize: 14, color: '#FFF' }}>{t.name}</span>
                <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#888' }}>
                  {PILLAR_LABEL[t.pillar]}
                </span>
              </div>
            ))}
          </div>

          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              style={{ width: '100%', padding: '12px 0', border: '1px solid #222', borderRadius: 7, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#888', background: 'transparent' }}
            >
              TERMINAR CICLO
            </button>
          ) : (
            <div style={{ border: '1px solid #1C1C1C', borderRadius: 8, padding: 16 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#FFF', marginBottom: 16 }}>
                ¿Archivar "{cycle.name}"?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirm(false)}
                  style={{ flex: 1, padding: '12px 0', border: '1px solid #222', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#888', background: 'transparent' }}
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => onClose(cycle.id)}
                  style={{ flex: 1, padding: '12px 0', background: '#EF4444', border: 'none', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#FFF' }}
                >
                  ARCHIVAR
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NewCycleForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('30')
  const [startDate, setStartDate] = useState(todayStr())
  const [tasks, setTasks] = useState([emptyTask()])
  const [error, setError] = useState('')

  function addTask() { setTasks(p => [...p, emptyTask()]) }
  function removeTask(id) { setTasks(p => p.filter(t => t.id !== id)) }
  function updateTask(id, field, value) {
    setTasks(p => p.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  function handleSave() {
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    const valid = tasks.filter(t => t.name.trim())
    if (!valid.length) { setError('Agrega al menos una tarea.'); return }
    onSave({
      name: name.trim(),
      durationDays: Math.max(1, parseInt(duration) || 30),
      startDate,
      tasks: valid.map(t => ({ ...t, name: t.name.trim(), why: t.why.trim() })),
    })
  }

  return (
    <div style={{ border: '1px solid #1C1C1C', borderRadius: 10, padding: 20, marginTop: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>NOMBRE</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Mi ciclo"
            autoFocus
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DÍAS</label>
            <input type="number" min="1" max="365" value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>INICIO</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <label style={{ ...labelStyle, marginBottom: 12 }}>TAREAS</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {tasks.map((task, i) => (
          <div key={task.id} style={{ background: '#0A0A0A', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#555', width: 18, paddingTop: 10 }}>{i + 1}</span>
              <input
                type="text"
                placeholder="Nombre de la tarea"
                value={task.name}
                onChange={e => updateTask(task.id, 'name', e.target.value)}
                style={{ ...inputStyle, flex: 1, padding: '10px 12px', fontSize: 14 }}
              />
              {tasks.length > 1 && (
                <button onClick={() => removeTask(task.id)} style={{ color: '#333', paddingTop: 8, flexShrink: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, paddingLeft: 26 }}>
              <select
                value={task.pillar}
                onChange={e => updateTask(task.id, 'pillar', e.target.value)}
                style={{ background: '#000', border: '1px solid #1C1C1C', borderRadius: 6, padding: '8px 10px', fontFamily: 'Inter', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#FFF', outline: 'none' }}
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
        style={{ width: '100%', padding: '12px 0', border: '1px dashed #222', borderRadius: 7, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#555', marginBottom: 20 }}
      >
        + TAREA
      </button>

      {error && <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '14px 0', border: '1px solid #222', borderRadius: 8, fontFamily: 'Inter', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#888', background: 'transparent' }}
          >
            CANCELAR
          </button>
        )}
        <button
          onClick={handleSave}
          style={{ flex: 2, padding: '14px 0', background: '#FFF', borderRadius: 8, fontFamily: 'Inter', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', color: '#000', border: 'none' }}
        >
          INICIAR CICLO
        </button>
      </div>
    </div>
  )
}

export default function Config({ onCycleStarted }) {
  const { activeCycles, startCycle, closeCycle } = useStore()
  const [showForm, setShowForm] = useState(false)

  function handleSave(data) {
    startCycle(data)
    setShowForm(false)
    onCycleStarted()
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '32px 24px 0' }}>

      {/* Active cycles */}
      {activeCycles.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#FFF', marginBottom: 4 }}>
            CICLOS ACTIVOS
          </p>
          <div style={{ borderTop: '1px solid #141414' }}>
            {activeCycles.map(c => (
              <ActiveCycleRow key={c.id} cycle={c} onClose={closeCycle} />
            ))}
          </div>
        </div>
      )}

      {/* Create new */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 0', background: activeCycles.length === 0 ? '#FFF' : 'transparent', border: activeCycles.length === 0 ? 'none' : '1px solid #222', borderRadius: 8, fontFamily: 'Inter', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', color: activeCycles.length === 0 ? '#000' : '#FFF' }}
        >
          <Plus size={14} />
          CREAR CICLO
        </button>
      ) : (
        <NewCycleForm
          onSave={handleSave}
          onCancel={activeCycles.length > 0 ? () => setShowForm(false) : null}
        />
      )}

      <div style={{ height: 40 }} />
    </div>
  )
}
