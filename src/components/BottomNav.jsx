const TABS = [
  { id: 'today',   label: 'HOY' },
  { id: 'cycle',   label: 'CICLO' },
  { id: 'metrics', label: 'MÉTRICAS' },
  { id: 'config',  label: 'CONFIG' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex border-t border-[#1C1C1C] bg-black shrink-0">
      {TABS.map(({ id, label }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 py-4"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: active ? 700 : 400,
              letterSpacing: '0.10em',
              color: active ? '#FFFFFF' : '#555555',
            }}
          >
            {label}
          </button>
        )
      })}
    </nav>
  )
}
