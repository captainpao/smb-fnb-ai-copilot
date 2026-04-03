import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CashFlowChart from '../components/CashFlowChart/CashFlowChart'
import { mockForecast } from '../mock/forecast'

vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="line-chart">{data.labels.join(',')}</div>
  ),
}))

describe('CashFlowChart', () => {
  it('renders a chart with forecast date labels', () => {
    render(<CashFlowChart forecast={mockForecast} />)
    const chart = screen.getByTestId('line-chart')
    expect(chart).toBeInTheDocument()
    expect(chart.textContent).toContain('2024-01-15')
  })

  it('renders shortfall warning when any projected balance is below zero', () => {
    render(<CashFlowChart forecast={mockForecast} />)
    expect(screen.getByText(/shortfall/i)).toBeInTheDocument()
  })

  it('does not render warning when all balances are positive', () => {
    const positiveForecast = mockForecast.map(d => ({ ...d, projectedBalance: Math.abs(d.projectedBalance) + 100 }))
    render(<CashFlowChart forecast={positiveForecast} />)
    expect(screen.queryByText(/shortfall/i)).not.toBeInTheDocument()
  })
})
