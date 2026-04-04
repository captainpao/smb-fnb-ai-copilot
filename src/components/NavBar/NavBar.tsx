import { useNavigate, useLocation } from 'react-router-dom'
import { TabList, Tab } from '@fluentui/react-components'
import {
  DataPieRegular,
  ArrowTrendingLinesRegular,
  PaymentRegular,
} from '@fluentui/react-icons'
import logoUrl from '../../assets/logo.png'
import styles from './NavBar.module.css'

const tabs = [
  { value: '/',         label: 'Dashboard', icon: <DataPieRegular /> },
  { value: '/simulate', label: 'Simulate',  icon: <ArrowTrendingLinesRegular /> },
  { value: '/payments', label: 'Payments',  icon: <PaymentRegular /> },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <img src={logoUrl} alt="SMB Co-Pilot logo" className={styles.brandLogo} />
        SMB Cashflow Management
      </div>
      <TabList
        selectedValue={pathname}
        onTabSelect={(_, data) => navigate(data.value as string)}
        className={styles.tabList}
      >
        {tabs.map(tab => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
    </nav>
  )
}
