import { AppState, SimulationState } from '../types'
import { mockTransactions } from '../mock/transactions'
import { mockForecast } from '../mock/forecast'
import { mockInsights } from '../mock/insights'
import { mockSuppliers } from '../mock/suppliers'

export type AppAction =
  | { type: 'APPROVE_INSIGHT'; id: string }
  | { type: 'DISMISS_INSIGHT'; id: string }
  | { type: 'SET_SIMULATION'; simulation: SimulationState }

export const initialState: AppState = {
  balance: 8200,
  forecast: mockForecast,
  insights: mockInsights,
  suppliers: mockSuppliers,
  transactions: mockTransactions,
  simulation: {
    delayPaymentEnabled: false,
    delayDays: 5,
    loanEnabled: false,
    loanAmount: 3000,
  },
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'APPROVE_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.id ? { ...i, status: 'approved' } : i
        ),
      }
    case 'DISMISS_INSIGHT':
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.id ? { ...i, status: 'dismissed' } : i
        ),
      }
    case 'SET_SIMULATION':
      return { ...state, simulation: action.simulation }
    default:
      return state
  }
}
