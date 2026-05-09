export default function TaskItem({ task, status, onToggle, isRescue = false }) {
  const isDone = status === 'done' || status === 'rescued'
  const color = status === 'rescued' ? '#F59E0B' : '#22C55E'

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-border last:border-0">
      <button
        onClick={!isDone ? onToggle : undefined}
        disabled={isDone}
        className="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-100"
        style={{
          borderColor: isDone ? color : '#333333',
          backgroundColor: isDone ? color : 'transparent',
        }}
      >
        {isDone && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3 5.5L8 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm leading-snug"
        style={{
          color: isDone ? '#444' : '#FFFFFF',
          textDecoration: isDone ? 'line-through' : 'none',
        }}
      >
        {task.name}
      </span>

      {isRescue && !isDone && (
        <button
          onClick={onToggle}
          className="shrink-0 text-[10px] font-mono border rounded px-2.5 py-1"
          style={{ color: '#F59E0B', borderColor: '#F59E0B44' }}
        >
          RESCATAR
        </button>
      )}
    </div>
  )
}
