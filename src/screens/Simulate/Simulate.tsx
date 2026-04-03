import { Card, CardHeader, Text, Badge } from '@fluentui/react-components'
import { useAppContext } from '../../context/AppContext'
import SimulatorPanel from '../../components/SimulatorPanel/SimulatorPanel'
import CashFlowChart from '../../components/CashFlowChart/CashFlowChart'
import { applySimulation } from '../../utils/simulateForecast'
import styles from './Simulate.module.css'

export default function Simulate() {
  const { state, dispatch } = useAppContext()
  const simulatedForecast = applySimulation(state.forecast, state.simulation)

  const baseMin = Math.min(...state.forecast.map(d => d.projectedBalance))
  const simMin = Math.min(...simulatedForecast.map(d => d.projectedBalance))
  const delta = simMin - baseMin

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <Text size={400} weight="semibold">Scenario Simulator</Text>
        <Text size={200} style={{ color: '#999' }}>
          Toggle options below to see real-time impact on your 14-day forecast
        </Text>
      </div>

      <div className={styles.grid}>
        <div className={styles.controls}>
          <SimulatorPanel
            simulation={state.simulation}
            onChange={simulation => dispatch({ type: 'SET_SIMULATION', simulation })}
          />
          <Card>
            <CardHeader header={<Text weight="semibold">Impact Summary</Text>} />
            <div className={styles.impact}>
              <div className={styles.impactRow}>
                <Text size={200}>Worst-case balance (base)</Text>
                <Text>SGD {baseMin.toLocaleString()}</Text>
              </div>
              <div className={styles.impactRow}>
                <Text size={200}>Worst-case balance (simulated)</Text>
                <Text>SGD {simMin.toLocaleString()}</Text>
              </div>
              <div className={styles.impactRow}>
                <Text size={200}>Net improvement</Text>
                <Badge appearance="filled" color={delta >= 0 ? 'success' : 'danger'}>
                  {delta >= 0 ? '+' : ''}SGD {delta.toLocaleString()}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <Card className={styles.chartCard}>
          <CardHeader header={<Text weight="semibold">Simulated Forecast</Text>} />
          <div className={styles.chartContainer}>
            <CashFlowChart forecast={simulatedForecast} />
          </div>
        </Card>
      </div>
    </div>
  )
}
