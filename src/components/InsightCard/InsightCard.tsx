import {
  Card,
  CardHeader,
  CardFooter,
  Badge,
  Button,
  Text,
} from '@fluentui/react-components'
import { CheckmarkCircleRegular } from '@fluentui/react-icons'
import { Insight } from '../../types'
import styles from './InsightCard.module.css'

const confidenceColor = {
  low: 'warning',
  medium: 'important',
  high: 'success',
} as const

type Props = {
  insight: Insight
  onApprove: (id: string) => void
  onDismiss: (id: string) => void
}

export default function InsightCard({ insight, onApprove, onDismiss }: Props) {
  const isPending = insight.status === 'pending'

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <div className={styles.headerRow}>
            <Text weight="semibold">{insight.title}</Text>
            <Badge appearance="filled" color={confidenceColor[insight.confidence]}>
              {insight.confidence.charAt(0).toUpperCase() + insight.confidence.slice(1)} confidence
            </Badge>
          </div>
        }
      />
      <div className={styles.body}>
        <Text>{insight.description}</Text>
        <Text className={styles.impact}>
          +SGD {insight.impact.toLocaleString()} cash impact
        </Text>
        <div className={styles.reasoning}>
          <Text size={200} weight="semibold">Why this?</Text>
          <Text size={200}>{insight.reasoning}</Text>
        </div>
      </div>
      <CardFooter>
        {isPending ? (
          <div className={styles.actions}>
            <Button appearance="primary" onClick={() => onApprove(insight.id)}>
              Approve
            </Button>
            <Button appearance="subtle" onClick={() => onDismiss(insight.id)}>
              Dismiss
            </Button>
          </div>
        ) : (
          <Badge
            appearance="filled"
            color={insight.status === 'approved' ? 'success' : 'subtle'}
            icon={insight.status === 'approved' ? <CheckmarkCircleRegular /> : undefined}
          >
            {insight.status === 'approved' ? 'Approved' : 'Dismissed'}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
