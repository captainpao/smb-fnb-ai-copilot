export type Transaction = {
  id: string
  date: string
  amount: number
  type: 'credit' | 'debit'
  category: 'sales' | 'supplier' | 'rent' | 'payroll'
}

export type ForecastData = {
  date: string
  projectedBalance: number
  lowerBound: number
  upperBound: number
}

export type Insight = {
  id: string
  title: string
  description: string
  reasoning: string
  impact: number
  confidence: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved' | 'dismissed'
}

export type Supplier = {
  id: string
  name: string
  amount: number
  dueDate: string
  priority: 'flexible' | 'high-priority'
  aiRecommendation: string
}

export type SimulationState = {
  delayPaymentEnabled: boolean
  delayDays: number
  loanEnabled: boolean
  loanAmount: number
}

export type AppState = {
  balance: number
  forecast: ForecastData[]
  insights: Insight[]
  suppliers: Supplier[]
  simulation: SimulationState
  transactions: Transaction[]
}
