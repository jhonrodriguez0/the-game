import { useEffect, useState } from 'react'
import { useStore, todayStr, addDays } from '../store/StoreContext'
import ProgressRing from '../components/ProgressRing'
import TaskItem from '../components/TaskItem'

const PILLAR_LABELS = {
  fisico: 'FÍSICO', dinero: 'DINERO', social: 'SOCIAL', mente: 'MENTE', alma: 'ALMA',
}
const PILLAR_ORDER = ['fisico', 'dinero', 'social', 'mente', 'alma']

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const days = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO']
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return { day: days[d.getDay()], date: `${d.getDate()} ${months[d.getMonth()]}` }
}

export default function Today() {
  const { activeCycles, markTask, initTodayLog } = useStore()
  const today = todayStr()
  const yesterday = addDays(today, -1)

  const [selectedId, setSelectedId] = useState(null)

  // Sync selectedId when activeCycles changes
  const cycle = activeCycles.find(c => c.id === selectedId) || activeCycles[0] || null

  useEffect(() => {
    if (activeCycles.length > 0) {
      const id = activeCycles.find(c => c.id === selectedId)?.id || activeCycles[0].id
      setSelectedId(id)
      initTodayLog(id)
    }
  }, [activeCycles.length])

  if (!cycle) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#888', letterSpacing: '0.08em' }}>SIN CICLOS ACTIVOS</p>
        <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#444' }}>Crea uno en CONFIG</p>
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

  const { day, date } = formatDateHeader(today)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #141414', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', color: '#FFF', marginBottom: 6 }}>{day}</p>
            <p style={{ fontFamily: 'Inter', fontSize: 36, fontWeight: 800, color: '#FFF', lineHeight: 1 }}>{date}</p>
          </div>
          <ProgressRing completed={completed} total={cycle.tasks.length} />
        </div>

        {/* Cycle selector pills — only if more than one active cycle */}
        {activeCycles.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 2 }}>
            {activeCycles.map(c => {
              const active = c.id === cycle.id
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); initTodayLog(c.id) }}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1px solid ${active ? '#FFF' : '#2A2A2A'}`,
                    background: active ? '#FFF' : 'transparent',
                    fontFamily: 'Inter',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: active ? '#000' : '#888',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Rescue */}
        {rescueTasks.length > 0 && (
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#F59E0B', flexShrink: 0 }}>RESCATE</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#F59E0B22' }} />
            </div>
            {rescueTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                status={yesterdayLog[task.id]}
                onToggle={() => markTask(cycle.id, yesterday, task.id, 'rescued')}
                isRescue
              />
            ))}
          </div>
        )}

        {/* Tasks by pillar */}
        {PILLAR_ORDER.filter(p => pillars[p]).map(pillar => (
          <div key={pillar} style={{ padding: '20px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#FFF', flexShrink: 0 }}>
                {PILLAR_LABELS[pillar]}
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#1C1C1C' }} />
            </div>
            {pillars[pillar].map(task => (
              <TaskItem
                key={task.id}
                task={task}
                status={todayLog[task.id]}
                onToggle={() => {
                  const s = todayLog[task.id]
                  if (s !== 'done' && s !== 'rescued') markTask(cycle.id, today, task.id, 'done')
                }}
              />
            ))}
          </div>
        ))}

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
