export default function ProgressRing({ completed, total }) {
  const r = 20
  const cx = 26
  const cy = 26
  const circumference = 2 * Math.PI * r
  const progress = total === 0 ? 0 : completed / total
  const dash = progress * circumference

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A1A" strokeWidth="3" />
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
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize="11" fontFamily="Space Mono" fontWeight="bold">
        {completed}/{total}
      </text>
    </svg>
  )
}
