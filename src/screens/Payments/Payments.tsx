import { Card, CardHeader, Text, MessageBar, MessageBarBody } from '@fluentui/react-components'
import { useAppContext } from '../../context/AppContext'
import SupplierList from '../../components/SupplierList/SupplierList'
import styles from './Payments.module.css'

export default function Payments() {
  const { state } = useAppContext()
  const flexibleCount = state.suppliers.filter(s => s.priority === 'flexible').length

  return (
    <div className={styles.layout}>
      <Text size={400} weight="semibold">Supplier Payments</Text>

      {flexibleCount > 0 && (
        <MessageBar intent="info">
          <MessageBarBody>
            {flexibleCount} supplier{flexibleCount > 1 ? 's have' : ' has'} flexible payment
            terms — delaying could free up cash during your shortfall window.
          </MessageBarBody>
        </MessageBar>
      )}

      <Card>
        <CardHeader
          header={
            <div className={styles.cardHeaderContent}>
              <Text weight="semibold">Upcoming Payments</Text>
              <Text size={200} style={{ color: '#999' }}>Next 14 days</Text>
            </div>
          }
        />
        <div className={styles.tableContainer}>
          <SupplierList suppliers={state.suppliers} />
        </div>
      </Card>
    </div>
  )
}
