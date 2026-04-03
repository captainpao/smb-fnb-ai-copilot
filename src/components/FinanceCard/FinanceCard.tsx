import { Card, Text, Button, Divider, Badge } from '@fluentui/react-components'
import { MoneyRegular } from '@fluentui/react-icons'
import styles from './FinanceCard.module.css'

export default function FinanceCard() {
  return (
    <Card appearance="filled" className={styles.card}>
      <div className={styles.header}>
        <MoneyRegular fontSize={20} />
        <Text weight="semibold">Short-Term Credit Available</Text>
        <Badge appearance="tint" color="informative">Personalised offer</Badge>
      </div>
      <Divider />
      <div className={styles.body}>
        <div className={styles.stat}>
          <Text size={200}>Eligible amount</Text>
          <Text weight="semibold">Up to SGD 10,000</Text>
        </div>
        <div className={styles.stat}>
          <Text size={200}>Interest (2-day bridge)</Text>
          <Text weight="semibold">~SGD 18</Text>
        </div>
        <div className={styles.stat}>
          <Text size={200}>Approval</Text>
          <Text weight="semibold">Instant</Text>
        </div>
      </div>
      <Button appearance="primary" className={styles.cta}>
        View Details
      </Button>
    </Card>
  )
}
