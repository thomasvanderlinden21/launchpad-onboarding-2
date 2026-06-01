import React from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Empty state layout ───────────────────────────────────────────────────────

function EmptyPage({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center', gap: 0 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#e6f0ef', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, flexShrink: 0 }}>
          {icon}
        </div>
        <h1 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: '0 0 8px' }}>
          {title}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '26px', color: '#6b7676', margin: '0 0 32px', maxWidth: 400 }}>
          {description}
        </p>
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)' }}
        >
          Continue onboarding
        </button>
      </div>
    </div>
  )
}

// ─── Icons (teal, 40px) ───────────────────────────────────────────────────────

const s = { stroke: '#277777', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const }

// ─── Pages ───────────────────────────────────────────────────────────────────

export function SalesPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <path d="M18 20V10M12 20V4M6 20v-6" {...s} />
        </svg>
      }
      title="Your sales at a glance"
      description="Once your account is activated, you'll see real-time transactions, revenue totals, and sales performance across all your terminals."
    />
  )
}

export function TerminalsPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="2" width="16" height="20" rx="2" {...s} />
          <path d="M8 6h8M8 10h8M8 14h4" {...s} />
          <rect x="8" y="17" width="8" height="2" rx="1" stroke="#277777" strokeWidth={1.5} fill="#277777" />
        </svg>
      }
      title="Manage your terminals"
      description="After activation, all your payment terminals will appear here. Monitor their status, assign locations, and configure settings remotely."
    />
  )
}

export function PaymentsPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <path d="M7 16l-4-4 4-4M17 8l4 4-4 4" {...s} />
          <path d="M3 12h18" {...s} />
        </svg>
      }
      title="Track every payment"
      description="Once live, your complete transaction history will be available here — filter by date, terminal, amount, and payment method."
    />
  )
}

export function CataloguePage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <path d="M12.586 2H20a1 1 0 011 1v7.414a1 1 0 01-.293.707l-9.5 9.5a2 2 0 01-2.828 0l-5-5a2 2 0 010-2.828l9.5-9.5A1 1 0 0112.586 2z" {...s} />
          <circle cx="16.5" cy="7.5" r="1.5" fill="#277777" />
        </svg>
      }
      title="Build your product catalogue"
      description="After onboarding, set up your products, categories, and pricing to speed up checkout at the point of sale."
    />
  )
}

export function BusinessPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <path d="M3 21V8l9-5 9 5v13H3z" {...s} />
          <path d="M9 21v-5h6v5" {...s} />
          <rect x="9.5" y="9" width="5" height="4" rx=".5" {...s} />
        </svg>
      }
      title="Your business profile"
      description="Your company details, documents, and compliance information will be accessible here once your account is fully verified."
    />
  )
}

export function CardIssuingPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="20" height="13" rx="2" {...s} />
          <path d="M2 10h20" {...s} />
          <path d="M6 15h4" {...s} />
        </svg>
      }
      title="Issue cards for your team"
      description="Once activated, you can issue branded payment cards to employees, set spending limits, and track expenses in real time."
    />
  )
}

export function CashAdvancePage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" {...s} />
          <path d="M12 6v6l4 2" {...s} />
          <path d="M9 3.5L12 2l3 1.5" {...s} />
        </svg>
      }
      title="Access working capital"
      description="Based on your sales performance, you'll be able to apply for flexible cash advances to grow your business — available after activation."
    />
  )
}

export function SettingsPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" {...s} />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" {...s} />
        </svg>
      }
      title="Account settings"
      description="Manage your account preferences, notifications, security settings, and integrations all in one place."
    />
  )
}

export function NotificationsPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" {...s} />
          <path d="M13.73 21a2 2 0 01-3.46 0" {...s} />
        </svg>
      }
      title="Stay in the loop"
      description="All alerts, updates, and messages about your account and transactions will appear here once you're up and running."
    />
  )
}

export function HelpPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" {...s} />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" {...s} />
          <circle cx="12" cy="17" r=".5" fill="#277777" stroke="#277777" strokeWidth={1} />
        </svg>
      }
      title="Help & support"
      description="Find answers in our knowledge base, contact support, or connect with your dedicated account manager — available after activation."
    />
  )
}

export function AiAssistantPage() {
  return (
    <EmptyPage
      icon={
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z" {...s} />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" stroke="#277777" strokeWidth={1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      title="Your AI business assistant"
      description="Once activated, your AI assistant will analyse your sales data, flag anomalies, and provide smart recommendations to grow your business."
    />
  )
}
