export default function ProgressRing({ completed, total }) {
  const r = 18
  const cx = 24
  const cy = 24
  const circumference = 2 * Math.PI * r
  const progress = total === 0 ? 0 : completed / total
  const dash = progress * circumference

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth="3" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 100ms ease' }}
      />
      <text
        x={cx} y={cy + 4}
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="10"
        fontFamily="Space Mono"
      >
        {completed}/{total}
      </text>
    </svg>
  )
}
