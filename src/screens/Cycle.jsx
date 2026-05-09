import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useStore, todayStr, addDays } from '../store/StoreContext'
import HeatmapGrid from '../components/HeatmapGrid'

const STATUS_COLOR = { done: '#FFF', missed: '#EF4444', rescued: '#F59E0B', pending: '#333' }
const STATUS_LABEL = { done: 'DONE', missed: 'MISSED', rescued: 'RESCATE', pending: '—' }

function fmt(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function fmtShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getDate()} ${months[d.getMonth()]}`
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
    totalDone += done; totalTasks += n
    rescues += cycle.tasks.filter(t => dayLog[t.id] === 'rescued').length
    if (done === n) perfectDays++
    if (!streakBroken) { if (done === n) streak++; else streakBroken = true }
  }

  const start = new Date(cycle.startDate + 'T12:00:00')
  const now = new Date(today + 'T12:00:00')
  const elapsed = Math.min(Math.floor((now - start) / 86400000) + 1, cycle.durationDays)
  const pct = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0
  return { perfectDays, elapsedDays: elapsed, totalDone, totalTasks, rescues, streak, pct }
}

function DayModal({ cycle, date, onClose }) {
  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', maxWidth: 430, margin: '0 auto' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl p-6 pb-10"
        style={{ backgroundColor: '#0D0D0D' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <span style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#FFF' }}>{fmt(date)}</span>
          <button onClick={onClose} style={{ fontFamily: 'Inter', fontSize: 24, color: '#555', lineHeight: 1 }}>×</button>
        </div>
        {cycle.tasks.map((task, i) => {
          const status = cycle.log[date]?.[task.id] || 'pending'
          return (
            <div key={task.id} className="flex items-center gap-3 py-4" style={{ borderBottom: i < cycle.tasks.length - 1 ? '1px solid #141414' : 'none' }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
              <span style={{ flex: 1, fontFamily: 'Inter', fontSize: 14, color: '#FFF' }}>{task.name}</span>
              <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: STATUS_COLOR[status] }}>
                {STATUS_LABEL[status]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CycleBlock({ cycle, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [selectedDate, setSelectedDate] = useState(null)
  const stats = calcStats(cycle)

  const STATS = [
    { label: 'DÍAS PERFECTOS',  value: `${stats.perfectDays} / ${stats.elapsedDays}` },
    { label: 'TAREAS CUMPLIDAS', value: `${stats.totalDone} / ${stats.totalTasks}` },
    { label: 'RESCATES USADOS',  value: stats.rescues },
    { label: 'RACHA FINAL',      value: `${stats.streak} días` },
  ]

  return (
    <div style={{ borderBottom: '1px solid #141414' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center py-5 text-left"
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#FFF', marginBottom: 3 }}>
            {cycle.name}
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888' }}>
            {fmtShort(cycle.startDate)} — {fmtShort(addDays(cycle.startDate, cycle.durationDays - 1))}
            {' · '}{stats.pct}% completado
          </p>
        </div>
        {open
          ? <ChevronUp size={16} color="#555" />
          : <ChevronDown size={16} color="#555" />
        }
      </button>

      {open && (
        <div style={{ paddingBottom: 24 }}>
          <HeatmapGrid cycle={cycle} onDayTap={setSelectedDate} />
          <div style={{ marginTop: 20 }}>
            {STATS.map(({ label, value }, i) => (
              <div
                key={label}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: i < STATS.length - 1 ? '1px solid #141414' : 'none' }}
              >
                <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#FFF' }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: '#FFF' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && (
        <DayModal cycle={cycle} date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  )
}

export default function Cycle() {
  const { cycle, history } = useStore()
  const hasCurrent = cycle && cycle.active
  const hasHistory = history && history.length > 0

  if (!hasCurrent && !hasHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#555', letterSpacing: '0.08em' }}>SIN CICLO ACTIVO</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full px-6">
      {hasCurrent && (
        <>
          <div className="pt-8 pb-4" style={{ borderBottom: '1px solid #141414' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#FFF', marginBottom: 2 }}>
              EN CURSO
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 26, fontWeight: 800, color: '#FFF', lineHeight: 1.1 }}>
              {cycle.name}
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888', marginTop: 4 }}>
              {fmt(cycle.startDate)} — {fmt(addDays(cycle.startDate, cycle.durationDays - 1))}
            </p>
          </div>
          <div className="pt-6 pb-6">
            <CycleBlock cycle={cycle} defaultOpen={true} />
          </div>
        </>
      )}

      {hasHistory && (
        <div className={hasCurrent ? '' : 'pt-8'}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#FFF', marginBottom: 0 }}>
            HISTORIAL
          </p>
          {history.map(c => (
            <CycleBlock key={c.id} cycle={c} defaultOpen={false} />
          ))}
          <div style={{ height: 32 }} />
        </div>
      )}
    </div>
  )
}
