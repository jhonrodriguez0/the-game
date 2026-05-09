export default function TaskItem({ task, status, onToggle, isRescue = false }) {
  const isDone = status === 'done' || status === 'rescued'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <button
        onClick={!isDone ? onToggle : undefined}
        disabled={isDone}
        className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-100"
        style={{
          borderColor: isDone ? (status === 'rescued' ? '#F59E0B' : '#22C55E') : '#334155',
          backgroundColor: isDone ? (status === 'rescued' ? '#F59E0B' : '#22C55E') : 'transparent',
        }}
      >
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm"
        style={{
          color: isDone ? '#64748B' : '#F8FAFC',
          textDecoration: isDone ? 'line-through' : 'none',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {task.name}
      </span>

      {isRescue && !isDone && (
        <button
          onClick={onToggle}
          className="shrink-0 text-[10px] font-mono text-rescued border border-rescued/50 px-2 py-1 rounded"
        >
          RESCATAR
        </button>
      )}
    </div>
  )
}
