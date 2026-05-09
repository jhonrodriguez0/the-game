export default function TaskItem({ task, status, onToggle, isRescue = false }) {
  const isDone = status === 'done' || status === 'rescued'
  const ringColor = isDone ? (status === 'rescued' ? '#F59E0B' : '#FFFFFF') : '#2A2A2A'

  return (
    <div
      className="flex items-center gap-4 py-4"
      style={{ borderBottom: '1px solid #141414' }}
    >
      <button
        onClick={!isDone ? onToggle : undefined}
        disabled={isDone}
        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-100"
        style={{ border: `1.5px solid ${ringColor}`, backgroundColor: isDone ? ringColor : 'transparent' }}
      >
        {isDone && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-[15px]"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          color: isDone ? '#333333' : '#FFFFFF',
          textDecoration: isDone ? 'line-through' : 'none',
        }}
      >
        {task.name}
      </span>

      {isRescue && !isDone && (
        <button
          onClick={onToggle}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#F59E0B',
            border: '1px solid #F59E0B44',
            borderRadius: 4,
            padding: '4px 10px',
          }}
        >
          RESCATAR
        </button>
      )}
    </div>
  )
}
