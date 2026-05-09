import { useState } from 'react'
import { useStore, todayStr, addDays } from '../store/StoreContext'
import HeatmapGrid from '../components/HeatmapGrid'

const STATUS_COLOR = {
  done: '#22C55E', missed: '#EF4444', rescued: '#F59E0B', pending: '#333',
}
const STATUS_LABEL = {
  done: 'DONE', missed: 'MISSED', rescued: 'RESCATE', pending: '—',
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function calcStats(cycle) {
  const today = todayStr()
  let perfectDays = 0, totalDone = 0, totalTasks = 0, rescues = 0
  let streak = 0, streakBroken = false

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
    if (done / n === 1) perfectDays++
    if (!streakBroken) { if (done / n === 1) streak++; else streakBroken = true }
  }

  const start = new Date(cycle.startDate + 'T12:00:00')
  const now = new Date(today + 'T12:00:00')
  const elapsed = Math.min(Math.floor((now - start) / 86400000) + 1, cycle.durationDays)

  return { perfectDays, elapsedDays: elapsed, totalDone, totalTasks, rescues, streak }
}

export default function Cycle() {
  const { cycle } = useStore()
  const [selectedDate, setSelectedDate] = useState(null)

  if (!cycle || !cycle.active) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-mono text-sm text-muted">SIN CICLO ACTIVO</p>
      </div>
    )
  }

  const stats = calcStats(cycle)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <p className="font-mono text-[10px] text-muted tracking-widest mb-1">{cycle.name.toUpperCase()}</p>
        <p className="font-mono text-xs text-muted/60">
          {formatDate(cycle.startDate)} — {formatDate(addDays(cycle.startDate, cycle.durationDays - 1))}
        </p>
      </div>

      <div className="px-5 pt-5">
        <HeatmapGrid cycle={cycle} onDayTap={setSelectedDate} />
      </div>

      <div className="px-5 pt-6 pb-8">
        <div className="border border-border rounded-lg overflow-hidden">
          {[
            { label: 'DÍAS PERFECTOS',  value: `${stats.perfectDays} / ${stats.elapsedDays}` },
            { label: 'TAREAS CUMPLIDAS', value: `${stats.totalDone} / ${stats.totalTasks}` },
            { label: 'RESCATES USADOS',  value: stats.rescues },
            { label: 'RACHA ACTUAL',     value: `${stats.streak} días` },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid #222' : 'none' }}
            >
              <span className="font-mono text-[11px] text-muted tracking-wide">{label}</span>
              <span className="font-mono text-sm text-primary font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', maxWidth: 430, margin: '0 auto' }}
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="w-full bg-surface rounded-t-2xl p-5 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <span className="font-mono text-sm text-primary font-bold">{formatDate(selectedDate)}</span>
              <button onClick={() => setSelectedDate(null)} className="text-muted font-mono text-xl leading-none">×</button>
            </div>
            {cycle.tasks.map((task, i) => {
              const status = cycle.log[selectedDate]?.[task.id] || 'pending'
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-3"
                  style={{ borderBottom: i < cycle.tasks.length - 1 ? '1px solid #1A1A1A' : 'none' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
                  <span className="flex-1 text-sm text-primary">{task.name}</span>
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
