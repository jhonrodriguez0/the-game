import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useStore, todayStr } from '../store/StoreContext'
import MetricChart from '../components/MetricChart'

function formatToday() {
  const d = new Date()
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

export default function Metrics() {
  const { metrics, metricDefs, saveMetricValue, addMetricDef, removeMetricDef } = useStore()
  const today = todayStr()

  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const [inputs, setInputs] = useState({})
  const [savedToday, setSavedToday] = useState(false)

  function getValueForToday(defId) {
    const entry = metrics.find(m => m.date === today && m.metricId === defId)
    return entry ? String(entry.value) : ''
  }

  function handleAdd() {
    if (!newName.trim()) return
    addMetricDef(newName, newUnit || '')
    setNewName('')
    setNewUnit('')
    setShowAddForm(false)
  }

  function handleSave() {
    Object.entries(inputs).forEach(([defId, val]) => {
      if (val !== '') saveMetricValue(today, defId, val)
    })
    setInputs({})
    setSavedToday(true)
    setTimeout(() => setSavedToday(false), 2500)
  }

  function getChartData(defId) {
    return metrics
      .filter(m => m.metricId === defId)
      .map(m => ({ date: m.date.slice(5).replace('-', '/'), value: m.value }))
  }

  const inputVal = (defId) => inputs[defId] ?? getValueForToday(defId)

  return (
    <div className="overflow-y-auto h-full">

      {/* — DEFINICIONES — */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] text-muted tracking-widest">MÉTRICAS</span>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-accent"
          >
            <Plus size={12} />
            AGREGAR
          </button>
        </div>

        {showAddForm && (
          <div className="border border-border rounded-lg p-4 mb-4 space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre (ej. Peso)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
                className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm text-primary font-sans focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="Unidad"
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="w-20 bg-surface border border-border rounded px-3 py-2 text-sm text-primary font-mono text-center focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 border border-border rounded font-mono text-xs text-muted"
              >
                CANCELAR
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 bg-accent rounded font-mono text-xs text-white"
              >
                AGREGAR
              </button>
            </div>
          </div>
        )}

        {metricDefs.length === 0 ? (
          <p className="text-xs text-muted font-mono py-4 text-center">Sin métricas. Agrega una arriba.</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden mb-6">
            {metricDefs.map((def, i) => (
              <div
                key={def.id}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < metricDefs.length - 1 ? '1px solid #222' : 'none' }}
              >
                <span className="flex-1 text-sm text-primary">{def.name}</span>
                {def.unit && (
                  <span className="font-mono text-xs text-muted">{def.unit}</span>
                )}
                <button
                  onClick={() => removeMetricDef(def.id)}
                  className="text-muted hover:text-missed transition-colors ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* — REGISTRAR HOY — */}
      {metricDefs.length > 0 && (
        <div className="px-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] text-muted tracking-widest">HOY · {formatToday()}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="border border-border rounded-lg px-4 mb-6">
            {metricDefs.map((def, i) => (
              <div
                key={def.id}
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: i < metricDefs.length - 1 ? '1px solid #222' : 'none' }}
              >
                <span className="text-sm text-primary">
                  {def.name}{def.unit ? ` (${def.unit})` : ''}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={inputVal(def.id)}
                  onChange={e => setInputs(prev => ({ ...prev, [def.id]: e.target.value }))}
                  placeholder="—"
                  className="w-24 bg-surface-2 border border-border rounded px-2 py-1.5 text-right text-sm text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>

          {savedToday ? (
            <p className="text-center text-xs font-mono text-done mb-6">GUARDADO</p>
          ) : (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-accent rounded font-mono text-xs text-white mb-6 active:opacity-70"
            >
              GUARDAR
            </button>
          )}
        </div>
      )}

      {/* — GRÁFICAS — */}
      {metricDefs.length > 0 && (
        <div className="px-5 pb-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[10px] text-muted tracking-widest">HISTORIAL</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          {metricDefs.map(def => (
            <MetricChart
              key={def.id}
              label={`${def.name.toUpperCase()}${def.unit ? ` (${def.unit})` : ''}`}
              data={getChartData(def.id)}
            />
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
