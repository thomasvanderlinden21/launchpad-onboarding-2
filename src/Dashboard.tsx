import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCompletedStep, subscribeToOnboardingProgress } from './onboardingProgress'

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
    <div style={{ backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 8, boxShadow: '0px 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 32, padding: '32px 20px', width: '100%', boxSizing: 'border-box' }}>

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

// ─── Shipping Status ──────────────────────────────────────────────────────────

type OrderStep = { label: string; sub: string; state: 'done' | 'active' | 'todo' }

const ORDER_STEPS: OrderStep[] = [
  { label: 'Payment received',  sub: 'Order number #WL123547',                              state: 'done'   },
  { label: 'Shipment',          sub: 'Package being prepared',                              state: 'active' },
  { label: 'Shipping address',  sub: 'Chaussee de Haecht 1442, 1130, Brussels, Belgium',    state: 'todo'   },
]

function StepIcon({ state }: { state: OrderStep['state'] }) {
  if (state === 'done') {
    return (
      <div style={{ width: 24, height: 24, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }
  if (state === 'active') {
    return (
      <div style={{ width: 24, height: 24, borderRadius: 9999, backgroundColor: '#f5f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 2px white, 0 0 0 4px #277777' }}>
        <div style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: '#1f5c5c' }} />
      </div>
    )
  }
  return (
    <div style={{ width: 24, height: 24, borderRadius: 9999, backgroundColor: '#f5f7f7', border: '1px solid #9ca4a6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: '#9ca4a6' }} />
    </div>
  )
}

function ShippingStatus() {
  return (
    <div style={{ flex: 1, minWidth: 0, backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 8, boxShadow: '0px 4px 24px rgba(0,0,0,0.10)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
        Shipping status
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Stepper */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {ORDER_STEPS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {/* Icon + connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 4, alignSelf: 'stretch', flexShrink: 0 }}>
                <StepIcon state={step.state} />
                {i < ORDER_STEPS.length - 1 && (
                  <div style={{ flex: 1, width: 2, backgroundColor: step.state === 'done' ? '#277777' : '#e6ebeb', margin: '2px 0' }} />
                )}
              </div>
              {/* Text */}
              <div style={{ flex: 1, paddingBottom: i < ORDER_STEPS.length - 1 ? 24 : 0, paddingTop: 2 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>
                  {step.label}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0 }}>
                  {step.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Terminal image */}
        <div style={{ width: 160, height: 209, flexShrink: 0, overflow: 'hidden', borderRadius: 8 }}>
          <img src="/images/link-2500.png" alt="Worldline Link 2500 terminal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Discover Launchpad ───────────────────────────────────────────────────────

function DiscoverLaunchpad() {
  return (
    <div style={{ width: 531, flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 8, boxShadow: '0px 4px 24px rgba(0,0,0,0.10)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0, whiteSpace: 'nowrap' }}>
        Discover your Launchpad
      </p>
      {/* Video thumbnail */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f5f7' }}>
        <img src="/images/thumbnail.png" alt="Launchpad overview video" style={{ width: '100%', height: 235, objectFit: 'cover', display: 'block' }} />
        {/* Play button */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 74, height: 74, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <path d="M10 8L22 14L10 20V8Z" fill="#121621" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero banner */}
        <div style={{ height: 220, width: '100%', flexShrink: 0, overflow: 'hidden' }}>
          <img src="/images/banner.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>

        {/* Progress tracker overlapping the banner */}
        <div style={{ padding: '0 32px 32px', marginTop: -88, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProgressTracker onActivate={() => navigate('/onboarding')} />

          {/* Two-column row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            <ShippingStatus />
            <DiscoverLaunchpad />
          </div>
        </div>
      </div>
    </div>
  )
}
