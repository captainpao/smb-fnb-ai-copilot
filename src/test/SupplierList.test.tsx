import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SupplierList from '../components/SupplierList/SupplierList'
import { mockSuppliers } from '../mock/suppliers'

describe('SupplierList', () => {
  it('renders all supplier names', () => {
    render(<SupplierList suppliers={mockSuppliers} />)
    mockSuppliers.forEach(s => {
      expect(screen.getByText(s.name)).toBeInTheDocument()
    })
  })

  it('shows Flexible badge for flexible suppliers', () => {
    render(<SupplierList suppliers={mockSuppliers} />)
    const flexible = mockSuppliers.filter(s => s.priority === 'flexible')
    expect(screen.getAllByText('Flexible').length).toBe(flexible.length)
  })

  it('shows High Priority badge for high-priority suppliers', () => {
    render(<SupplierList suppliers={mockSuppliers} />)
    const highPriority = mockSuppliers.filter(s => s.priority === 'high-priority')
    expect(screen.getAllByText('High Priority').length).toBe(highPriority.length)
  })
})
