import { describe, it, expect } from 'vitest'
import { applySimulation } from '../utils/simulateForecast'
import { mockForecast } from '../mock/forecast'
import { SimulationState } from '../types'

const baseSimulation: SimulationState = {
  delayPaymentEnabled: false,
  delayDays: 0,
  loanEnabled: false,
  loanAmount: 0,
}

describe('applySimulation', () => {
  it('returns forecast unchanged when no simulation is active', () => {
    const result = applySimulation(mockForecast, baseSimulation)
    expect(result).toEqual(mockForecast)
  })

  it('adds loan amount to all projected balances when loan is enabled', () => {
    const sim: SimulationState = { ...baseSimulation, loanEnabled: true, loanAmount: 3000 }
    const result = applySimulation(mockForecast, sim)
    result.forEach((day, i) => {
      expect(day.projectedBalance).toBe(mockForecast[i].projectedBalance + 3000)
    })
  })

  it('adds delay payment amount to balances on and after the delay date when enabled', () => {
    const sim: SimulationState = {
      ...baseSimulation,
      delayPaymentEnabled: true,
      delayDays: 5,
    }
    const result = applySimulation(mockForecast, sim)
    for (let i = 0; i < 5; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance + 1200)
    }
    for (let i = 5; i < result.length; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance)
    }
  })

  it('combines loan and delay payment effects', () => {
    const sim: SimulationState = {
      delayPaymentEnabled: true,
      delayDays: 3,
      loanEnabled: true,
      loanAmount: 2000,
    }
    const result = applySimulation(mockForecast, sim)
    for (let i = 0; i < 3; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance + 1200 + 2000)
    }
    for (let i = 3; i < result.length; i++) {
      expect(result[i].projectedBalance).toBe(mockForecast[i].projectedBalance + 2000)
    }
  })

  it('does not mutate the original forecast array', () => {
    const original = mockForecast.map(d => ({ ...d }))
    const sim: SimulationState = { ...baseSimulation, loanEnabled: true, loanAmount: 5000 }
    applySimulation(mockForecast, sim)
    expect(mockForecast).toEqual(original)
  })
})
