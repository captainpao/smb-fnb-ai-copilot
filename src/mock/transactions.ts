import { Transaction } from '../types'

export const mockTransactions: Transaction[] = [
  { id: 't1',  date: '2024-01-01', amount: 3200, type: 'credit', category: 'sales' },
  { id: 't2',  date: '2024-01-01', amount: 800,  type: 'debit',  category: 'supplier' },
  { id: 't3',  date: '2024-01-02', amount: 2900, type: 'credit', category: 'sales' },
  { id: 't4',  date: '2024-01-03', amount: 3100, type: 'credit', category: 'sales' },
  { id: 't5',  date: '2024-01-04', amount: 4500, type: 'debit',  category: 'rent' },
  { id: 't6',  date: '2024-01-05', amount: 2700, type: 'credit', category: 'sales' },
  { id: 't7',  date: '2024-01-06', amount: 600,  type: 'debit',  category: 'supplier' },
  { id: 't8',  date: '2024-01-07', amount: 3400, type: 'credit', category: 'sales' },
  { id: 't9',  date: '2024-01-08', amount: 3000, type: 'credit', category: 'sales' },
  { id: 't10', date: '2024-01-09', amount: 1200, type: 'debit',  category: 'payroll' },
  { id: 't11', date: '2024-01-10', amount: 2800, type: 'credit', category: 'sales' },
  { id: 't12', date: '2024-01-11', amount: 700,  type: 'debit',  category: 'supplier' },
  { id: 't13', date: '2024-01-12', amount: 3300, type: 'credit', category: 'sales' },
  { id: 't14', date: '2024-01-13', amount: 2600, type: 'credit', category: 'sales' },
  { id: 't15', date: '2024-01-14', amount: 900,  type: 'debit',  category: 'supplier' },
]
