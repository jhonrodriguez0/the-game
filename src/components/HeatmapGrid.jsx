import { todayStr, addDays } from '../store/StoreContext'

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return (d.getDay() + 6) % 7 // 0=Mon … 6=Sun
}

function getCompletionRate(log, date, tasks) {
  const dayLog = log[date]
  if (!dayLog || tasks.length === 0) return 0
  const completed = tasks.filter(t => dayLog[t.id] === 'done' || dayLog[t.id] === 'rescued').length
  return completed / tasks.length
}

function hasRescue(log, date, tasks) {
  const dayLog = log[date]
  if (!dayLog) return false
  return tasks.some(t => dayLog[t.id] === 'rescued')
}

function cellColor(rate) {
  if (rate === 0) return '#1E293B'
  if (rate < 0.5) return '#1D4ED8'
  if (rate < 1) return '#3B82F6'
  return '#60A5FA'
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function HeatmapGrid({ cycle, onDayTap }) {
  const today = todayStr()
  const startOffset = getDayOfWeek(cycle.startDate)

  const cells = []
  for (let i = 0; i < startOffset; i++) {
    cells.push({ empty: true, key: `e${i}` })
  }

  for (let i = 0; i < cycle.durationDays; i++) {
    const date = addDays(cycle.startDate, i)
    const isFuture = date > today
    const isToday = date === today
    const rate = isFuture ? 0 : getCompletionRate(cycle.log, date, cycle.tasks)
    const rescue = !isFuture && hasRescue(cycle.log, date, cycle.tasks)
    cells.push({ date, isFuture, isToday, rate, rescue, key: date })
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-mono text-muted">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map(cell => {
          if (cell.empty) return <div key={cell.key} className="aspect-square" />
          return (
            <div
              key={cell.key}
              onClick={() => !cell.isFuture && onDayTap(cell.date)}
              className={`aspect-square rounded-sm ${!cell.isFuture ? 'cursor-pointer' : ''}`}
              style={{
                backgroundColor: cell.isFuture ? 'transparent' : cellColor(cell.rate),
                border: cell.rescue
                  ? '1.5px solid #F59E0B'
                  : cell.isToday
                  ? '1.5px solid #3B82F6'
                  : cell.isFuture
                  ? '1px solid #334155'
                  : 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
