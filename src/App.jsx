import { useState, useEffect } from 'react'
import { StoreProvider, useStore } from './store/StoreContext'
import Today from './screens/Today'
import Cycle from './screens/Cycle'
import Metrics from './screens/Metrics'
import Config from './screens/Config'
import BottomNav from './components/BottomNav'

function AppContent() {
  const [tab, setTab] = useState('today')
  const { autoClosePastDays, initAllTodayLogs } = useStore()

  useEffect(() => {
    autoClosePastDays()
    initAllTodayLogs()
  }, [autoClosePastDays, initAllTodayLogs])

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto bg-bg">
      <div className="flex-1 overflow-hidden">
        {tab === 'today'   && <Today />}
        {tab === 'cycle'   && <Cycle />}
        {tab === 'metrics' && <Metrics />}
        {tab === 'config'  && <Config onCycleStarted={() => setTab('today')} />}
      </div>
      <BottomNav activeTab={tab} onTabChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  )
}
