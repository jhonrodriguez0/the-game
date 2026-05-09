import { useState } from 'react'
import { useStore, todayStr, addDays } from '../store/StoreContext'
import HeatmapGrid from '../components/HeatmapGrid'

const STATUS_COLOR = { done: '#FFF', missed: '#EF4444', rescued: '#F59E0B', pending: '#333' }
const STATUS_LABEL = { done: 'DONE', missed: 'MISSED', rescued: 'RESCATE', pending: '—' }

function fmt(dateStr) {
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
    if (!n) continue
    const done = cycle.tasks.filter(t => dayLog[t.id] === 'done' || dayLog[t.id] === 'rescued').length
    totalDone += done
    totalTasks += n
    rescues += cycle.tasks.filter(t => dayLog[t.id] === 'rescued').length
    if (done === n) perfectDays++
    if (!streakBroken) { if (done === n) streak++; else streakBroken = true }
  }

  const start = new Date(cycle.startDate + 'T12:00:00')
  const now = new Date(today + 'T12:00:00')
  const elapsed = Math.min(Math.floor((now - start) / 86400000) + 1, cycle.durationDays)
  return { perfectDays, elapsedDays: elapsed, totalDone, totalTasks, rescues, streak }
}

const F = (s, opts = {}) => (
  <span style={{ fontFamily: 'Inter, sans-serif', ...opts }}>{s}</span>
)

export default function Cycle() {
  const { cycle } = useStore()
  const [selectedDate, setSelectedDate] = useState(null)

  if (!cycle || !cycle.active) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#555', letterSpacing: '0.08em' }}>SIN CICLO ACTIVO</p>
      </div>
    )
  }

  const stats = calcStats(cycle)

  const STATS = [
    { label: 'DÍAS PERFECTOS',  value: `${stats.perfectDays} / ${stats.elapsedDays}` },
    { label: 'TAREAS CUMPLIDAS', value: `${stats.totalDone} / ${stats.totalTasks}` },
    { label: 'RESCATES USADOS',  value: stats.rescues },
    { label: 'RACHA ACTUAL',     value: `${stats.streak} días` },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: '1px solid #141414' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: '#555', marginBottom: 6 }}>
          {cycle.name.toUpperCase()}
        </p>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#444' }}>
          {fmt(cycle.startDate)} — {fmt(addDays(cycle.startDate, cycle.durationDays - 1))}
        </p>
      </div>

      <div className="px-6 pt-6">
        <HeatmapGrid cycle={cycle} onDayTap={setSelectedDate} />
      </div>

      <div className="px-6 pt-8 pb-10">
        {STATS.map(({ label, value }, i) => (
          <div
            key={label}
            className="flex items-center justify-between py-4"
            style={{ borderBottom: i < STATS.length - 1 ? '1px solid #141414' : 'none' }}
          >
            <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#555' }}>
              {label}
            </span>
            <span style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#FFF' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {selectedDate && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', maxWidth: 430, margin: '0 auto' }}
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="w-full rounded-t-2xl p-6 pb-10"
            style={{ backgroundColor: '#0D0D0D' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#FFF' }}>{fmt(selectedDate)}</span>
              <button
                onClick={() => setSelectedDate(null)}
                style={{ fontFamily: 'Inter', fontSize: 22, color: '#555', lineHeight: 1 }}
              >×</button>
            </div>
            {cycle.tasks.map((task, i) => {
              const status = cycle.log[selectedDate]?.[task.id] || 'pending'
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-4"
                  style={{ borderBottom: i < cycle.tasks.length - 1 ? '1px solid #141414' : 'none' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
                  <span className="flex-1" style={{ fontFamily: 'Inter', fontSize: 14, color: '#FFF' }}>{task.name}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: STATUS_COLOR[status] }}>
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
