import { Switch, Slider, Label, Text, Badge, Card, CardHeader } from '@fluentui/react-components'
import { SimulationState } from '../../types'
import styles from './SimulatorPanel.module.css'

type Props = {
  simulation: SimulationState
  onChange: (sim: SimulationState) => void
}

export default function SimulatorPanel({ simulation, onChange }: Props) {
  const update = (partial: Partial<SimulationState>) =>
    onChange({ ...simulation, ...partial })

  return (
    <Card className={styles.card}>
      <CardHeader header={<Text weight="semibold">What-If Simulator</Text>} />
      <div className={styles.controls}>
        <div className={styles.control}>
          <div className={styles.switchRow}>
            <Label>Delay supplier payment</Label>
            <Switch
              checked={simulation.delayPaymentEnabled}
              onChange={(_, d) => update({ delayPaymentEnabled: d.checked })}
            />
          </div>
          {simulation.delayPaymentEnabled && (
            <div className={styles.sliderRow}>
              <Label>Delay by {simulation.delayDays} days</Label>
              <Slider
                min={1}
                max={14}
                value={simulation.delayDays}
                onChange={(_, d) => update({ delayDays: d.value })}
              />
              <Badge appearance="filled" color="success">
                +SGD 1,200 for {simulation.delayDays} days
              </Badge>
            </div>
          )}
        </div>

        <div className={styles.control}>
          <div className={styles.switchRow}>
            <Label>Apply short-term loan</Label>
            <Switch
              checked={simulation.loanEnabled}
              onChange={(_, d) => update({ loanEnabled: d.checked })}
            />
          </div>
          {simulation.loanEnabled && (
            <div className={styles.sliderRow}>
              <Label>Loan amount: SGD {simulation.loanAmount.toLocaleString()}</Label>
              <Slider
                min={500}
                max={10000}
                step={500}
                value={simulation.loanAmount}
                onChange={(_, d) => update({ loanAmount: d.value })}
              />
              <Badge appearance="filled" color="informative">
                Est. interest: SGD {Math.round(simulation.loanAmount * 0.006)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
