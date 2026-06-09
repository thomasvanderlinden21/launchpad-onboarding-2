import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AI_BG   = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE    = [0.22, 1, 0.36, 1] as const

const EXIT_UP = {
  opacity: 0, y: -20,
  transition: { duration: 0.24, ease: [0.4, 0, 1, 1] as const },
}

const ENTER_DOWN = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8, transition: { duration: 0.13, ease: [0.4, 0, 1, 1] as const } },
  transition: { duration: 0.2, ease: EASE },
}

const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

type Phase = 'role' | 'details' | 'identity' | 'scan'
const PHASE_ORDER: Phase[] = ['role', 'details', 'identity', 'scan']
const phaseIdx = (p: Phase) => PHASE_ORDER.indexOf(p)
const is   = (cur: Phase, t: Phase) => cur === t
const from = (cur: Phase, t: Phase) => phaseIdx(cur) >= phaseIdx(t)

// ─── Avatars ──────────────────────────────────────────────────────────────────

function AiAvatar() {
  return (
    <div style={{ position: 'absolute', top: -12, left: -12, width: 17, height: 17, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <svg width={10} height={10} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 1l2.2 6.4L18 10l-5.8 2.6L10 19l-2.2-6.4L2 10l5.8-2.6L10 1z" fill="white" />
      </svg>
    </div>
  )
}

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

// ─── Bubbles ──────────────────────────────────────────────────────────────────

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, width: '100%' }}>
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: 32, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AiAvatar />
        {children}
      </div>
    </div>
  )
}

function AiHistoryBubble({ question }: { question: string }) {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: '12px 16px', filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'inline-block', maxWidth: '80%' }}>
        <AiAvatar />
        <p style={{ ...T, color: '#121621', margin: 0 }}>{question}</p>
      </div>
    </div>
  )
}

function EditIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserBubble({ children, onEdit }: { children: React.ReactNode; onEdit?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}
    >
      {onEdit ? (
        <motion.button
          type="button"
          onClick={onEdit}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
          transition={{ duration: 0.15 }}
          aria-label="Edit this answer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9999, backgroundColor: '#e6f0ef', border: '1px solid #c8ddd9', color: '#277777', cursor: 'pointer', flexShrink: 0 }}
        >
          <EditIcon />
        </motion.button>
      ) : (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-label="Locked" style={{ flexShrink: 0, opacity: 0.35 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#525d5d" strokeWidth={2} />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="#525d5d" strokeWidth={2} strokeLinecap="round" />
        </svg>
      )}
      <div style={{ position: 'relative', backgroundColor: USER_BG, borderRadius: '12px 0 12px 12px', padding: 12, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))' }}>
        <UserAvatar />
        {children}
      </div>
    </div>
  )
}

// ─── Typography ───────────────────────────────────────────────────────────────

function AiTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>{children}</h2>
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <p style={{ ...T, color: '#121621', margin: 0 }}>{children}</p>
}

function BubbleText({ children }: { children: React.ReactNode }) {
  return <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{children}</p>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#525d5d', margin: 0 }}>{children}</p>
}

// ─── Radio button ─────────────────────────────────────────────────────────────

function RadioOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 8,
        backgroundColor: selected ? '#e6f0ef' : 'white',
        border: `1px solid ${selected ? '#277777' : '#e6ebeb'}`,
        borderRadius: 8, padding: '10px 16px',
        cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 9999, flexShrink: 0,
        border: `1px solid ${selected ? '#277777' : '#859090'}`,
        backgroundColor: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.15s',
      }}>
        {selected && (
          <div style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: '#277777' }} />
        )}
      </div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>
        {label}
      </span>
    </button>
  )
}

// ─── Info card ────────────────────────────────────────────────────────────────

