import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Drawer } from './Drawer'
import { Modal } from './Modal'
import { StepperContent } from './StepperContent'
import { AiChatWidget } from './AiChat'
import { Step1, type Step1Result } from './steps/Step1'
import { Step2, type Step2Individual } from './steps/Step2'
import { Step3, type Step3Data } from './steps/Step3'
import { Step4, type Step4Data } from './steps/Step4'
import { Step5 } from './steps/Step5'
import { getResumeStep, markStepCompleted } from './onboardingProgress'

const TOTAL_STEPS = 5
const EASE = [0.22, 1, 0.36, 1] as const

const STEP_TITLES = [
  'Verify your identity',
  'Add key individuals',
  'Describe your business',
  'Connect your bank account',
  'Review and confirm',
]

// ─── Smooth scroll ────────────────────────────────────────────────────────────

function scrollTo(container: HTMLDivElement, to: number, duration = 460) {
  const from = container.scrollTop
  const delta = to - from
  if (delta === 0) return
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1)
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    container.scrollTop = from + delta * ease
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ─── Compact user bubble (with optional edit on hover) ────────────────────────

function UserAvatar() {
  return (
    <div style={{ position: 'absolute', top: -12, right: -9, width: 17, height: 17, borderRadius: 9999, backgroundColor: '#066076', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx={5} cy={3.5} r={2} fill="white" />
        <path d="M1 9c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth={1} strokeLinecap="round" />
      </svg>
    </div>
  )
}

function EditIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CompactUserBubble({ children, onEdit }: { children: React.ReactNode; onEdit?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}
    >
      {onEdit && (
        <motion.button
          type="button"
          onClick={onEdit}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
          transition={{ duration: 0.15 }}
          aria-label="Edit this step"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9999, backgroundColor: '#e6f0ef', border: '1px solid #c8ddd9', color: '#277777', cursor: 'pointer', flexShrink: 0, pointerEvents: hovered ? 'auto' : 'none' }}
        >
          <EditIcon />
        </motion.button>
      )}
      <div style={{ position: 'relative', backgroundColor: '#dcf4fa', borderRadius: '12px 0 12px 12px', padding: 12, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))' }}>
        <UserAvatar />
        {children}
      </div>
    </div>
  )
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressLine({ current, total, onClick }: { current: number; total: number; onClick?: () => void }) {
  const radius = 16
  const strokeWidth = 3.5
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - current / total)

  return (
    <button type="button" onClick={onClick} aria-label={`Step ${current} of ${total} — open steps overview`}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}>
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={20} cy={20} r={radius} stroke="#e6ebeb" strokeWidth={strokeWidth} fill="none" />
        <circle cx={20} cy={20} r={radius} stroke="#0D6E6E" strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
          transform="rotate(-90 20 20)" style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
      </svg>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#121621', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        {current}/{total}
      </span>
    </button>
  )
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Toolbar({ title = 'Onboarding', currentStep, totalSteps, onBack, onStepperClick }: {
  title?: string; currentStep: number; totalSteps: number; onBack?: () => void; onStepperClick?: () => void
}) {
  return (
    <header className="sticky top-0 z-10 w-full flex items-center shrink-0"
      style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e6ebeb', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, minHeight: 56 }}>
      <div style={{ minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center' }}>
        <button type="button" onClick={onBack} aria-label="Leave onboarding"
          style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
          <CloseIcon />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>
          {title}
        </p>
      </div>
      <div style={{ minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <ProgressLine current={currentStep} total={totalSteps} onClick={onStepperClick} />
      </div>
    </header>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(() => getResumeStep())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeStepRef = useRef<HTMLDivElement>(null)

  // Step completion data — persisted to localStorage so history survives navigation
  const [step1Result, setStep1Result] = useState<Step1Result | null>(() => {
    try { return JSON.parse(localStorage.getItem('ob_step1') || 'null') } catch { return null }
  })
  const [step2Data, setStep2Data] = useState<Step2Individual[] | null>(() => {
    try { return JSON.parse(localStorage.getItem('ob_step2') || 'null') } catch { return null }
  })
  const [step3Data, setStep3Data] = useState<Step3Data | null>(() => {
    try { return JSON.parse(localStorage.getItem('ob_step3') || 'null') } catch { return null }
  })
  const [step4Data, setStep4Data] = useState<Step4Data | null>(() => {
    try { return JSON.parse(localStorage.getItem('ob_step4') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (currentStep === 1) return
    const container = scrollContainerRef.current
    const el = activeStepRef.current
    if (!container || !el) return
    const id = requestAnimationFrame(() => {
      const t = setTimeout(() => {
        const containerTop = container.getBoundingClientRect().top
        const elTop = el.getBoundingClientRect().top
        const target = Math.max(0, container.scrollTop + (elTop - containerTop) - 48)
        scrollTo(container, target)
      }, 180)
      return () => clearTimeout(t)
    })
    return () => cancelAnimationFrame(id)
  }, [currentStep])

  function clearOb(keys: string[]) { keys.forEach(k => localStorage.removeItem(k)) }

  function goToStep(step: number) {
    setCurrentStep(step)
    if (step <= 1) {
      setStep1Result(null); clearOb(['ob_step1'])
      setStep2Data(null);   clearOb(['ob_step2'])
    }
    if (step < 3) { setStep3Data(null); clearOb(['ob_step3']) }
    if (step < 4) { setStep4Data(null); clearOb(['ob_step4']) }
  }

  function handleStep1Complete(result: Step1Result) {
    setStep1Result(result)
    localStorage.setItem('ob_step1', JSON.stringify(result))
    markStepCompleted(1); setCurrentStep(2)
  }

  function buildSelfIndividual(r: Step1Result): Step2Individual {
    const roles: string[] = []
    if (r.isSignatory) roles.push('Signatory')
    if (r.isUBO) roles.push('UBO')
    return { name: `${r.firstName} ${r.lastName}`.trim(), detail: roles.join(' and ') || 'Key individual' }
  }

  function handleStep2Complete(individuals: Step2Individual[]) {
    setStep2Data(individuals)
    localStorage.setItem('ob_step2', JSON.stringify(individuals))
    markStepCompleted(2); setCurrentStep(3)
  }

  function handleStep3Complete(data: Step3Data) {
    setStep3Data(data)
    localStorage.setItem('ob_step3', JSON.stringify(data))
    markStepCompleted(3); setCurrentStep(4)
  }

  function handleStep4Complete(data: Step4Data) {
    setStep4Data(data)
    localStorage.setItem('ob_step4', JSON.stringify(data))
    markStepCompleted(4); setCurrentStep(5)
  }

  function handleStep5Complete() {
    markStepCompleted(5)
    clearOb(['ob_step1', 'ob_step2', 'ob_step3', 'ob_step4'])
    navigate('/dashboard')
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
        <Toolbar
          title={STEP_TITLES[currentStep - 1]}
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={() => setLeaveModalOpen(true)}
          onStepperClick={() => setDrawerOpen(true)}
        />

        <div
          ref={scrollContainerRef}
          style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: 600, overflowY: 'auto', overflowAnchor: 'none', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 16, paddingTop: 48, paddingBottom: 'calc(100vh - 104px)' }}
        >
          {/* ── Step 1 ── */}
          {currentStep === 1 && (
            <div ref={activeStepRef} style={{ width: '100%', scrollMarginTop: 48 }}>
              <Step1 onComplete={handleStep1Complete} />
            </div>
          )}
          {currentStep > 1 && step1Result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
              <CompactUserBubble>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#121621', margin: 0, textAlign: 'right' }}>{step1Result.roleSummary}</p>
              </CompactUserBubble>
            </motion.div>
          )}

          {/* ── Step 2 ── */}
          {currentStep === 2 && (
            <div ref={activeStepRef} style={{ width: '100%', scrollMarginTop: 48 }}>
              <Step2
                onComplete={handleStep2Complete}
                selfIndividual={step1Result ? buildSelfIndividual(step1Result) : undefined}
                initialData={step2Data ?? undefined}
              />
            </div>
          )}
          {currentStep > 2 && step2Data && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
              <CompactUserBubble onEdit={() => goToStep(2)}>
                {step2Data.map((ind, i) => (
                  <div key={i} style={{ textAlign: 'right', marginBottom: i < step2Data.length - 1 ? 8 : 0 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#121621', margin: 0 }}>{ind.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#525d5d', margin: 0 }}>{ind.detail}</p>
                  </div>
                ))}
              </CompactUserBubble>
            </motion.div>
          )}

          {/* ── Step 3 ── */}
          {currentStep === 3 && (
            <div ref={activeStepRef} style={{ width: '100%', scrollMarginTop: 48 }}>
              <Step3 onComplete={handleStep3Complete} />
            </div>
          )}
          {currentStep > 3 && step3Data && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CompactUserBubble onEdit={() => goToStep(3)}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#121621', margin: 0, textAlign: 'right' }}>{step3Data.salesLocation}</p>
                </CompactUserBubble>
                <CompactUserBubble onEdit={() => goToStep(3)}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#121621', margin: 0, textAlign: 'right' }}>{step3Data.category}</p>
                </CompactUserBubble>
              </div>
            </motion.div>
          )}

          {/* ── Step 4 ── */}
          {currentStep === 4 && (
            <div ref={activeStepRef} style={{ width: '100%', scrollMarginTop: 48 }}>
              <Step4 onComplete={handleStep4Complete} />
            </div>
          )}
          {currentStep > 4 && step4Data && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
              <CompactUserBubble>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#121621', margin: 0, textAlign: 'right' }}>Bank account connected</p>
                {step4Data.accountLabel && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#525d5d', margin: '2px 0 0', textAlign: 'right' }}>{step4Data.accountLabel}</p>
                )}
              </CompactUserBubble>
            </motion.div>
          )}

          {/* ── Step 5 ── */}
          {currentStep === 5 && (
            <div ref={activeStepRef} style={{ width: '100%', scrollMarginTop: 48 }}>
              <Step5 onComplete={handleStep5Complete} />
            </div>
          )}
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
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', textAlign: 'center', width: '100%', margin: 0 }}>
          You can safely leave this process now and pick up your account activation whenever you're ready.
        </p>
      </Modal>

      <AiChatWidget />
    </>
  )
}
