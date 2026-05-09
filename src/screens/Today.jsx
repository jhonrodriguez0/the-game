import { useEffect, useState } from 'react'
import { useStore, todayStr, addDays } from '../store/StoreContext'
import ProgressRing from '../components/ProgressRing'
import TaskItem from '../components/TaskItem'

const PILLAR_ICONS = { dinero: '$', fisico: '◆', social: '◎', mente: '▲', alma: '✦' }
const PILLAR_LABELS = { dinero: 'DINERO', fisico: 'FÍSICO', social: 'SOCIAL', mente: 'MENTE', alma: 'ALMA' }
const PILLAR_ORDER = ['fisico', 'dinero', 'social', 'mente', 'alma']

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

export default function Today() {
  const { cycle, metrics, markTask, saveMetric, initTodayLog } = useStore()
  const today = todayStr()
  const yesterday = addDays(today, -1)

  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [sleep, setSleep] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    initTodayLog()
  }, [initTodayLog])

  if (!cycle || !cycle.active) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="font-mono text-sm text-muted">SIN CICLO ACTIVO</p>
        <p className="font-mono text-xs text-muted/60">Crea uno en CONFIG</p>
      </div>
    )
  }

  const todayLog = cycle.log[today] ?? {}
  const yesterdayLog = cycle.log[yesterday] ?? {}

  const rescueTasks = cycle.tasks.filter(t => yesterdayLog[t.id] === 'missed')

  const pillars = {}
  cycle.tasks.forEach(t => {
    if (!pillars[t.pillar]) pillars[t.pillar] = []
    pillars[t.pillar].push(t)
  })

  const completed = cycle.tasks.filter(t => {
    const s = todayLog[t.id]
    return s === 'done' || s === 'rescued'
  }).length

  const todayMetrics = metrics.find(m => m.date === today)

  function handleSaveMetrics(e) {
    e.preventDefault()
    if (!weight && !bodyFat && !sleep) return
    saveMetric({
      date: today,
      weight: weight ? parseFloat(weight) : null,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      sleep: sleep ? parseFloat(sleep) : null,
    })
    setWeight('')
    setBodyFat('')
    setSleep('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <span className="font-mono text-sm font-bold text-primary">{formatDateHeader(today)}</span>
        <ProgressRing completed={completed} total={cycle.tasks.length} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {rescueTasks.length > 0 && (
          <div className="px-5 pt-4">
            <div className="text-[10px] font-mono text-rescued mb-2 tracking-wide">RESCATE DISPONIBLE</div>
            <div className="bg-surface rounded-lg px-4">
              {rescueTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  status={todayLog[task.id] === 'rescued' ? 'rescued' : yesterdayLog[task.id]}
                  onToggle={() => {
                    if (yesterdayLog[task.id] === 'missed') {
                      markTask(yesterday, task.id, 'rescued')
                    }
                  }}
                  isRescue
                />
              ))}
            </div>
          </div>
        )}

        {PILLAR_ORDER.filter(p => pillars[p]).map(pillar => (
          <div key={pillar} className="px-5 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted">{PILLAR_ICONS[pillar]}</span>
              <span className="text-[10px] font-mono text-muted tracking-wide">{PILLAR_LABELS[pillar]}</span>
              <div className="flex-1 h-px bg-border ml-1" />
            </div>
            <div className="bg-surface rounded-lg px-4">
              {pillars[pillar].map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  status={todayLog[task.id]}
                  onToggle={() => {
                    const s = todayLog[task.id]
                    if (s !== 'done' && s !== 'rescued') {
                      markTask(today, task.id, 'done')
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}

        {!todayMetrics && !saved && (
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono text-muted tracking-wide">MÉTRICAS DE HOY</span>
              <div className="flex-1 h-px bg-border ml-1" />
            </div>
            <form onSubmit={handleSaveMetrics} className="bg-surface rounded-lg p-4 space-y-3">
              {[
                { label: 'Peso (kg)', val: weight, set: setWeight, step: '0.1' },
                { label: 'Grasa (%)', val: bodyFat, set: setBodyFat, step: '0.1' },
                { label: 'Sueño (h)', val: sleep, set: setSleep, step: '0.5' },
              ].map(({ label, val, set, step }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted">{label}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={step}
                    min="0"
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder="—"
                    className="w-24 bg-bg border border-border rounded px-2 py-1 text-right text-sm text-primary font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2 bg-accent text-white font-mono text-xs rounded mt-1 active:opacity-70"
              >
                GUARDAR
              </button>
            </form>
          </div>
        )}

        {saved && (
          <div className="px-5 pt-4 pb-4">
            <p className="text-center text-xs font-mono text-done">MÉTRICAS GUARDADAS</p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
