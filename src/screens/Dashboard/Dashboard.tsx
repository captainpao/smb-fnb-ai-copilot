import { Card, CardHeader, Text, Title2 } from '@fluentui/react-components'
import { useAppContext } from '../../context/AppContext'
import CashFlowChart from '../../components/CashFlowChart/CashFlowChart'
import InsightCard from '../../components/InsightCard/InsightCard'
import FinanceCard from '../../components/FinanceCard/FinanceCard'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { state, dispatch } = useAppContext()
  const pendingInsights = state.insights.filter(i => i.status === 'pending')
  const resolvedInsights = state.insights.filter(i => i.status !== 'pending')

  return (
    <div className={styles.layout}>
      <section className={styles.heroSection}>
        <Card>
          <CardHeader
            header={
              <div className={styles.balanceHeader}>
                <div>
                  <Text size={200}>Current Balance</Text>
                  <Title2>SGD {state.balance.toLocaleString()}</Title2>
                </div>
                <Text size={200} style={{ color: '#999' }}>14-day forecast</Text>
              </div>
            }
          />
          <div className={styles.chartContainer}>
            <CashFlowChart forecast={state.forecast} />
          </div>
        </Card>
      </section>

      <section className={styles.insightsSection}>
        <Text weight="semibold" size={400}>AI Suggestions</Text>
        {pendingInsights.length === 0 && (
          <Text size={200} style={{ color: '#888' }}>No pending suggestions</Text>
        )}
        {pendingInsights.map(insight => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onApprove={id => dispatch({ type: 'APPROVE_INSIGHT', id })}
            onDismiss={id => dispatch({ type: 'DISMISS_INSIGHT', id })}
          />
        ))}

        <FinanceCard />

        {resolvedInsights.length > 0 && (
          <>
            <Text weight="semibold" size={300} style={{ color: '#888' }}>Resolved</Text>
            {resolvedInsights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onApprove={id => dispatch({ type: 'APPROVE_INSIGHT', id })}
                onDismiss={id => dispatch({ type: 'DISMISS_INSIGHT', id })}
              />
            ))}
          </>
        )}
      </section>
    </div>
  )
}
