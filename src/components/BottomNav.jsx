import { Sun, Activity, TrendingUp, SlidersHorizontal } from 'lucide-react'

const TABS = [
  { id: 'today',   label: 'HOY',      Icon: Sun },
  { id: 'cycle',   label: 'CICLO',    Icon: Activity },
  { id: 'metrics', label: 'MÉTRICAS', Icon: TrendingUp },
  { id: 'config',  label: 'CONFIG',   Icon: SlidersHorizontal },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex border-t border-border bg-bg shrink-0">
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3"
          >
            <Icon
              size={18}
              strokeWidth={active ? 2 : 1.5}
              color={active ? '#3B82F6' : '#555555'}
            />
            <span
              className="text-[9px] font-mono tracking-widest"
              style={{ color: active ? '#3B82F6' : '#555555' }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