function InfoCard() {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0px 4px 2px rgba(0,0,0,0.15)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>
        What is a Signatory and UBO?
      </p>


      <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
        <img src="/images/thumbnail.png" alt="Signatory and UBO explainer" style={{ width: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 9999, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, lineHeight: '18px', color: '#121621', margin: 0 }}>
            Signatory
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#121621', margin: 0 }}>
            A person who can sign documents on behalf of your company
          </p>
        </div>

        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, lineHeight: '18px', color: '#121621', margin: 0 }}>
            Ultimate Beneficial Owner (UBO)
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#121621', margin: 0 }}>
            A person who owns 25% or more of your company
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({ label, value, onYes, onNo }: {
  label: string; value: boolean | null; onYes: () => void; onNo: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <BodyText>{label}</BodyText>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <RadioOption label="Yes" selected={value === true}  onClick={onYes} />
        <RadioOption label="No"  selected={value === false} onClick={onNo}  />
      </div>
    </div>
  )
}

// ─── Labeled input fields (matching checkout style) ───────────────────────────

function HelpIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx={12} cy={12} r={9} stroke="#6b7676" strokeWidth={1.5} />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="#6b7676" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={12} cy={17} r=".5" fill="#6b7676" stroke="#6b7676" strokeWidth={1} />
    </svg>
  )
}

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        aria-label="More information"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}
      >
        <HelpIcon />
      </button>
      {visible && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#121621', color: 'white', borderRadius: 6, padding: '10px 12px',
          width: 260, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '18px',
          zIndex: 100, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #121621',
          }} />
        </div>
      )}
    </div>
  )
}

function ChevronDown() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="#6b7676" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const inputStyle: React.CSSProperties = {
  ...T, color: '#121621', backgroundColor: 'white',
  border: '1px solid #e6ebeb', borderRadius: 4,
  padding: 12, outline: 'none', width: '100%', boxSizing: 'border-box',
}

function Field({ label, value, onChange, placeholder, type = 'text', flex }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; flex?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: flex ?? '1 0 0', minWidth: 0 }}>
      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle} />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder, flex, labelSuffix }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; placeholder?: string; flex?: string; labelSuffix?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: flex ?? '1 0 0', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>{label}</label>
        {labelSuffix}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '0 12px', boxSizing: 'border-box' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ ...T, flex: 1, color: value ? '#121621' : '#9ca4a6', background: 'none', border: 'none', outline: 'none', appearance: 'none', cursor: 'pointer', padding: '12px 0' }}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown />
      </div>
    </div>
  )
}

function DisabledField({ label, value, flex }: { label: string; value: string; flex?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: flex ?? '1 0 0', minWidth: 0 }}>
      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#9ca4a6' }}>{label}</label>
      <input value={value} disabled
        style={{ ...inputStyle, color: '#9ca4a6', backgroundColor: '#f5f7f7', cursor: 'not-allowed' }} />
    </div>
  )
}

// ─── Continue button ──────────────────────────────────────────────────────────

function ContinueBtn({ onClick, disabled, label = 'Continue' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4,
          padding: '8px 16px', minHeight: 40,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px',
          color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
          opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap',
        }}
      >
        {label}
      </button>
    </div>
  )
}

// ─── Country options ──────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: 'BE', label: 'Belgium' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'LU', label: 'Luxembourg' },
]


// ─── Identity bubble ──────────────────────────────────────────────────────────

const imgIdNowBackground = '/images/id-verify-phone.png'

const REQUIREMENTS = [
  { label: 'Valid passport or national ID card',                          icon: '/images/id-icon-passport.svg' },
  { label: "Access to your smartphone's camera for selfie verification",  icon: '/images/id-icon-camera.svg'  },
  { label: 'Good lighting and a stable internet connection',              icon: '/images/id-icon-light.svg'   },
]

