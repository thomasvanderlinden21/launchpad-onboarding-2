
type StepStatus = 'complete' | 'current' | 'incomplete'

interface StepDef {
  id: number
  title: string
}

const STEPS: StepDef[] = [
  { id: 1, title: 'Verify your identity'      },
  { id: 2, title: 'Add key individuals'       },
  { id: 3, title: 'Describe your business'   },
  { id: 4, title: 'Connect your bank account'},
  { id: 5, title: 'Review and confirm'       },
]

function deriveStatus(stepIndex: number, currentStep: number): StepStatus {
  if (stepIndex < currentStep - 1) return 'complete'
  if (stepIndex === currentStep - 1) return 'current'
  return 'incomplete'
}


// ─── Checkmark ────────────────────────────────────────────────────────────────

function CheckMark() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7.5l3.5 3.5 6.5-7" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Dot ─────────────────────────────────────────────────────────────────────

function StepIcon({ status }: { status: StepStatus }) {
  const isComplete = status === 'complete'
  const isCurrent  = status === 'current'

  return (
    <div
      aria-label={isComplete ? 'Completed' : isCurrent ? 'In progress' : 'To do'}
      style={{
        width: 24, height: 24, borderRadius: 9999,
        border: `1px solid ${isComplete || isCurrent ? '#277777' : '#b4b7bc'}`,
        backgroundColor: isComplete ? '#277777' : isCurrent ? '#f5f7f7' : '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 2,
      }}
    >
      {isComplete && <CheckMark />}
      {isCurrent && (
        <div style={{
          width: 18, height: 18, borderRadius: 9999,
          backgroundColor: '#1f5c5c',
          boxShadow: '0 0 0 2px #f5f7f7, 0 0 0 4px #277777',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <div style={{ width: 12, height: 12, borderRadius: 9999, backgroundColor: 'white' }} />
        </div>
      )}
      {!isComplete && !isCurrent && (
        <div style={{ width: 12, height: 12, borderRadius: 9999, backgroundColor: '#6b7676' }} />
      )}
    </div>
  )
}

// ─── Connector line ───────────────────────────────────────────────────────────
// Dashed gray is always the base. A solid teal bar grows downward on top
// when the step above is complete.

function Connector({ fromStatus }: { fromStatus: StepStatus }) {
  const isComplete = fromStatus === 'complete'

  return (
    <div style={{ flex: '1 0 0', position: 'relative', width: 24, minHeight: 0, zIndex: 1 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 0, height: '100%', borderLeft: '2px dashed #c9d0d0' }} />
      </div>
      {isComplete && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 2, height: '100%', backgroundColor: '#277777' }} />
        </div>
      )}
    </div>
  )
}

// ─── Single step row ──────────────────────────────────────────────────────────

function StepRow({ title, status, isLast }: {
  title: string
  status: StepStatus
  isLast: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', width: '100%', flexShrink: 0 }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: isLast ? 0 : 4,
        alignSelf: 'stretch',
        flexShrink: 0,
        paddingBottom: 4,
        isolation: 'isolate',
      }}>
        <StepIcon status={status} />
        {!isLast && <Connector fromStatus={status} />}
      </div>

      <div style={{ flex: '1 0 0', minWidth: 0, paddingTop: 2, paddingBottom: isLast ? 0 : 40 }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', margin: 0,
          color: status === 'incomplete' ? '#6b7676' : '#121621',
        }}>
          {title}
        </p>
      </div>
    </div>
  )
}

// ─── Exported component ───────────────────────────────────────────────────────

interface StepperContentProps {
  currentStep: number
  steps?: StepDef[]
}

export function StepperContent({ currentStep, steps = STEPS }: StepperContentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {steps.map((step, i) => (
        <StepRow
          key={step.id}
          title={step.title}
          status={deriveStatus(i, currentStep)}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  )
}
