import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import Onboarding from './Onboarding.tsx'
import Dashboard from './Dashboard.tsx'
import Checkout from './Checkout.tsx'
import Basket from './Basket.tsx'
import { AppShell } from './AppShell.tsx'
import { getResumeStep } from './onboardingProgress'
import { SalesPage, TerminalsPage, PaymentsPage, CataloguePage, BusinessPage, CardIssuingPage, CashAdvancePage, SettingsPage, NotificationsPage, HelpPage, AiAssistantPage } from './EmptyPages.tsx'

function ResumeOnboarding() {
  return <Navigate to={`/onboarding/step-${getResumeStep()}`} replace />
}

function App() {
  const location = useLocation()

  return (
    <AppShell>
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/basket" replace />} />
        <Route path="/onboarding" element={<ResumeOnboarding />} />
        <Route path="/onboarding/:stepId" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/terminals" element={<TerminalsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/card-issuing" element={<CardIssuingPage />} />
        <Route path="/cash-advance" element={<CashAdvancePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/ai" element={<AiAssistantPage />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/checkout" element={<Navigate to="/checkout/form" replace />} />
        <Route path="/checkout/:phaseId" element={<Checkout />} />
        <Route path="*" element={<Navigate to="/basket" replace />} />
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
