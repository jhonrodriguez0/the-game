import { todayStr, addDays } from '../store/StoreContext'

function getDow(dateStr) {
  return (new Date(dateStr + 'T12:00:00').getDay() + 6) % 7 // 0=Mon
}

function getRate(log, date, tasks) {
  const dayLog = log[date]
  if (!dayLog || !tasks.length) return null // null = no data yet
  const done = tasks.filter(t => dayLog[t.id] === 'done' || dayLog[t.id] === 'rescued').length
  return done / tasks.length
}

function hasRescue(log, date, tasks) {
  const dl = log[date]
  return dl ? tasks.some(t => dl[t.id] === 'rescued') : false
}

function cellStyle(rate, isFuture, isToday, rescue) {
  let bg, textColor, border = 'none'

  if (isFuture) {
    bg = 'transparent'
    textColor = '#282828'
    border = '1px solid #181818'
  } else if (rate === null || rate === 0) {
    bg = '#0D0D0D'
    textColor = '#2A2A2A'
  } else if (rate < 0.5) {
    bg = '#1C1C1C'
    textColor = '#555'
  } else if (rate < 1) {
    bg = '#2E2E2E'
    textColor = '#888'
  } else {
    bg = '#EBEBEB'
    textColor = '#00000055'
  }

  if (rescue) border = '1.5px solid #F59E0B'
  if (isToday) border = '1.5px solid #FFFFFF'

  return { bg, textColor, border }
}

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function HeatmapGrid({ cycle, onDayTap }) {
  const today = todayStr()
  const offset = getDow(cycle.startDate)

  const cells = []
  for (let i = 0; i < offset; i++) cells.push({ empty: true, key: `e${i}` })

  for (let i = 0; i < cycle.durationDays; i++) {
    const date = addDays(cycle.startDate, i)
    const d = new Date(date + 'T12:00:00')
    cells.push({
      key: date, date,
      dayNum: d.getDate(),
      isFuture: date > today,
      isToday: date === today,
      rate: date > today ? null : getRate(cycle.log, date, cycle.tasks),
      rescue: hasRescue(cycle.log, date, cycle.tasks),
    })
  }

  return (
    <div>
      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
        {DOW.map(d => (
          <div key={d} style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 10, fontWeight: 600, color: '#3A3A3A', paddingBottom: 4 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map(cell => {
          if (cell.empty) return <div key={cell.key} style={{ aspectRatio: '1' }} />
          const { bg, textColor, border } = cellStyle(cell.rate, cell.isFuture, cell.isToday, cell.rescue)
          return (
            <div
              key={cell.key}
              onClick={() => !cell.isFuture && onDayTap && onDayTap(cell.date)}
              style={{
                aspectRatio: '1',
                backgroundColor: bg,
                border,
                borderRadius: 4,
                cursor: cell.isFuture ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                padding: '3px 4px',
              }}
            >
              <span style={{
                fontFamily: 'Inter',
                fontSize: 9,
                fontWeight: cell.isToday ? 800 : 500,
                color: cell.isToday ? '#FFF' : textColor,
              }}>
                {cell.dayNum}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
        {[
          { bg: '#0D0D0D', label: '0%', border: '1px solid #222' },
          { bg: '#1C1C1C', label: '1–49%' },
          { bg: '#2E2E2E', label: '50–99%' },
          { bg: '#EBEBEB', label: '100%' },
        ].map(({ bg, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: bg, border: border || 'none', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Inter', fontSize: 9, color: '#444' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
