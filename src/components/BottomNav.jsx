const TABS = [
  { id: 'today', label: 'HOY' },
  { id: 'cycle', label: 'CICLO' },
  { id: 'metrics', label: 'MÉTRICAS' },
  { id: 'config', label: 'CONFIG' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex border-t border-border bg-bg shrink-0">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-4 text-[10px] font-mono font-bold tracking-wide transition-colors ${
            activeTab === tab.id ? 'text-accent' : 'text-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
