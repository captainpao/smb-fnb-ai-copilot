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
    <div>
      <section className={styles.heroSection}>
        <Card>
          <CardHeader
            header={
              <div className={styles.balanceHeader}>
                <div>
                  <div><Text size={200}>Current Balance</Text></div>
                  <Title2>SGD {state.balance.toLocaleString()}</Title2>
                </div>
                <Text size={200} style={{ color: '#6b7a99' }}>14-day forecast</Text>
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
          <Text size={200} style={{ color: '#6b7a99' }}>No pending suggestions</Text>
        )}
        <div className={styles.insightsGrid}>
          {pendingInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onApprove={id => dispatch({ type: 'APPROVE_INSIGHT', id })}
              onDismiss={id => dispatch({ type: 'DISMISS_INSIGHT', id })}
            />
          ))}
          <FinanceCard />
        </div>

        {resolvedInsights.length > 0 && (
          <>
            <Text weight="semibold" size={300} style={{ color: '#6b7a99' }}>Resolved</Text>
            <div className={styles.insightsGrid}>
              {resolvedInsights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onApprove={id => dispatch({ type: 'APPROVE_INSIGHT', id })}
                  onDismiss={id => dispatch({ type: 'DISMISS_INSIGHT', id })}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
