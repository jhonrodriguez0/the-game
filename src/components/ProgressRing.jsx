export default function ProgressRing({ completed, total }) {
  const r = 22
  const cx = 28
  const cy = 28
  const circumference = 2 * Math.PI * r
  const progress = total === 0 ? 0 : completed / total
  const dash = progress * circumference

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A1A" strokeWidth="2" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 100ms ease' }}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FFFFFF"
        fontSize="11"
        fontFamily="Inter, sans-serif"
        fontWeight="700"
      >
        {completed}/{total}
      </text>
    </svg>
  )
}