function IdentityBubble({ scrollRef, onBegin }: { scrollRef: React.RefObject<HTMLDivElement | null>; onBegin: () => void }) {
  return (
    <motion.div ref={scrollRef} {...ENTER_DOWN} transition={{ ...ENTER_DOWN.transition, delay: 0.18 }} style={{ width: '100%', scrollMarginTop: 48 }}>
      <AiBubble>
        <AiTitle>Next up we'll need to confirm your identity</AiTitle>
        <p style={{ ...T, color: '#121621', margin: 0 }}>
          We'll need to take a photo of your original ID document and a selfie with our{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>partner IDnow</span>.
          {' '}To perform the verification, you'll need:
        </p>

        {/* Info card */}
        <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0px 4px 2px rgba(0,0,0,0.15)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>What you'll need</p>
          <div style={{ borderRadius: 12, overflow: 'hidden', height: 234 }}>
            <img
              src={imgIdNowBackground}
              alt="IDnow identity verification"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {REQUIREMENTS.map((req, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: i < REQUIREMENTS.length - 1 ? 12 : 0 }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, border: '1px solid #b4b7bc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={req.icon} alt="" aria-hidden="true" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>{req.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onBegin}
              style={{
                backgroundColor: '#277777',
                border: '1px solid #277777',
                borderRadius: 4,
                padding: '8px 16px',
                minHeight: 44,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '22px',
                color: 'white',
                boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
                whiteSpace: 'nowrap',
              }}
            >
              Begin identity verification
            </button>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0, textAlign: 'right' }}>
            By clicking here, I agree to the IDnow{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
            {' '}and accept
            <br />
            the IDnow{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
          </p>
        </div>
      </AiBubble>
    </motion.div>
  )
}

// ─── Scan bubble ─────────────────────────────────────────────────────────────

const imgScanCode  = '/images/scan-code.png'
const imgLoading   = '/images/id-in-progress.png'
const imgSuccess   = '/images/success-verify.png'

type ScanState = 'idle' | 'scanning' | 'verified'

function ScanBubble({ scrollRef, onContinue }: { scrollRef: React.RefObject<HTMLDivElement | null>; onContinue: () => void }) {
  const [scanState, setScanState] = useState<ScanState>('idle')

  function handleQrClick() {
    if (scanState !== 'idle') return
    setScanState('scanning')
    setTimeout(() => setScanState('verified'), 2500)
  }

  return (
    <motion.div ref={scrollRef} {...ENTER_DOWN} transition={{ ...ENTER_DOWN.transition, delay: 0.18 }} style={{ width: '100%', scrollMarginTop: 48 }}>
      <AiBubble>
        <AnimatePresence mode="wait">

          {/* ── Idle: QR code ── */}
          {scanState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <AiTitle>Scan code</AiTitle>
              <BodyText>Use your phone's camera app to scan this QR code and begin verification</BodyText>
              <button
                type="button"
                onClick={handleQrClick}
                aria-label="Scan QR code to begin verification"
                style={{ borderRadius: 16, overflow: 'hidden', width: '100%', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
              >
                <img src={imgScanCode} alt="Scan QR code to begin verification" style={{ width: '100%', display: 'block' }} />
              </button>
            </motion.div>
          )}

          {/* ── Scanning: loading state ── */}
          {scanState === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }} transition={{ duration: 0.22 }} style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <AiTitle>Identification in progress...</AiTitle>
              <div style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f7f7' }}>
                <img src={imgLoading} alt="" aria-hidden="true" style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: 220 }} />
              </div>
              <BodyText>Please do not close this window while you are completing the identification process on mobile</BodyText>
            </motion.div>
          )}

          {/* ── Verified: success state ── */}
          {scanState === 'verified' && (
            <motion.div key="verified" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
              <AiTitle>Success!</AiTitle>
              <div style={{ borderRadius: 20, overflow: 'hidden' }}>
                <img src={imgSuccess} alt="Verification successful" style={{ width: '100%', display: 'block' }} />
              </div>
              <ContinueBtn onClick={onContinue} />
            </motion.div>
          )}

        </AnimatePresence>
      </AiBubble>
    </motion.div>
  )
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

export interface Step1Result {
  roleSummary: string
  firstName: string
  lastName: string
  isSignatory: boolean
  isUBO: boolean
  ownershipPct: string
}
interface Step1Props { onComplete: (result: Step1Result) => void; onPhaseChange?: (phase: Phase) => void }

