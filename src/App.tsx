import { useState, type ReactNode } from 'react'
import { Drawer } from './Drawer'

// ─── Progress Ring ────────────────────────────────────────────────────────────

interface ProgressLineProps {
  current?: number
  total?: number
  onClick?: () => void
}

function ProgressLine({ current = 1, total = 5, onClick }: ProgressLineProps) {
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
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        flexShrink: 0,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '50%',
      }}
    >
      <svg
        width={40}
        height={40}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
      >
        <circle cx={20} cy={20} r={radius} stroke="#e6ebeb" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={20}
          cy={20}
          r={radius}
          stroke="#0D6E6E"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span
        className="relative z-10 select-none"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 400,
          lineHeight: '16px',
          color: '#121621',
          pointerEvents: 'none',
        }}
      >
        {current}/{total}
      </span>
    </button>
  )
}

// ─── Chevron Back ─────────────────────────────────────────────────────────────

function ChevronBackIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

interface ToolbarProps {
  title?: string
  currentStep?: number
  totalSteps?: number
  onBack?: () => void
  onStepperClick?: () => void
}

function Toolbar({
  title = 'Page title',
  currentStep = 1,
  totalSteps = 5,
  onBack,
  onStepperClick,
}: ToolbarProps) {
  return (
    <header
      className="sticky top-0 z-10 w-full flex items-center justify-between shrink-0"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e6ebeb',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        minHeight: 56,
      }}
    >
      <div className="flex items-center" style={{ minWidth: 40, minHeight: 40 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0D6E6E]"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <ChevronBackIcon />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-2">
        <p
          className="whitespace-nowrap text-center"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#121621' }}
        >
          {title}
        </p>
      </div>

      <div className="flex items-center shrink-0" style={{ minWidth: 40 }}>
        <ProgressLine current={currentStep} total={totalSteps} onClick={onStepperClick} />
      </div>
    </header>
  )
}

// ─── Content Area ─────────────────────────────────────────────────────────────

interface ContentAreaProps {
  heading?: string
  subtitle?: string
  children?: ReactNode
}

function ContentArea({
  heading = 'Place your content here',
  subtitle = 'Max-width LG (800)',
  children,
}: ContentAreaProps) {
  return (
    <main className="w-full shrink-0" style={{ maxWidth: 800, paddingLeft: 16, paddingRight: 16 }}>
      <div className="flex flex-col items-start w-full" style={{ gap: 8 }}>
        <h1
          className="w-full"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}
        >
          {heading}
        </h1>
        <p
          className="w-full"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0 }}
        >
          {subtitle}
        </p>
      </div>
      {children}
    </main>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <div className="brand-bg flex min-h-screen" style={{ padding: 12 }}>
        <div
          className="flex flex-col flex-1 items-center overflow-hidden"
          style={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: '#f5f7f7',
            border: '1px solid #e6ebeb',
            borderRadius: 8,
            boxShadow: '0px 0px 38px 0px rgba(0,0,0,0.16)',
            gap: 32,
            minHeight: 0,
          }}
        >
          <Toolbar
            title="Page title"
            currentStep={1}
            totalSteps={5}
            onStepperClick={() => setDrawerOpen(true)}
          />
          <ContentArea heading="Place your content here" subtitle="Max-width LG (800)" />
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Modal title"
      />
    </>
  )
}
