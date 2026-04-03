import { Supplier } from '../types'

export const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    name: 'Sheng Siong (Produce)',
    amount: 1200,
    dueDate: '2024-01-21',
    priority: 'flexible',
    aiRecommendation: 'Delay 5 days — no penalty history',
  },
  {
    id: 's2',
    name: 'Cold Storage (Dairy)',
    amount: 480,
    dueDate: '2024-01-22',
    priority: 'flexible',
    aiRecommendation: 'Delay 3 days — within terms',
  },
  {
    id: 's3',
    name: 'SP Services (Utilities)',
    amount: 620,
    dueDate: '2024-01-20',
    priority: 'high-priority',
    aiRecommendation: 'Pay on time — late fee applies',
  },
  {
    id: 's4',
    name: 'Coffee Beans Direct',
    amount: 340,
    dueDate: '2024-01-23',
    priority: 'flexible',
    aiRecommendation: 'Delay 4 days — supplier confirmed OK',
  },
  {
    id: 's5',
    name: 'SingTel Business',
    amount: 180,
    dueDate: '2024-01-25',
    priority: 'high-priority',
    aiRecommendation: 'Pay on time — service interruption risk',
  },
  {
    id: 's6',
    name: 'Packaging Supplies Co.',
    amount: 290,
    dueDate: '2024-01-26',
    priority: 'flexible',
    aiRecommendation: 'Delay 7 days — ample lead time',
  },
]
