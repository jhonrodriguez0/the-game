import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceDot
} from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid #222', borderRadius: 6, padding: '6px 10px', fontFamily: 'Inter', fontSize: 13, color: '#FFF' }}>
      {payload[0].value}
    </div>
  )
}

export default function MetricChart({ label, data }) {
  return (
    <div>
      <p style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#FFF', marginBottom: 12 }}>
        {label}
      </p>
      {data.length === 0 ? (
        <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #141414', borderRadius: 6 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#333' }}>Sin datos</span>
        </div>
      ) : data.length === 1 ? (
        <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #141414', borderRadius: 6, gap: 12 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#888' }}>{data[0].date}</span>
          <span style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: 700, color: '#FFF' }}>{data[0].value}</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: -20 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#555', fontSize: 9, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#555', fontSize: 9, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#FFFFFF"
              strokeWidth={1.5}
              dot={{ fill: '#FFF', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#FFF' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
