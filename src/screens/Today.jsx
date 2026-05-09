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
  return { day: days[d.getDay()], date: `${d.getDate()} ${months[d.getMonth()]}` }
}

export default function Today() {
  const { cycle, markTask, initTodayLog } = useStore()
  const today = todayStr()
  const yesterday = addDays(today, -1)

  useEffect(() => { initTodayLog() }, [initTodayLog])

  if (!cycle || !cycle.active) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="font-mono text-sm text-muted">SIN CICLO ACTIVO</p>
        <p className="font-mono text-xs" style={{ color: '#333' }}>Crea uno en CONFIG</p>
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
      <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-border shrink-0">
        <div>
          <p className="font-mono text-[10px] text-muted tracking-widest mb-0.5">{day}</p>
          <p className="font-mono text-2xl font-bold text-primary leading-none">{date}</p>
        </div>
        <ProgressRing completed={completed} total={cycle.tasks.length} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {rescueTasks.length > 0 && (
          <div className="px-5 pt-5">
            <p className="text-[10px] font-mono tracking-widest mb-3" style={{ color: '#F59E0B' }}>
              RESCATE DISPONIBLE
            </p>
            <div className="border border-border rounded-lg px-4" style={{ borderColor: '#F59E0B22' }}>
              {rescueTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  status={yesterdayLog[task.id] === 'missed' ? 'pending' : yesterdayLog[task.id]}
                  onToggle={() => markTask(yesterday, task.id, 'rescued')}
                  isRescue
                />
              ))}
            </div>
          </div>
        )}

        {PILLAR_ORDER.filter(p => pillars[p]).map(pillar => (
          <div key={pillar} className="px-5 pt-5">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-mono tracking-widest text-muted">{PILLAR_LABELS[pillar]}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="border border-border rounded-lg px-4">
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
          </div>
        ))}

        <div className="h-8" />
      </div>
    </div>
  )
}
