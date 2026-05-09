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
    const dl = cycle.log[date] || {}
    const n = cycle.tasks.length
    if (!n) continue
    const done = cycle.tasks.filter(t => dl[t.id] === 'done' || dl[t.id] === 'rescued').length
    totalDone += done; totalTasks += n
    rescues += cycle.tasks.filter(t => dl[t.id] === 'rescued').length
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
      style={{ backgroundColor: 'rgba(0,0,0,0.88)', maxWidth: 430, margin: '0 auto' }}
      onClick={onClose}
    >
      <div className="w-full rounded-t-2xl p-6 pb-10" style={{ backgroundColor: '#0D0D0D' }} onClick={e => e.stopPropagation()}>
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

function CycleBlock({ cycle, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const [selectedDate, setSelectedDate] = useState(null)
  const stats = calcStats(cycle)

  const STATS = [
    { label: 'DÍAS PERFECTOS',  value: `${stats.perfectDays} / ${stats.elapsedDays}` },
    { label: 'TAREAS CUMPLIDAS', value: `${stats.totalDone} / ${stats.totalTasks}` },
    { label: 'RESCATES USADOS',  value: stats.rescues },
    { label: 'RACHA',            value: `${stats.streak} días` },
  ]

  return (
    <div style={{ borderBottom: '1px solid #141414' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center py-5 text-left">
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 3 }}>{cycle.name}</p>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#888' }}>
            {fmtShort(cycle.startDate)} — {fmtShort(addDays(cycle.startDate, cycle.durationDays - 1))}
            {' · '}{stats.pct}%
          </p>
        </div>
        {open ? <ChevronUp size={15} color="#555" /> : <ChevronDown size={15} color="#555" />}
      </button>

      {open && (
        <div style={{ paddingBottom: 24 }}>
          <HeatmapGrid cycle={cycle} onDayTap={setSelectedDate} />
          <div style={{ marginTop: 16 }}>
            {STATS.map(({ label, value }, i) => (
              <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: i < STATS.length - 1 ? '1px solid #141414' : 'none' }}>
                <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#FFF' }}>{label}</span>
                <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: '#FFF' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && <DayModal cycle={cycle} date={selectedDate} onClose={() => setSelectedDate(null)} />}
    </div>
  )
}

export default function Cycle() {
  const { activeCycles, history } = useStore()
  const hasAny = activeCycles.length > 0 || history.length > 0

  if (!hasAny) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#555', letterSpacing: '0.08em' }}>SIN CICLOS</p>
      </div>
    )
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '0 24px' }}>
      {activeCycles.length > 0 && (
        <>
          <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#FFF', padding: '28px 0 4px' }}>
            EN CURSO
          </p>
          {activeCycles.map(c => <CycleBlock key={c.id} cycle={c} defaultOpen={activeCycles.length === 1} />)}
        </>
      )}

      {history.length > 0 && (
        <>
          <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#FFF', padding: '28px 0 4px' }}>
            HISTORIAL
          </p>
          {history.map(c => <CycleBlock key={c.id} cycle={c} defaultOpen={false} />)}
        </>
      )}
      <div style={{ height: 32 }} />
    </div>
  )
}
