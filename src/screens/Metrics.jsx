import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useStore, todayStr } from '../store/StoreContext'
import MetricChart from '../components/MetricChart'

function fmtToday() {
  const d = new Date()
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

const SectionLabel = ({ text }) => (
  <div className="flex items-center gap-4 mb-4">
    <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#555' }}>
      {text}
    </span>
    <div className="flex-1" style={{ height: 1, backgroundColor: '#1C1C1C' }} />
  </div>
)

export default function Metrics() {
  const { metrics, metricDefs, saveMetricValue, addMetricDef, removeMetricDef } = useStore()
  const today = todayStr()

  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [inputs, setInputs] = useState({})
  const [saved, setSaved] = useState(false)

  function getToday(defId) {
    const e = metrics.find(m => m.date === today && m.metricId === defId)
    return e ? String(e.value) : ''
  }

  function handleAdd() {
    if (!newName.trim()) return
    addMetricDef(newName, newUnit)
    setNewName(''); setNewUnit(''); setShowAddForm(false)
  }

  function handleSave() {
    Object.entries(inputs).forEach(([id, val]) => {
      if (val !== '') saveMetricValue(today, id, val)
    })
    setInputs({})
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const val = (id) => inputs[id] ?? getToday(id)

  const inputStyle = {
    width: 96,
    background: '#0D0D0D',
    border: '1px solid #222',
    borderRadius: 6,
    padding: '8px 10px',
    textAlign: 'right',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    color: '#FFF',
    outline: 'none',
  }

  return (
    <div className="overflow-y-auto h-full px-6">

      {/* Definiciones */}
      <div className="pt-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#555' }}>
            MÉTRICAS
          </span>
          <button
            onClick={() => setShowAddForm(v => !v)}
            style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#FFF', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={12} />
            AGREGAR
          </button>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4" style={{ border: '1px solid #1C1C1C', borderRadius: 8 }}>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Nombre"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
                style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: 6, padding: '10px 12px', fontSize: 14, fontFamily: 'Inter', color: '#FFF', outline: 'none' }}
              />
              <input
                type="text"
                placeholder="ud."
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{ width: 56, background: '#000', border: '1px solid #222', borderRadius: 6, padding: '10px 8px', fontSize: 14, fontFamily: 'Inter', color: '#FFF', outline: 'none', textAlign: 'center' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                style={{ flex: 1, padding: '10px 0', border: '1px solid #222', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#555', background: 'transparent' }}
              >
                CANCELAR
              </button>
              <button
                onClick={handleAdd}
                style={{ flex: 1, padding: '10px 0', background: '#FFF', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#000', border: 'none' }}
              >
                AGREGAR
              </button>
            </div>
          </div>
        )}

        {metricDefs.length === 0 ? (
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#444', textAlign: 'center', padding: '20px 0' }}>
            Sin métricas definidas.
          </p>
        ) : (
          <div style={{ borderTop: '1px solid #141414' }}>
            {metricDefs.map(def => (
              <div
                key={def.id}
                className="flex items-center py-4"
                style={{ borderBottom: '1px solid #141414' }}
              >
                <span style={{ flex: 1, fontFamily: 'Inter', fontSize: 15, color: '#FFF' }}>{def.name}</span>
                {def.unit && (
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#555', marginRight: 16 }}>{def.unit}</span>
                )}
                <button onClick={() => removeMetricDef(def.id)} style={{ color: '#333' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrar hoy */}
      {metricDefs.length > 0 && (
        <div className="mb-8">
          <SectionLabel text={`HOY · ${fmtToday()}`} />
          <div style={{ borderTop: '1px solid #141414' }}>
            {metricDefs.map(def => (
              <div
                key={def.id}
                className="flex items-center py-4"
                style={{ borderBottom: '1px solid #141414' }}
              >
                <span style={{ flex: 1, fontFamily: 'Inter', fontSize: 15, color: '#FFF' }}>
                  {def.name}{def.unit ? ` (${def.unit})` : ''}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={val(def.id)}
                  onChange={e => setInputs(p => ({ ...p, [def.id]: e.target.value }))}
                  placeholder="—"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            {saved ? (
              <p style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#22C55E', textAlign: 'center', padding: '12px 0' }}>
                GUARDADO
              </p>
            ) : (
              <button
                onClick={handleSave}
                style={{ width: '100%', padding: '16px 0', background: '#FFF', borderRadius: 8, fontFamily: 'Inter', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#000', border: 'none' }}
              >
                GUARDAR
              </button>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      {metricDefs.length > 0 && (
        <div className="pb-10 space-y-10">
          <SectionLabel text="HISTORIAL" />
          {metricDefs.map(def => {
            const data = metrics
              .filter(m => m.metricId === def.id)
              .map(m => ({ date: m.date.slice(5).replace('-', '/'), value: m.value }))
            return (
              <MetricChart
                key={def.id}
                label={`${def.name.toUpperCase()}${def.unit ? ` (${def.unit})` : ''}`}
                data={data}
              />
            )
          })}
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