export function Step1({ onComplete, onPhaseChange }: Step1Props) {
  const businessName = 'Beantastic Coffee'

  const [phase, setPhase] = useState<Phase>('role')

  useEffect(() => { onPhaseChange?.(phase) }, [phase])

  // Role phase
  const [isSignatory,  setIsSignatory]  = useState<boolean | null>(null)
  const [isUBO,        setIsUBO]        = useState<boolean | null>(null)
  const [ownershipPct, setOwnershipPct] = useState('')

  // Details phase — pre-filled from checkout if available
  const [firstName,    setFirstName]    = useState(() => localStorage.getItem('user_firstName') ?? '')
  const [lastName,     setLastName]     = useState(() => localStorage.getItem('user_lastName') ?? '')
  const [dob,          setDob]          = useState('')
  const [countryBirth, setCountryBirth] = useState('')
  const [streetNo,     setStreetNo]     = useState('')
  const [street,       setStreet]       = useState('')
  const [city,         setCity]         = useState('')
  const [postcode,     setPostcode]     = useState('')
  const [trusteeRel,   setTrusteeRel]   = useState('')

  const detailsRef  = useRef<HTMLDivElement>(null)
  const identityRef = useRef<HTMLDivElement>(null)
  const scanRef     = useRef<HTMLDivElement>(null)

  // Scroll to the new bubble when phase advances
  useEffect(() => {
    const map: Partial<Record<Phase, React.RefObject<HTMLDivElement | null>>> = {
      details:  detailsRef,
      identity: identityRef,
      scan:     scanRef,
    }
    const ref = map[phase]
    if (!ref?.current) return
    const id = requestAnimationFrame(() => {
      const t = setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 280)
      return () => clearTimeout(t)
    })
    return () => cancelAnimationFrame(id)
  }, [phase])

  function buildRoleSummary() {
    const roles: string[] = []
    if (isSignatory) roles.push('a director')
    if (isUBO)       roles.push('a UBO')
    if (roles.length === 0) return `I have no director or UBO role at ${businessName}`
    return `I am ${roles.join(' and ')} of ${businessName}`
  }

  const canContinueRole    = isSignatory !== null && isUBO !== null && (isUBO === false || ownershipPct.trim() !== '')
  const canContinueDetails = firstName.trim() !== '' && lastName.trim() !== '' && trusteeRel !== ''

  function handleDob(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`
    setDob(formatted)
  }

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: 32, display: 'flex', flexDirection: 'column' }}>

      {/* ── PHASE: role — AI bubble exits upward on submit ── */}
      <AnimatePresence mode="popLayout">
        {is(phase, 'role') && (
          <motion.div key="role" exit={EXIT_UP} style={{ width: '100%' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, ease: EASE }}>
              <AiBubble>
                <AiTitle>Your role in the company</AiTitle>
                <BodyText>The next part is about individuals who play a significant role in {businessName}.</BodyText>

                <InfoCard />

                <QuestionRow
                  label="Are you a Signatory?"
                  value={isSignatory}
                  onYes={() => setIsSignatory(true)}
                  onNo={() => setIsSignatory(false)}
                />
                <QuestionRow
                  label="Are you a Ultimate Beneficial Owner (UBO)?"
                  value={isUBO}
                  onYes={() => setIsUBO(true)}
                  onNo={() => { setIsUBO(false); setOwnershipPct('') }}
                />

                <AnimatePresence>
                  {isUBO && (
                    <motion.div
                      key="ownership"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                        <SectionLabel>What is your percentage ownership?</SectionLabel>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '0 12px', gap: 8 }}>
                          <input
                            type="number" min={25} max={100}
                            value={ownershipPct}
                            onChange={e => setOwnershipPct(e.target.value)}
                            placeholder="0"
                            style={{ ...T, flex: 1, color: '#121621', background: 'none', border: 'none', outline: 'none', padding: '12px 0' }}
                          />
                          <span style={{ ...T, color: '#6b7676', flexShrink: 0 }}>%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <ContinueBtn onClick={() => setPhase('details')} disabled={!canContinueRole} />
              </AiBubble>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── After role: user role bubble + details + identity + scan ── */}
      {from(phase, 'details') && (
        <motion.div key="after-role" {...ENTER_DOWN} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* AI history: role question */}
          <AiHistoryBubble question="Your role in the company" />

          {/* User bubble — role summary */}
          <UserBubble onEdit={() => setPhase('role')}>
            <BubbleText>{buildRoleSummary()}</BubbleText>
          </UserBubble>

          {/* ── PHASE: details ── */}
          <AnimatePresence mode="popLayout">
            {is(phase, 'details') && (
              <motion.div key="details" ref={detailsRef} exit={EXIT_UP} style={{ width: '100%', scrollMarginTop: 48 }}>
                <AiBubble>
                  <AiTitle>Please complete the below details</AiTitle>
                  <BodyText>Make sure the below details match your ID document.</BodyText>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>Personal details</SectionLabel>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Field label="First name" value={firstName} onChange={setFirstName} />
                      <Field label="Last name"  value={lastName}  onChange={setLastName}  />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Field label="Date of birth" value={dob} onChange={handleDob} placeholder="dd-mm-yyyy" />
                      <SelectField label="Country of birth" value={countryBirth} onChange={setCountryBirth} options={COUNTRIES} placeholder="Please select" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel>Address</SectionLabel>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Field label="Street" value={street}   onChange={setStreet}   />
                      <Field label="Number" value={streetNo} onChange={setStreetNo} flex="0 0 120px" />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Field label="City"     value={city}     onChange={setCity}     />
                      <Field label="Postcode" value={postcode} onChange={setPostcode} flex="0 0 140px" />
                    </div>
                    <DisabledField label="Country" value="Belgium" />
                  </div>

                  {/* Trustee relationship — Yes / No */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>
                        Trustee relationship
                      </label>
                      <Tooltip text="A trustee relationship exists when a person or entity manages assets on behalf of a trust. Select Yes if this applies to your business or its owners." />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {(['yes', 'no'] as const).map(opt => {
                        const sel = trusteeRel === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setTrusteeRel(opt)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, backgroundColor: 'white', border: `1px solid ${sel ? '#277777' : '#e6ebeb'}`, borderRadius: 6, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}
                          >
                            <div style={{ width: 16, height: 16, borderRadius: 9999, border: `2px solid ${sel ? '#277777' : '#9ca4a6'}`, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {sel && <div style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: '#277777' }} />}
                            </div>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621' }}>
                              {opt === 'yes' ? 'Yes' : 'No'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <ContinueBtn onClick={() => setPhase('identity')} disabled={!canContinueDetails} />
                </AiBubble>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI history + user name bubble (once details done) */}
          {from(phase, 'identity') && (
            <motion.div {...ENTER_DOWN} style={{ display: 'flex', flexDirection: 'column' }}>
              <AiHistoryBubble question="Please complete the below details" />
              <UserBubble onEdit={() => setPhase('details')}>
                <BubbleText>{firstName} {lastName}</BubbleText>
              </UserBubble>
            </motion.div>
          )}

          {/* ── PHASE: identity ── */}
          <AnimatePresence mode="popLayout">
            {is(phase, 'identity') && (
              <motion.div key="identity" exit={EXIT_UP} style={{ width: '100%' }}>
                <IdentityBubble scrollRef={identityRef} onBegin={() => setPhase('scan')} />
              </motion.div>
            )}
          </AnimatePresence>


          {/* AI history: identity question (shown when scan is active) */}
          {from(phase, 'scan') && (
            <motion.div {...ENTER_DOWN}>
              <AiHistoryBubble question="Next up we'll need to confirm your identity" />
            </motion.div>
          )}

          {/* ── PHASE: scan ── */}
          <AnimatePresence mode="popLayout">
            {is(phase, 'scan') && (
              <motion.div key="scan" exit={EXIT_UP} style={{ width: '100%' }}>
                <ScanBubble scrollRef={scanRef} onContinue={() => onComplete({ roleSummary: buildRoleSummary(), firstName, lastName, isSignatory: isSignatory ?? false, isUBO: isUBO ?? false, ownershipPct })} />
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </div>
  )
}
