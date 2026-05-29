import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import Onboarding from './Onboarding.tsx'
import Dashboard from './Dashboard.tsx'
import Sales from './Sales.tsx'
import Checkout from './Checkout.tsx'
import { AppShell } from './AppShell.tsx'

function App() {
  const location = useLocation()

  return (
    <AppShell>
      <Routes location={location}>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
