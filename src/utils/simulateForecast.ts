import { ForecastData, SimulationState } from '../types'

const DELAYED_PAYMENT_AMOUNT = 1200

export function applySimulation(
  forecast: ForecastData[],
  simulation: SimulationState
): ForecastData[] {
  return forecast.map((day, index) => {
    let delta = 0

    if (simulation.loanEnabled) {
      delta += simulation.loanAmount
    }

    if (simulation.delayPaymentEnabled && index < simulation.delayDays) {
      delta += DELAYED_PAYMENT_AMOUNT
    }

    if (delta === 0) return day

    return {
      ...day,
      projectedBalance: day.projectedBalance + delta,
      lowerBound: day.lowerBound + delta,
      upperBound: day.upperBound + delta,
    }
  })
}
