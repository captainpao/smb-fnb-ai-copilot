import { Badge, Text, Tooltip, Button } from '@fluentui/react-components'
import { Supplier } from '../../types'
import styles from './SupplierList.module.css'

type Props = {
  suppliers: Supplier[]
}

export default function SupplierList({ suppliers }: Props) {
  return (
    <div className={styles.table}>
      <div className={styles.headerRow}>
        <Text weight="semibold" size={200}>Supplier</Text>
        <Text weight="semibold" size={200}>Amount</Text>
        <Text weight="semibold" size={200}>Due</Text>
        <Text weight="semibold" size={200}>Priority</Text>
        <Text weight="semibold" size={200}>Action</Text>
      </div>
      {suppliers.map(supplier => (
        <div key={supplier.id} className={styles.row}>
          <Text>{supplier.name}</Text>
          <Text>SGD {supplier.amount.toLocaleString()}</Text>
          <Text>{supplier.dueDate}</Text>
          <Badge
            appearance="filled"
            color={supplier.priority === 'flexible' ? 'success' : 'danger'}
          >
            {supplier.priority === 'flexible' ? 'Flexible' : 'High Priority'}
          </Badge>
          <Tooltip content={supplier.aiRecommendation} relationship="description">
            <Button size="small" appearance="outline">
              View Suggestion
            </Button>
          </Tooltip>
        </div>
      ))}
    </div>
  )
}
