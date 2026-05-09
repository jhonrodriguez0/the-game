import { useStore } from '../store/StoreContext'
import MetricChart from '../components/MetricChart'

export default function Metrics() {
  const { metrics } = useStore()

  const toChartData = (key) =>
    metrics
      .filter(m => m[key] != null)
      .map(m => ({ date: m.date.slice(5).replace('-', '/'), value: m[key] }))

  const weightData = toChartData('weight')
  const bodyFatData = toChartData('bodyFat')
  const sleepData = toChartData('sleep')

  return (
    <div className="overflow-y-auto h-full px-5 py-5 space-y-8">
      <MetricChart label="PESO (kg)" data={weightData} />
      <MetricChart label="GRASA CORPORAL (%)" data={bodyFatData} />
      <MetricChart label="SUEÑO (h)" data={sleepData} />
      <div className="h-4" />
    </div>
  )
}
