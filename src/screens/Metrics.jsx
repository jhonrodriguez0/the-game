import { useState } from 'react'
import { Trash2, Plus, Download } from 'lucide-react'
import { useStore, todayStr } from '../store/StoreContext'
import MetricChart from '../components/MetricChart'

function fmtToday() {
  const d = new Date()
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

const SL = ({ text, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
    <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#FFF', flexShrink: 0 }}>
      {text}
    </span>
    <div style={{ flex: 1, height: 1, backgroundColor: '#1C1C1C' }} />
    {right}
  </div>
)

const inputStyle = {
  background: '#0D0D0D',
  border: '1px solid #1C1C1C',
  borderRadius: 6,
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: '#FFF',
  outline: 'none',
}

export default function Metrics() {
  const { metrics, metricDefs, saveMetricValue, addMetricDef, removeMetricDef } = useStore()
  const today = todayStr()

  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [inputs, setInputs] = useState({})
  const [saved, setSaved] = useState(false)

  function getToday(id) {
    const e = metrics.find(m => m.date === today && m.metricId === id)
    return e ? String(e.value) : ''
  }

  function handleAdd() {
    if (!newName.trim()) return
    addMetricDef(newName, newUnit)
    setNewName(''); setNewUnit(''); setShowAdd(false)
  }

  function handleSave() {
    Object.entries(inputs).forEach(([id, val]) => {
      if (val !== '') saveMetricValue(today, id, val)
    })
    setInputs({})
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function downloadCSV() {
    const defsMap = Object.fromEntries(metricDefs.map(d => [d.id, d]))
    const rows = [['Fecha', 'Métrica', 'Unidad', 'Valor']]
    ;[...metrics]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(m => {
        const def = defsMap[m.metricId]
        if (def) rows.push([m.date, def.name, def.unit || '', m.value])
      })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `metricas_${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const val = (id) => inputs[id] ?? getToday(id)

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '32px 24px 0' }}>

      {/* Definiciones */}
      <SL
        text="MÉTRICAS"
        right={
          <button onClick={() => setShowAdd(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#FFF' }}>
            <Plus size={12} /> AGREGAR
          </button>
        }
      />

      {showAdd && (
        <div style={{ border: '1px solid #1C1C1C', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Nombre"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="text"
              placeholder="ud."
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ ...inputStyle, width: 52, textAlign: 'center' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowAdd(false)}
              style={{ flex: 1, padding: '11px 0', border: '1px solid #222', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#888', background: 'transparent' }}
            >
              CANCELAR
            </button>
            <button
              onClick={handleAdd}
              style={{ flex: 1, padding: '11px 0', background: '#FFF', borderRadius: 6, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#000', border: 'none' }}
            >
              AGREGAR
            </button>
          </div>
        </div>
      )}

      {metricDefs.length === 0 ? (
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888', textAlign: 'center', padding: '20px 0', marginBottom: 24 }}>
          Sin métricas. Agrega una arriba.
        </p>
      ) : (
        <div style={{ borderTop: '1px solid #141414', marginBottom: 28 }}>
          {metricDefs.map(def => (
            <div key={def.id} className="flex items-center py-4" style={{ borderBottom: '1px solid #141414' }}>
              <span style={{ flex: 1, fontFamily: 'Inter', fontSize: 15, color: '#FFF' }}>{def.name}</span>
              {def.unit && <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#888', marginRight: 16 }}>{def.unit}</span>}
              <button onClick={() => removeMetricDef(def.id)} style={{ color: '#2A2A2A' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Registrar hoy */}
      {metricDefs.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SL text={`HOY · ${fmtToday()}`} />
          <div style={{ borderTop: '1px solid #141414', marginBottom: 16 }}>
            {metricDefs.map(def => (
              <div key={def.id} className="flex items-center py-4" style={{ borderBottom: '1px solid #141414' }}>
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
                  style={{ ...inputStyle, width: 90, textAlign: 'right', padding: '8px 10px' }}
                />
              </div>
            ))}
          </div>
          {saved ? (
            <p style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#22C55E', textAlign: 'center', padding: '12px 0' }}>GUARDADO</p>
          ) : (
            <button
              onClick={handleSave}
              style={{ width: '100%', padding: '15px 0', background: '#FFF', borderRadius: 8, fontFamily: 'Inter', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', color: '#000', border: 'none' }}
            >
              GUARDAR
            </button>
          )}
        </div>
      )}

      {/* Historial + CSV */}
      {metricDefs.length > 0 && (
        <div style={{ paddingBottom: 40 }}>
          <SL
            text="HISTORIAL"
            right={metrics.length > 0 && (
              <button
                onClick={downloadCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#FFF', background: 'transparent', border: 'none', padding: 0 }}
              >
                <Download size={13} />
                CSV
              </button>
            )}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
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
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  )
}
