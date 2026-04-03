import { describe, it, expect } from 'vitest'
import { appReducer, initialState } from '../context/reducer'

describe('appReducer', () => {
  it('APPROVE_INSIGHT sets insight status to approved', () => {
    const state = appReducer(initialState, { type: 'APPROVE_INSIGHT', id: 'i1' })
    const insight = state.insights.find(i => i.id === 'i1')
    expect(insight?.status).toBe('approved')
  })

  it('DISMISS_INSIGHT sets insight status to dismissed', () => {
    const state = appReducer(initialState, { type: 'DISMISS_INSIGHT', id: 'i2' })
    const insight = state.insights.find(i => i.id === 'i2')
    expect(insight?.status).toBe('dismissed')
  })

  it('SET_SIMULATION updates simulation state', () => {
    const newSim = {
      delayPaymentEnabled: true,
      delayDays: 7,
      loanEnabled: false,
      loanAmount: 0,
    }
    const state = appReducer(initialState, { type: 'SET_SIMULATION', simulation: newSim })
    expect(state.simulation).toEqual(newSim)
  })

  it('does not mutate original state', () => {
    const before = JSON.stringify(initialState)
    appReducer(initialState, { type: 'APPROVE_INSIGHT', id: 'i1' })
    expect(JSON.stringify(initialState)).toBe(before)
  })
})
