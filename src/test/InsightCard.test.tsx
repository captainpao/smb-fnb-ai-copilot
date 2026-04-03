import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InsightCard from '../components/InsightCard/InsightCard'
import { mockInsights } from '../mock/insights'

const insight = mockInsights[0]

describe('InsightCard', () => {
  it('renders insight title and description', () => {
    render(<InsightCard insight={insight} onApprove={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByText(insight.title)).toBeInTheDocument()
    expect(screen.getByText(insight.description)).toBeInTheDocument()
  })

  it('calls onApprove with insight id when Approve is clicked', () => {
    const onApprove = vi.fn()
    render(<InsightCard insight={insight} onApprove={onApprove} onDismiss={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /approve/i }))
    expect(onApprove).toHaveBeenCalledWith(insight.id)
  })

  it('calls onDismiss with insight id when Dismiss is clicked', () => {
    const onDismiss = vi.fn()
    render(<InsightCard insight={insight} onApprove={vi.fn()} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledWith(insight.id)
  })

  it('shows approved badge when status is approved', () => {
    render(
      <InsightCard
        insight={{ ...insight, status: 'approved' }}
        onApprove={vi.fn()}
        onDismiss={vi.fn()}
      />
    )
    expect(screen.getByText(/approved/i)).toBeInTheDocument()
  })

  it('hides approve/dismiss buttons when status is not pending', () => {
    render(
      <InsightCard
        insight={{ ...insight, status: 'dismissed' }}
        onApprove={vi.fn()}
        onDismiss={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument()
  })
})
