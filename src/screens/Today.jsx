import { useEffect } from 'react'
import { useStore, todayStr, addDays } from '../store/StoreContext'
import ProgressRing from '../components/ProgressRing'
import TaskItem from '../components/TaskItem'

const PILLAR_LABELS = {
  fisico: 'FÍSICO', dinero: 'DINERO', social: 'SOCIAL', mente: 'MENTE', alma: 'ALMA',
}
const PILLAR_ORDER = ['fisico', 'dinero', 'social', 'mente', 'alma']

function formatDateHeader(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return {
    day: days[d.getDay()],
    date: `${d.getDate()} ${months[d.getMonth()]}`,
  }
}

const label = (text, color = '#555') => (
  <span style={{
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.14em',
    color,
  }}>
    {text}
  </span>
)

export default function Today() {
  const { cycle, markTask, initTodayLog } = useStore()
  const today = todayStr()
  const yesterday = addDays(today, -1)

  useEffect(() => { initTodayLog() }, [initTodayLog])

  if (!cycle || !cycle.active) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#555', letterSpacing: '0.08em' }}>
          SIN CICLO ACTIVO
        </p>
        <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#333' }}>
          Crea uno en CONFIG
        </p>
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
      <div className="flex items-end justify-between px-6 pt-8 pb-6" style={{ borderBottom: '1px solid #141414' }}>
        <div>
          <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', color: '#555', marginBottom: 6 }}>
            {day}
          </p>
          <p style={{ fontFamily: 'Inter', fontSize: 36, fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
            {date}
          </p>
        </div>
        <ProgressRing completed={completed} total={cycle.tasks.length} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Rescue */}
        {rescueTasks.length > 0 && (
          <div className="px-6 pt-6">
            <div className="flex items-center gap-3 mb-1">
              {label('RESCATE DISPONIBLE', '#F59E0B')}
              <div className="flex-1" style={{ height: 1, backgroundColor: '#F59E0B22' }} />
            </div>
            {rescueTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                status={yesterdayLog[task.id]}
                onToggle={() => markTask(yesterday, task.id, 'rescued')}
                isRescue
              />
            ))}
          </div>
        )}

        {/* Tasks by pillar */}
        {PILLAR_ORDER.filter(p => pillars[p]).map(pillar => (
          <div key={pillar} className="px-6 pt-6">
            <div className="flex items-center gap-3 mb-1">
              {label(PILLAR_LABELS[pillar])}
              <div className="flex-1" style={{ height: 1, backgroundColor: '#1C1C1C' }} />
            </div>
            {pillars[pillar].map(task => (
              <TaskItem
                key={task.id}
                task={task}
                status={todayLog[task.id]}
                onToggle={() => {
                  const s = todayLog[task.id]
                  if (s !== 'done' && s !== 'rescued') markTask(today, task.id, 'done')
                }}
              />
            ))}
          </div>
        ))}

        <div className="h-10" />
      </div>
    </div>
  )
}
