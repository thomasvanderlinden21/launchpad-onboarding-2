import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCompletedStep, subscribeToOnboardingProgress } from './onboardingProgress'

// ─── Icons (toolbar only) ─────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="#121621" strokeWidth={1.5} />
      <path d="M16.5 16.5L21 21" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon({ color = '#121621' }: { color?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar() {
  const crumbs = [{ label: 'Home', current: true }]

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#ffffff', borderBottom: '1px solid #e6ebeb', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexShrink: 0 }}>
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', minHeight: 40, minWidth: 40 }}>
        {crumbs.map((crumb, i) => (
          <div key={crumb.label} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <ChevronRightIcon color={crumb.current ? '#6b7676' : '#121621'} />}
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: crumb.current ? '#6b7676' : '#121621', whiteSpace: 'nowrap' }}>
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, minHeight: 40, flexShrink: 0 }}>
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 2 }}>
          <SearchIcon />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', padding: '0 2px' }}>Search</span>
        </button>
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 2, height: 32 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', padding: '0 2px' }}>beantastic coffee</span>
          <ChevronDownIcon />
        </button>
        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: 'white' }}>JA</span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Progress tracker ─────────────────────────────────────────────────────────

type StepStatus = 'todo' | 'in-progress' | 'done' | 'pending'

const STATUS_STYLES: Record<StepStatus, { bg: string; color: string; label: string }> = {
  'done':        { bg: '#e6f0ef', color: '#277777', label: 'Done' },
  'in-progress': { bg: '#fff3cd', color: '#7a5500', label: 'In progress' },
  'todo':        { bg: '#dcf4fa', color: '#066076', label: 'To do' },
  'pending':     { bg: '#e6f0ef', color: '#277777', label: 'Pending review' },
}

const STEPS: { n: number; title: string; desc: string }[] = [
  { n: 1, title: 'Verify your identity',        desc: 'Complete a quick identity check on your phone' },
  { n: 2, title: 'Add key individuals',         desc: 'Provide details of signatories and UBOs' },
  { n: 3, title: 'Describe your business',      desc: 'Tell us about your business so we can better serve you' },
  { n: 4, title: 'Connect your bank account',   desc: 'Connect your account to receive payouts' },
  { n: 5, title: 'Confirm and go live',         desc: 'Check your details and documents' },
]

function deriveStatus(stepNumber: number, completedStep: number): StepStatus {
  if (completedStep === 0) return 'todo'
  if (stepNumber <= completedStep) return 'pending'
  if (stepNumber === completedStep + 1) return 'in-progress'
  return 'todo'
}

function ProgressTracker({ onActivate }: { onActivate: () => void }) {
  const [completedStep, setCompletedStep] = useState(() => getCompletedStep())

  useEffect(() => {
    const unsubscribe = subscribeToOnboardingProgress(() => {
      setCompletedStep(getCompletedStep())
    })
    return unsubscribe
  }, [])

  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 8, boxShadow: '0px 4px 2px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 32, padding: '32px 20px', width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
            Welcome Alex,
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0 }}>
            Finish setting up to unlock your full launchpad and start maximising your finances
          </p>
        </div>
        <button type="button" onClick={onActivate} style={{ flexShrink: 0, backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '12px 12px', minHeight: 48, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', whiteSpace: 'nowrap' }}>
          Complete activation
        </button>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
        {STEPS.map((step, i) => {
          const status = deriveStatus(step.n, completedStep)
          const s = STATUS_STYLES[status]
          return (
            <div key={step.n} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, padding: '8px 20px', borderRight: i < STEPS.length - 1 ? '1px solid #e6ebeb' : 'none' }}>
              <p style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 32, fontWeight: 500, lineHeight: '40px', color: '#121621', margin: 0 }}>
                {step.n}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>
                {step.title}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#525d5d', margin: 0 }}>
                {step.desc}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: s.bg, borderRadius: 9999, padding: '2px 8px', alignSelf: 'flex-start' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: s.color, whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero banner */}
        <div style={{ height: 220, width: '100%', flexShrink: 0, overflow: 'hidden' }}>
          <img src="/images/banner.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>

        {/* Progress tracker overlapping the banner */}
        <div style={{ padding: '0 32px 32px', marginTop: -88, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProgressTracker onActivate={() => navigate('/onboarding')} />
        </div>
      </div>
    </div>
  )
}
