import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { MessageBar, MessageBarBody } from '@fluentui/react-components'
import { ForecastData } from '../../types'
import styles from './CashFlowChart.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

type Props = {
  forecast: ForecastData[]
}

export default function CashFlowChart({ forecast }: Props) {
  const hasShortfall = forecast.some(d => d.projectedBalance < 0)

  const data = {
    labels: forecast.map(d => d.date),
    datasets: [
      {
        label: 'Projected Balance',
        data: forecast.map(d => d.projectedBalance),
        borderColor: '#0078d4',
        backgroundColor: 'rgba(0, 120, 212, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Lower Bound',
        data: forecast.map(d => d.lowerBound),
        borderColor: 'rgba(255,255,255,0.15)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Upper Bound',
        data: forecast.map(d => d.upperBound),
        borderColor: 'rgba(255,255,255,0.15)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) =>
            `SGD ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#999', maxTicksLimit: 7 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: {
          color: '#999',
          callback: (v: number | string) => `$${Number(v).toLocaleString()}`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  }

  return (
    <div className={styles.container}>
      {hasShortfall && (
        <MessageBar intent="warning">
          <MessageBarBody>
            Cash shortfall projected — review AI suggestions below
          </MessageBarBody>
        </MessageBar>
      )}
      <div className={styles.chartWrapper}>
        <Line data={data} options={options as object} />
      </div>
    </div>
  )
}
