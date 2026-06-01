import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Drawer } from './Drawer'
import { Modal } from './Modal'
import { StepperContent } from './StepperContent'
import { AiChatWidget } from './AiChat'
import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'
import { Step3 } from './steps/Step3'
import { Step4 } from './steps/Step4'
import { Step5 } from './steps/Step5'
import { getResumeStep, markStepCompleted } from './onboardingProgress'

const TOTAL_STEPS = 5

const STEP_TITLES = [
  'Verify your identity',
  'Add key individuals',
  'Describe your business',
  'Connect your bank account',
  'Review and confirm',
]

function parseStepId(stepId?: string): number | null {
  if (!stepId) return null
  const match = stepId.match(/^step-(\d+)$/)
  if (!match) return null
  const parsed = Number(match[1])
  if (!Number.isFinite(parsed)) return null
  if (parsed < 1 || parsed > TOTAL_STEPS) return null
  return parsed
}

// ─── Progress ring ────────────────────────────────────────────────────────────

interface ProgressLineProps {
  current: number
  total: number
  onClick?: () => void
}

function ProgressLine({ current, total, onClick }: ProgressLineProps) {
  const radius = 16
  const strokeWidth = 3.5
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - current / total)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Step ${current} of ${total} — open steps overview`}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, flexShrink: 0,
        background: 'none', border: 'none', padding: 0,
        cursor: 'pointer', borderRadius: '50%',
      }}
    >
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={20} cy={20} r={radius} stroke="#e6ebeb" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={20} cy={20} r={radius}
          stroke="#0D6E6E" strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 20 20)"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <span
        className="relative z-10 select-none"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#121621', pointerEvents: 'none' }}
      >
        {current}/{total}
      </span>
    </button>
  )
}

// ─── Chevron back ─────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

interface ToolbarProps {
  title?: string
  currentStep: number
  totalSteps: number
  onBack?: () => void
  onStepperClick?: () => void
}

function Toolbar({ title = 'Page title', currentStep, totalSteps, onBack, onStepperClick }: ToolbarProps) {
  return (
    <header
      className="sticky top-0 z-10 w-full flex items-center shrink-0"
      style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e6ebeb', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, minHeight: 56 }}
    >
      {/* Left — back button */}
      <div className="flex items-center shrink-0" style={{ minWidth: 40, minHeight: 40 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0D6E6E]"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Center — step title */}
      <div className="flex flex-1 items-center justify-center px-2">
        <p
          className="whitespace-nowrap text-center"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621' }}
        >
          {title}
        </p>
      </div>

      {/* Right — progress ring */}
      <div className="flex items-center shrink-0" style={{ minWidth: 40 }}>
        <ProgressLine current={currentStep} total={totalSteps} onClick={onStepperClick} />
      </div>
    </header>
  )
}

// ─── Content area ─────────────────────────────────────────────────────────────

// Placeholder content for steps not yet implemented
function PlaceholderContent({ heading, subtitle, children }: { heading: string; subtitle: string; children?: ReactNode }) {
  return (
    <main className="w-full shrink-0" style={{ maxWidth: 800, paddingLeft: 16, paddingRight: 16 }}>
      <div className="flex flex-col items-start w-full" style={{ gap: 8 }}>
        <h1 className="w-full" style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>{heading}</h1>
        <p className="w-full" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0 }}>{subtitle}</p>
      </div>
      {children}
    </main>
  )
}

function StepContent({ step, onStepComplete, onFinish }: { step: number; onStepComplete: () => void; onFinish: () => void }) {
  if (step === 1) {
    return (
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Step1 onComplete={onStepComplete} />
      </div>
    )
  }
  if (step === 2) {
    return (
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Step2 onComplete={onStepComplete} />
      </div>
    )
  }
  if (step === 3) {
    return (
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Step3 onComplete={onStepComplete} />
      </div>
    )
  }
  if (step === 4) {
    return (
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Step4 onComplete={onStepComplete} />
      </div>
    )
  }
  if (step === 5) {
    return (
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Step5 onComplete={onFinish} />
      </div>
    )
  }
  return (
    <PlaceholderContent heading="Place your content here" subtitle={`Step ${step} — coming soon`} />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { stepId } = useParams<{ stepId?: string }>()
  const [currentStep, setCurrentStep] = useState(() => getResumeStep())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const navigate = useNavigate()

  const stepFromUrl = parseStepId(stepId)

  useEffect(() => {
    if (stepFromUrl === null) {
      navigate('/onboarding/step-1', { replace: true })
      return
    }
    if (stepFromUrl !== currentStep) {
      setCurrentStep(stepFromUrl)
    }
  }, [stepFromUrl, currentStep, navigate])

  const goNext = () => {
    markStepCompleted(currentStep)
    const next = Math.min(currentStep + 1, TOTAL_STEPS)
    setCurrentStep(next)
    navigate(`/onboarding/step-${next}`)
  }

  const finishOnboarding = () => {
    markStepCompleted(TOTAL_STEPS)
    navigate('/dashboard')
  }

  return (
    <>
      {/* Inner content only — AppShell provides the card */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
        <Toolbar
          title={STEP_TITLES[currentStep - 1]}
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={() => setLeaveModalOpen(true)}
          onStepperClick={() => setDrawerOpen(true)}
        />
        <div style={{ flex: 1, width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32, paddingBottom: 32 }}>
          <StepContent step={currentStep} onStepComplete={goNext} onFinish={finishOnboarding} />
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Progress">
        <StepperContent currentStep={currentStep} />
      </Drawer>

      <Modal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Continue later anytime"
        cancelLabel="Continue activation"
        confirmLabel="Leave for now"
        onCancel={() => setLeaveModalOpen(false)}
        onConfirm={() => navigate('/dashboard', { state: { back: true } })}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 400,
            lineHeight: '22px',
            color: '#121621',
            textAlign: 'center',
            width: '100%',
            margin: 0,
          }}
        >
          You can safely leave this process now and pick up your account activation whenever you're ready.
        </p>
      </Modal>

      <AiChatWidget />
    </>
  )
}
