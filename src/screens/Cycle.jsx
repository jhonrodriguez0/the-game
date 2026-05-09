import { useState } from 'react'
import { useStore, todayStr, addDays } from '../store/StoreContext'
import HeatmapGrid from '../components/HeatmapGrid'

const STATUS_COLOR = {
  done: '#22C55E',
  missed: '#EF4444',
  rescued: '#F59E0B',
  pending: '#64748B',
}
const STATUS_LABEL = { done: 'DONE', missed: 'MISSED', rescued: 'RESCATE', pending: 'PENDIENTE' }

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function calcStats(cycle) {
  const today = todayStr()
  let perfectDays = 0
  let totalDone = 0
  let totalTasks = 0
  let rescues = 0
  let streak = 0
  let streakBroken = false

  for (let i = cycle.durationDays - 1; i >= 0; i--) {
    const date = addDays(cycle.startDate, i)
    if (date > today) continue
    const dayLog = cycle.log[date] || {}
    const n = cycle.tasks.length
    if (n === 0) continue

    const done = cycle.tasks.filter(t => dayLog[t.id] === 'done' || dayLog[t.id] === 'rescued').length
    const rescued = cycle.tasks.filter(t => dayLog[t.id] === 'rescued').length

    totalDone += done
    totalTasks += n
    rescues += rescued

    const rate = done / n
    if (rate === 1) perfectDays++

    if (!streakBroken) {
      if (rate === 1) streak++
      else streakBroken = true
    }
  }

  const elapsedDays = Math.min(
    Math.floor((new Date(today + 'T12:00:00') - new Date(cycle.startDate + 'T12:00:00')) / 86400000) + 1,
    cycle.durationDays
  )

  return { perfectDays, elapsedDays, totalDone, totalTasks, rescues, streak }
}

export default function Cycle() {
  const { cycle } = useStore()
  const [selectedDate, setSelectedDate] = useState(null)

  if (!cycle || !cycle.active) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="font-mono text-sm text-muted">SIN CICLO ACTIVO</p>
      </div>
    )
  }

  const stats = calcStats(cycle)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <p className="font-mono text-xs text-muted tracking-wide">{cycle.name.toUpperCase()}</p>
        <p className="font-mono text-[10px] text-muted/60 mt-0.5">
          {formatDate(cycle.startDate)} — {formatDate(addDays(cycle.startDate, cycle.durationDays - 1))}
        </p>
      </div>

      <div className="px-5 pt-5">
        <HeatmapGrid cycle={cycle} onDayTap={setSelectedDate} />
      </div>

      <div className="px-5 pt-6 space-y-3 pb-6">
        {[
          { label: 'DÍAS PERFECTOS', value: `${stats.perfectDays} / ${stats.elapsedDays}` },
          { label: 'TAREAS CUMPLIDAS', value: `${stats.totalDone} / ${stats.totalTasks}` },
          { label: 'RESCATES USADOS', value: stats.rescues },
          { label: 'RACHA ACTUAL', value: `${stats.streak} días` },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
            <span className="font-mono text-xs text-muted tracking-wide">{label}</span>
            <span className="font-mono text-sm text-primary font-bold">{value}</span>
          </div>
        ))}
      </div>

      {selectedDate && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end justify-center z-50"
          style={{ maxWidth: 430, margin: '0 auto' }}
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="w-full bg-surface rounded-t-xl p-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-sm text-primary font-bold">{formatDate(selectedDate)}</span>
              <button onClick={() => setSelectedDate(null)} className="text-muted font-mono text-lg leading-none">×</button>
            </div>
            {cycle.tasks.map(task => {
              const status = cycle.log[selectedDate]?.[task.id] || 'pending'
              return (
                <div key={task.id} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
                  <span className="text-sm text-primary flex-1 font-sans">{task.name}</span>
                  <span className="text-[10px] font-mono" style={{ color: STATUS_COLOR[status] }}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
