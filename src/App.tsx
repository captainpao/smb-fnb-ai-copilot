import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar'
import Dashboard from './screens/Dashboard/Dashboard'
import Simulate from './screens/Simulate/Simulate'
import Payments from './screens/Payments/Payments'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.appShell}>
      <NavBar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
