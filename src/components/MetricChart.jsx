import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

function CustomDot({ cx, cy, value }) {
  if (value == null) return null
  return <circle cx={cx} cy={cy} r={3} fill="#3B82F6" />
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border px-2 py-1 rounded text-xs font-mono text-primary">
      {payload[0].value}
    </div>
  )
}

export default function MetricChart({ label, data }) {
  return (
    <div>
      <div className="font-mono text-xs text-muted mb-3 tracking-wide">{label}</div>
      {data.length < 2 ? (
        <div
          className="flex items-center justify-center text-muted text-[10px] font-mono border border-border rounded"
          style={{ height: 100 }}
        >
          SIN DATOS SUFICIENTES
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -24 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'Space Mono' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'Space Mono' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 4, fill: '#60A5FA' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
