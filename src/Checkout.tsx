import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Drawer } from './Drawer'
import { Modal } from './Modal'
import { StepperContent } from './StepperContent'
import { AiChatWidget } from './AiChat'

const TOTAL_STEPS = 3

const CHECKOUT_STEPS = [
  { id: 1, title: 'Create account' },
  { id: 2, title: 'Step 2' },
  { id: 3, title: 'Step 3' },
]

const AI_BG   = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE    = [0.22, 1, 0.36, 1] as const

function scrollTo(container: HTMLDivElement, to: number, duration = 460) {
  const from  = container.scrollTop
  const delta = to - from
  if (delta === 0) return
  const start = performance.now()
  const tick  = (now: number) => {
    const t    = Math.min((now - start) / duration, 1)
    const ease = t < 0.5                            // ease-in-out cubic
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
    container.scrollTop = from + delta * ease
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const EXIT_UP = {
  opacity: 0, y: -20,
  transition: { duration: 0.24, ease: [0.4, 0, 1, 1] as const },
}

const ENTER_DOWN = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const } },
  transition: { duration: 0.28, ease: EASE },
}

const SWAP_ANIM = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] as const } },
  transition: { duration: 0.18, ease: EASE },
}

type Phase = 'form' | 'verification' | 'password' | 'company' | 'results' | 'selected' | 'edit' | 'summary' | 'payment' | 'success'

interface OrderItem {
  id: string
  name: string
  subtitle: string
  price: number
  quantity: number
  img: string
}

const CHECKOUT_PHASE_ORDER: Phase[] = ['form', 'verification', 'password', 'company', 'results', 'selected', 'edit', 'summary', 'payment', 'success']


interface CompanyData {
  name: string; idNumber: string; street: string; number: string
  city: string; postcode: string; sameShipping: boolean
}

const DEFAULT_COMPANY: CompanyData = {
  name: 'Beantastic Coffee', idNumber: '1234567890',
  street: 'Chaussee de Haecht', number: '14',
  city: 'Brussels', postcode: '1130', sameShipping: true,
}

interface AccountForm { firstName: string; lastName: string; email: string }

// ─── Password validation ──────────────────────────────────────────────────────

const CRITERIA = [
  { label: '10 characters or more',        test: (p: string) => p.length >= 10 },
  { label: 'At least 1 number',            test: (p: string) => /\d/.test(p) },
  { label: 'At least 1 special character', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
  { label: 'At least 1 upper and lower case', test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
]

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressLine({ current, total, onClick }: { current: number; total: number; onClick?: () => void }) {
  const radius = 16
  const strokeWidth = 3.5
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - current / total)

  return (
    <button type="button" onClick={onClick} aria-label={`Step ${current} of ${total}`}
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

function Toolbar({ currentStep, totalSteps, onBack, onStepperClick }: {
  currentStep: number; totalSteps: number; onBack?: () => void; onStepperClick?: () => void
}) {
  return (
    <header className="sticky top-0 z-10 w-full flex items-center shrink-0"
      style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e6ebeb', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, minHeight: 56 }}>
      <div style={{ minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center' }}>
        <button type="button" onClick={onBack} aria-label="Go back"
          style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
          <CloseIcon />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>
          Checkout
        </p>
      </div>
      <div style={{ minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <ProgressLine current={currentStep} total={totalSteps} onClick={onStepperClick} />
      </div>
    </header>
  )
}

// ─── Avatars ─────────────────────────────────────────────────────────────────

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

// ─── Field ────────────────────────────────────────────────────────────────────

const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

function Field({ label, value, onChange, type = 'text', autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoFocus?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 0 0', minWidth: 0 }}>
      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} autoFocus={autoFocus}
        style={{ ...T, color: '#121621', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: 12, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
    </div>
  )
}

// ─── Validator dot ────────────────────────────────────────────────────────────

function ValidatorDot({ met }: { met: boolean }) {
  return (
    <motion.div
      animate={{ backgroundColor: met ? '#277777' : '#9ca4a6' }}
      transition={{ duration: 0.2 }}
      style={{ width: 16, height: 16, borderRadius: 9999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {met && (
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </motion.div>
  )
}

// ─── Bubble wrappers ──────────────────────────────────────────────────────────

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
        /* Edit button — fades in on hover */
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
        /* Lock icon — subtle indicator that this answer is fixed */
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

function CompactAiBubble({ text }: { text: string }) {
  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: 12, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'inline-block' }}>
        <AiAvatar />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', margin: 0 }}>
          {text}
        </p>
      </div>
    </div>
  )
}

// ─── Step 1 — Create account form ─────────────────────────────────────────────

function Step1Form({ onContinue }: { onContinue: (data: AccountForm) => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const canContinue = firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (canContinue) onContinue({ firstName, lastName, email })
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div key="step1-form" exit={EXIT_UP} style={{ width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: EASE }}
        >
          <AiBubble>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <h1 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
                Create a Worldline account
              </h1>
              <div style={{ display: 'flex', gap: 24, width: '100%' }}>
                <Field label="First name" value={firstName} onChange={setFirstName} autoFocus />
                <Field label="Last name"  value={lastName}  onChange={setLastName} />
              </div>
              <Field label="Email" value={email} onChange={setEmail} type="email" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                <p style={{ ...T, color: '#121621', margin: 0, flexShrink: 0 }}>
                  Already a customer?{' '}
                  <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Sign in</span>
                </p>
                <div style={{ flex: '1 0 0' }} />
                <button type="submit" disabled={!canContinue}
                  style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: canContinue ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', opacity: canContinue ? 1 : 0.5, whiteSpace: 'nowrap' }}>
                  Continue
                </button>
              </div>
            </form>
          </AiBubble>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Step 1 — Verification bubble ─────────────────────────────────────────────

function VerificationBubble({ data, onEmailClick, onEditName }: { data: AccountForm; onEmailClick?: () => void; onEditName?: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', scrollMarginTop: 48 }}>

      {/* User bubble — appears first, confirms what was just submitted */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: EASE, delay: 0.06 }}
      >
        <UserBubble onEdit={onEditName}>
          <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>
            {data.firstName} {data.lastName}
          </p>
          <p style={{ ...T, color: '#525d5d', margin: 0, textAlign: 'right' }}>
            {data.email}
          </p>
        </UserBubble>
      </motion.div>

      {/* AI bubble — follows after the user bubble has settled */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: EASE, delay: 0.18 }}
      >
        <AiBubble>
          <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
            Check your inbox
          </h2>
          <p style={{ ...T, color: '#121621', margin: 0 }}>
            We've sent an email with a secure link to{' '}
            <span
              onClick={onEmailClick}
              style={{ fontWeight: 500, cursor: onEmailClick ? 'pointer' : 'default', color: '#277777' }}
              title="Click to simulate email verification"
            >
              {data.email}
            </span>
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#6b7676', margin: 0 }}>
            Didn't receive an email? Check your spam folder or{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>request a new one</span>
          </p>
        </AiBubble>
      </motion.div>

    </div>
  )
}

// ─── Step 1 — Password bubble ─────────────────────────────────────────────────

function PasswordBubble({ scrollRef, onContinue, done = false }: { scrollRef: React.RefObject<HTMLDivElement | null>; onContinue: () => void; done?: boolean }) {
  const [password, setPassword]   = useState('')
  const [showPw,   setShowPw]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const checks = CRITERIA.map(c => c.test(password))
  const allMet = checks.every(Boolean)

  useEffect(() => {
    if (done) return
    const id = setTimeout(() => inputRef.current?.focus(), 500)
    return () => clearTimeout(id)
  }, [])

  return (
    <motion.div ref={scrollRef} {...ENTER_DOWN} style={{ width: '100%', scrollMarginTop: 48 }}>
      <AiBubble>
        <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
          Email verified. Now let's build your password
        </h2>
        <p style={{ ...T, color: '#121621', margin: 0 }}>Create a strong password</p>

        {/* Password input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Password</label>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '0 12px' }}>
            <input
              ref={inputRef}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && allMet && !done && onContinue()}
              style={{ ...T, flex: 1, color: '#121621', background: 'none', border: 'none', outline: 'none', padding: '12px 0' }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#6b7676' }}>
              {showPw ? (
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.5} />
                </svg>
              ) : (
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <line x1={1} y1={1} x2={23} y2={23} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Validation criteria */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4, paddingBottom: 4 }}>
          {CRITERIA.map((c, i) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ValidatorDot met={checks[i]} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#6b7676' }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer — hidden once this step is done */}
        {!done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onContinue} disabled={!allMet}
                style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: allMet ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', opacity: allMet ? 1 : 0.5 }}>
                Continue
              </button>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#6b7676', margin: 0, textAlign: 'right' }}>
              By clicking create new account I confirm I agree to the{' '}
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </div>
        )}
      </AiBubble>
    </motion.div>
  )
}

// ─── Step 2 — Company lookup ──────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="#6b7676" strokeWidth={1.5} />
      <path d="M16.5 16.5L21 21" stroke="#6b7676" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

// ─── Step 2 — Company lookup (search + inline results) ───────────────────────

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
      <div style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, backgroundColor: checked ? '#277777' : 'white', border: checked ? 'none' : '1px solid #b4b7bc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <svg width={10} height={10} viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#121621' }}>{label}</span>
    </button>
  )
}

const COMPANY_RESULTS = [
  { name: 'Beantastic Coffee',     id: '0821557904', address: 'Chaussee de Haecht 1442, 1130, Brussels' },
  { name: 'Beantastic Coffee Ltd', id: '0697114288', address: 'Chaussée de Namur 76, 5000, Namur' },
  { name: 'Beantastic Coffee & Co',id: '0753886491', address: 'Chaussée de Charleroi 48, 1060, Saint-Gilles' },
  { name: 'Beantastic',            id: '0892340177', address: 'Avenue Louise 87, 1050, Brussels' },
  { name: "Coffee's Bean",         id: '0892340177', address: 'Rue des Guillemins 31, 4000, Liège' },
  { name: 'Bean Cafe Ltd',         id: '0796328764', address: 'Kortrijksesteenweg 154, 9000, Ghent' },
]

const shipInput: React.CSSProperties = {
  ...T, color: '#121621', backgroundColor: 'white',
  border: '1px solid #b4b7bc', borderRadius: 4,
  padding: 12, outline: 'none', width: '100%', boxSizing: 'border-box',
}

function CompanyDetailBubble({ scrollRef, data, onBack, onEdit, onConfirm }: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  data: CompanyData; onBack: () => void; onEdit: () => void; onConfirm: () => void
}) {
  const [sameShipping, setSameShipping] = useState(data.sameShipping)
  const [shipStreet,   setShipStreet]   = useState('')
  const [shipNumber,   setShipNumber]   = useState('')
  const [shipCity,     setShipCity]     = useState('')
  const [shipPostcode, setShipPostcode] = useState('')
  const lines = [data.name, data.idNumber, data.street + ' ' + data.number, data.postcode, data.city, 'Belgium']

  const lbl: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }

  return (
    <motion.div ref={scrollRef} {...SWAP_ANIM} style={{ width: '100%', scrollMarginTop: 48 }}>
      <AiBubble>
        <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
          Here's what we found
        </h2>
        <p style={{ ...T, color: '#121621', margin: 0 }}>
          Please carefully review your company's details. If anything is incorrect make the necessary changes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {lines.map((line, i) => (
            <p key={i} style={{ ...T, color: '#121621', margin: 0 }}>{line}</p>
          ))}
        </div>

        <Checkbox checked={sameShipping} onChange={() => setSameShipping(s => !s)} label="This is also my shipping address" />

        {/* Shipping address form — animates in when checkbox unchecked */}
        <AnimatePresence>
          {!sameShipping && (
            <motion.div key="ship-form" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ ...T, color: '#121621', margin: 0 }}>Add shipping address</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={lbl}>Street</label>
                  <input value={shipStreet} onChange={e => setShipStreet(e.target.value)} style={shipInput} />
                </div>
                <div style={{ flexShrink: 0, width: 113, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={lbl}>Number</label>
                  <input value={shipNumber} onChange={e => setShipNumber(e.target.value)} style={shipInput} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flexShrink: 0, width: 242, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={lbl}>City</label>
                  <input value={shipCity} onChange={e => setShipCity(e.target.value)} style={shipInput} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={lbl}>Post code</label>
                  <input value={shipPostcode} onChange={e => setShipPostcode(e.target.value)} style={shipInput} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ ...lbl, color: '#9ca4a6' }}>Country</label>
                <input value="Belgium" disabled style={{ ...shipInput, backgroundColor: '#f5f7f7', color: '#9ca4a6', border: '1px solid #e6ebeb', cursor: 'not-allowed' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSameShipping(true)}
                  style={{ backgroundColor: '#e6ebeb', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', whiteSpace: 'nowrap' }}>
                  Cancel
                </button>
                <button type="button" onClick={onConfirm}
                  style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', whiteSpace: 'nowrap' }}>
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main actions — hidden while shipping form is open */}
        {sameShipping && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
            <button type="button" onClick={onBack}
              style={{ background: 'none', border: 'none', borderRadius: 4, padding: '8px 4px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to results
            </button>
            <div style={{ display: 'flex', gap: 16 }}>
              <button type="button" onClick={onEdit}
                style={{ backgroundColor: '#e6ebeb', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', whiteSpace: 'nowrap' }}>
                Make changes
              </button>
              <button type="button" onClick={onConfirm}
                style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', whiteSpace: 'nowrap' }}>
                Confirm details
              </button>
            </div>
          </div>
        )}
      </AiBubble>
    </motion.div>
  )
}

function ChevronRight() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CompanyLookupBubble({ scrollRef, initialQuery = '', onQueryChange, onFind, onEditSearch, showResults, onEdit, onConfirm }: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  initialQuery?: string; onQueryChange?: (q: string) => void; onFind?: () => void; onEditSearch?: () => void
  showResults: boolean; onEdit: () => void; onConfirm: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const canSearch = query.trim().length > 0

  useEffect(() => {
    if (showResults) return
    const id = setTimeout(() => inputRef.current?.focus(), 500)
    return () => clearTimeout(id)
  }, [])

  function handleChange(v: string) {
    setQuery(v)
    onQueryChange?.(v)
  }

  return (
    <motion.div ref={scrollRef} {...ENTER_DOWN} style={{ width: '100%', scrollMarginTop: 48 }}>
      <AiBubble>
        <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
          Let's look up your company
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>
            Company name or identification number
          </label>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: `1px solid ${showResults ? '#b4b7bc' : '#e6ebeb'}`, borderRadius: 4, padding: '0 12px', gap: 8 }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleChange(e.target.value)}
              placeholder="Search..."
              readOnly={showResults}
              onKeyDown={e => e.key === 'Enter' && canSearch && !showResults && onFind?.()}
              style={{ ...T, flex: 1, color: '#121621', background: 'none', border: 'none', outline: 'none', padding: '12px 0' }}
            />
            {showResults ? (
              <button type="button" onClick={onEditSearch} aria-label="Clear search"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#525d5d', flexShrink: 0 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <SearchIcon />
            )}
          </div>
        </div>

        {!showResults && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onFind} disabled={!canSearch} aria-label="Find my company"
              style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 44, cursor: canSearch ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', opacity: canSearch ? 1 : 0.5, whiteSpace: 'nowrap' }}>
              Find my company
            </button>
          </div>
        )}

        {/* Results — tile list */}
        <AnimatePresence>
          {showResults && (
            <motion.div key="results-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <p style={{ ...T, color: '#121621', margin: 0 }}>{COMPANY_RESULTS.length} results found</p>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {COMPANY_RESULTS.map((company, i) => {
                  const isFirst = i === 0
                  const isLast  = i === COMPANY_RESULTS.length - 1
                  return (
                    <button key={company.id + i} type="button" onClick={onConfirm}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        backgroundColor: 'white', border: '1px solid #e6ebeb',
                        borderRadius: isFirst ? '8px 8px 0 0' : isLast ? '0 0 8px 8px' : 0,
                        marginBottom: isLast ? 0 : -1,
                        padding: 16, cursor: 'pointer', textAlign: 'left', width: '100%',
                      }}>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>
                          {company.name}
                        </p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#525d5d', margin: 0 }}>
                          {company.id}<br />{company.address}
                        </p>
                      </div>
                      <ChevronRight />
                    </button>
                  )
                })}
              </div>

              {/* hidden — needed so onEdit/onConfirm types are satisfied but not rendered */}
              <span style={{ display: 'none' }} onClick={onEdit} />
            </motion.div>
          )}
        </AnimatePresence>
      </AiBubble>
    </motion.div>
  )
}

// ─── Step 2 — Edit company details ───────────────────────────────────────────

function EditField({ label, value, onChange, disabled = false, flex, autoFocus }: {
  label: string; value: string; onChange?: (v: string) => void; disabled?: boolean; flex?: string; autoFocus?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: flex ?? '1 0 0', minWidth: 0 }}>
      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: disabled ? '#9ca4a6' : '#525d5d' }}>
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        style={{ ...T, color: disabled ? '#9ca4a6' : '#121621', backgroundColor: disabled ? '#f5f7f7' : 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: 12, outline: 'none', width: '100%', boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text' }}
      />
    </div>
  )
}

function CompanyEditBubble({ scrollRef, onBack, onSave, data }: {
  scrollRef: React.RefObject<HTMLDivElement | null>; onBack: () => void; onSave: (d: CompanyData) => void; data: CompanyData
}) {
  const [name,     setName]     = useState(data.name)
  const [idNum,    setIdNum]    = useState(data.idNumber)
  const [street,   setStreet]   = useState(data.street)
  const [number,   setNumber]   = useState(data.number)
  const [city,     setCity]     = useState(data.city)
  const [postcode, setPostcode] = useState(data.postcode)

  return (
    <motion.div ref={scrollRef} {...SWAP_ANIM} style={{ width: '100%', scrollMarginTop: 48 }}>
      <AiBubble>
        <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
          Please change your company's details
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <EditField label="company name"        value={name}     onChange={setName} autoFocus />
          <EditField label="Identification number" value={idNum}  onChange={setIdNum} />

          <div style={{ display: 'flex', gap: 8 }}>
            <EditField label="Street"  value={street}  onChange={setStreet} />
            <EditField label="Number"  value={number}  onChange={setNumber}  flex="0 0 113px" />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <EditField label="City"      value={city}     onChange={setCity}     flex="0 0 242px" />
            <EditField label="Post code" value={postcode} onChange={setPostcode} />
          </div>

          <EditField label="Country" value="Belgium" disabled />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onBack}
            style={{ backgroundColor: '#e6ebeb', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', whiteSpace: 'nowrap' }}>
            Cancel
          </button>
          <button type="button" onClick={() => onSave({ name, idNumber: idNum, street, number, city, postcode, sameShipping: data.sameShipping })}
            style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', whiteSpace: 'nowrap' }}>
            Save changes
          </button>
        </div>
      </AiBubble>
    </motion.div>
  )
}

// ─── Step 2 — Summary ────────────────────────────────────────────────────────

const Sm: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px' }

const PAY_WHEN_OPTIONS = [
  { id: 'now',   label: 'Pay now',   desc: 'Verify your identity later' },
  { id: 'later', label: 'Pay later', desc: 'Verify your identity now' },
]

const CARD_LOGOS = [
  { src: '/images/payment/visa.png',       alt: 'Visa',       bg: 'white' },
  { src: '/images/payment/mastercard.png', alt: 'Mastercard', bg: 'white' },
  { src: '/images/payment/maestro.png',    alt: 'Maestro',    bg: 'white' },
  { src: '/images/payment/amex.png',       alt: 'Amex',       bg: 'white' },
  { src: '/images/payment/bancontact.png', alt: 'Bancontact', bg: 'white' },
  { src: '/images/payment/jcb.png',        alt: 'JCB',        bg: 'white' },
  { src: '/images/payment/discover.png',   alt: 'Discover',   bg: 'white' },
  { src: '/images/payment/unionpay.png',   alt: 'UnionPay',   bg: 'white' },
  { src: '/images/payment/diners.png',     alt: 'Diners',     bg: 'white' },
]

const PAY_TABS = [
  { id: 'card',      content: <img src="/images/payment/card.png"      alt="Card"       style={{ width: 20, height: 20, objectFit: 'contain' }} /> },
  { id: 'applepay',  content: <img src="/images/payment/applepay.png"  alt="Apple Pay"  style={{ height: 18, objectFit: 'contain' }} /> },
  { id: 'googlepay', content: <img src="/images/payment/googlepay.png" alt="Google Pay" style={{ height: 18, objectFit: 'contain' }} /> },
  { id: 'paypal',    content: <img src="/images/payment/paypal.png"    alt="PayPal"     style={{ height: 16, objectFit: 'contain' }} /> },
]

function SummaryBubble({ scrollRef, data, account, orderItems, onPayment, onEditCompany }: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  data: CompanyData
  account: AccountForm
  orderItems: OrderItem[]
  onPayment: (label: string) => void
  onEditCompany: () => void
}) {
  const [payWhen,   setPayWhen]   = useState<string>('now')
  const [payMethod, setPayMethod] = useState<string>('card')
  const [cardNumber,  setCardNumber]  = useState('')
  const [cardHolder,  setCardHolder]  = useState('')
  const [expiry,      setExpiry]      = useState('')
  const [cvv,         setCvv]         = useState('')

  const firstName = account.firstName.charAt(0).toUpperCase() + account.firstName.slice(1)
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const vat      = Math.round(subtotal * 0.2 * 100) / 100
  const total    = subtotal + vat

  return (
    <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', scrollMarginTop: 48 }}>

      {/* User bubble — company name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: EASE, delay: 0.06 }}
      >
        <UserBubble onEdit={onEditCompany}>
          <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{data.name}</p>
        </UserBubble>
      </motion.div>

      {/* User bubble — shipping address */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: EASE, delay: 0.12 }}
      >
        <UserBubble onEdit={onEditCompany}>
          <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{data.street} {data.number}</p>
          <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{data.postcode} {data.city}</p>
          <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>Belgium</p>
        </UserBubble>
      </motion.div>

      {/* AI summary bubble */}
      <motion.div {...ENTER_DOWN} transition={{ ...ENTER_DOWN.transition, delay: 0.18 }} style={{ width: '100%' }}>
        <AiBubble>
          <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
            {firstName}, here's your order summary
          </h2>
          <p style={{ ...T, color: '#121621', margin: 0 }}>Please check everything is correct before making payment.</p>

          {/* Order items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {orderItems.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 96, height: 96, backgroundColor: '#f5f5f7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ ...T, color: '#121621', margin: 0 }}>{item.name}</p>
                    <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>{item.subtitle}</p>
                    {item.quantity > 1 && <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>Qty: {item.quantity}</p>}
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#1d1d1f', margin: 0, whiteSpace: 'nowrap' }}>€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}

            {/* Price breakdown */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Subtotal', `€${subtotal.toFixed(2)}`], ['VAT (20%)', `€${vat.toFixed(2)}`], ['Shipping', 'Free']].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>{label}</p>
                    <p style={{ ...Sm, color: '#1d1d1f', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#121621', margin: 0 }}>Total</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#121621', margin: 0 }}>€{total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* ── Payment ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 24 }}>
            <h3 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>Payment</h3>

            {/* When to pay — plain inline radios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ ...T, color: '#121621', margin: 0 }}>When would you like to pay?</p>
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                {PAY_WHEN_OPTIONS.map(opt => {
                  const sel = payWhen === opt.id
                  return (
                    <button key={opt.id} type="button" onClick={() => setPayWhen(opt.id)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0, backgroundColor: 'white', border: `1px solid ${sel ? '#277777' : '#e6ebeb'}`, borderRadius: 6, padding: '12px 16px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 9999, border: `1px solid ${sel ? '#277777' : '#859090'}`, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s', marginTop: 1 }}>
                        {sel && <div style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: '#277777' }} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', margin: 0 }}>{opt.label}</p>
                        {opt.desc && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#6b7676', margin: 0 }}>{opt.desc}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Select payment method — tabs */}
            <motion.div key="pay-method" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: EASE }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ ...T, color: '#121621', margin: 0 }}>Select payment method</p>
              <div style={{ display: 'flex', gap: 4, backgroundColor: '#f5f7f7', border: '1px solid #e6ebeb', borderRadius: 8, padding: 4, width: '100%' }}>
                {PAY_TABS.map(tab => {
                  const active = payMethod === tab.id
                  return (
                    <button key={tab.id} type="button" onClick={() => setPayMethod(tab.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 12px', backgroundColor: 'white', border: `1px solid ${active ? '#277777' : '#e6ebeb'}`, borderRadius: 6, cursor: 'pointer', color: active ? '#121621' : '#6b7676', flex: 1, minWidth: 0 }}>
                      {tab.content}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Card details */}
            <AnimatePresence>
              {payMethod === 'card' && (
                <motion.div key="card-details" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: EASE }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* Accepted logos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0 }}>Accepted card payment methods</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {CARD_LOGOS.map(l => (
                        <div key={l.alt} style={{ width: 34, height: 24, backgroundColor: l.bg, border: l.bg === 'white' ? '1px solid #e6ebeb' : 'none', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={l.src} alt={l.alt} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card inputs — Figma style: label above, icon inside */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', boxSizing: 'border-box' }}>
                    {/* Card number */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Card number</label>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '12px 12px', gap: 8 }}>
                        <input value={cardNumber} onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,16); setCardNumber(d.replace(/(.{4})/g,'$1 ').trim()) }} placeholder="1234 5678 9012 3456"
                          style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#6b7676' }} />
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#9ca4a6' }}><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth={1.5}/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
                      </div>
                    </div>
                    {/* Cardholder name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Cardholder name</label>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '12px 12px', gap: 8 }}>
                        <input value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Alex Carter"
                          style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#121621' }} />
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, cursor: 'pointer', color: '#9ca4a6' }} onClick={() => setCardHolder('')}><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
                      </div>
                    </div>
                    {/* Expiry + CVV */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Expiry date</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '8px 8px', gap: 8 }}>
                          <input value={expiry} onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,4); setExpiry(d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d) }} placeholder="DD/MM"
                            style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#6b7676' }} />
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#9ca4a6' }}><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.5}/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
                        </div>
                      </div>
                      <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>CVV</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '8px 8px', gap: 8 }}>
                          <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="123"
                            style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#6b7676' }} />
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#9ca4a6' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5}/><path d="M12 17v-1" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/><path d="M12 13.5a2 2 0 10-2-2" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setPayMethod('card'); setPayWhen('now') }}
                style={{ backgroundColor: '#e6ebeb', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', whiteSpace: 'nowrap' }}>
                Back
              </button>
              <button type="button" onClick={() => onPayment(PAY_TABS.find(t => t.id === payMethod)!.id)}
                style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 40, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', whiteSpace: 'nowrap' }}>
                Pay now
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
              {[
                { label: 'Free returns',             icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="#86868b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 105.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="#86868b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { label: 'Free shipping',             icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M16.5 9.4L7.55 4.24" stroke="#86868b" strokeWidth={1.5} strokeLinecap="round"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 001 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#86868b" strokeWidth={1.5}/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="#86868b" strokeWidth={1.5} strokeLinecap="round"/></svg> },
                { label: 'Secure encrypted payment',  icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#86868b" strokeWidth={1.5}/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#86868b" strokeWidth={1.5} strokeLinecap="round"/></svg> },
              ].map(({ label, icon }) => (
                <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {icon}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#86868b', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </AiBubble>
      </motion.div>
    </div>
  )
}

function CompactSummaryBubble({ data, orderItems }: { data: CompanyData; orderItems: OrderItem[] }) {
  const address = `${data.street} ${data.number}, ${data.postcode}, ${data.city}, Belgium`
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total    = subtotal + Math.round(subtotal * 0.2 * 100) / 100
  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: 16, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AiAvatar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {orderItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ ...Sm, color: '#121621', margin: 0 }}>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</p>
              <p style={{ ...Sm, color: '#121621', margin: 0 }}>€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', margin: 0 }}>Total</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', margin: 0 }}>€{total.toFixed(2)}</p>
        </div>
        <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>Ships to: {data.name}, {address}</p>
      </div>
    </div>
  )
}


function BankBubble({ scrollRef, onPay }: { scrollRef: React.RefObject<HTMLDivElement | null>; onPay: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(() => onPay(), 3000)
    return () => window.clearTimeout(id)
  }, [onPay])

  return (
    <motion.div ref={scrollRef} {...ENTER_DOWN} transition={{ ...ENTER_DOWN.transition, delay: 0.26 }} style={{ width: '100%', scrollMarginTop: 48 }}>
      <div style={{ padding: 12, width: '100%' }}>
        <div style={{ position: 'relative', backgroundColor: '#e6f0ef', borderRadius: '0 12px 12px 12px', padding: 32, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ position: 'absolute', top: -12, left: -12, width: 17, height: 17, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <svg width={10} height={10} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 1l2.2 6.4L18 10l-5.8 2.6L10 19l-2.2-6.4L2 10l5.8-2.6L10 1z" fill="white"/></svg>
          </div>

          <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0, textAlign: 'center' }}>
            Connecting to your bank
          </h2>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 358, maxWidth: '100%', height: 142, borderRadius: 20, backgroundColor: '#f5f7f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="3" stroke="#277777" strokeWidth={1.5}/>
                <path d="M2 9h20" stroke="#277777" strokeWidth={1.5}/>
                <rect x="5" y="13" width="4" height="2" rx="1" fill="#277777"/>
              </svg>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6b7676', margin: 0 }}>Secure bank verification</p>
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              style={{ width: 50, height: 50 }}
            >
              <svg width={50} height={50} viewBox="0 0 50 50" fill="none" aria-hidden="true">
                <circle cx={25} cy={25} r={20} stroke="#e6ebeb" strokeWidth={5}/>
                <path d="M25 5a20 20 0 0120 20" stroke="#277777" strokeWidth={5} strokeLinecap="round"/>
              </svg>
            </motion.div>

            <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'center' }}>
              This may take up to ten seconds
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Success view ─────────────────────────────────────────────────────────────


function SuccessView({ onContinue, data }: { onContinue: () => void; data: CompanyData }) {
  const orderNumber = '#WL123547'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ width: '100%', maxWidth: 600 }}
    >
      <div style={{ padding: 12, width: '100%' }}>
        <div style={{ position: 'relative', backgroundColor: '#e6f0ef', borderRadius: '0 12px 12px 12px', padding: 32, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ position: 'absolute', top: -12, left: -12, width: 17, height: 17, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <svg width={10} height={10} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 1l2.2 6.4L18 10l-5.8 2.6L10 19l-2.2-6.4L2 10l5.8-2.6L10 1z" fill="white"/></svg>
          </div>

          <h1 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
            Thank you for your purchase
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <svg width={54} height={39} viewBox="0 0 56 40" fill="#277777" aria-hidden="true" style={{ flexShrink: 0 }}>
              {/* Speed lines */}
              <rect x="0" y="10" width="12" height="3" rx="1.5"/>
              <rect x="0" y="18" width="9" height="3" rx="1.5"/>
              <rect x="0" y="26" width="11" height="3" rx="1.5"/>
              {/* Cargo box */}
              <rect x="14" y="4" width="22" height="24" rx="2"/>
              {/* Cab */}
              <path d="M36 12h8l4 6v10H36V12z" />
              {/* Windscreen cutout */}
              <rect x="37" y="14" width="8" height="6" rx="1" fill="white"/>
              {/* Undercarriage */}
              <rect x="14" y="28" width="34" height="4" rx="0"/>
              {/* Rear wheel */}
              <circle cx="22" cy="34" r="6" fill="#277777"/>
              <circle cx="22" cy="34" r="3" fill="white"/>
              {/* Front wheel */}
              <circle cx="43" cy="34" r="6" fill="#277777"/>
              <circle cx="43" cy="34" r="3" fill="white"/>
            </svg>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: '24px', color: '#121621', margin: 0 }}>
              Order number <span style={{ fontWeight: 700 }}>{orderNumber}</span>
            </p>
          </div>

          <div>
            <p style={{ ...T, color: '#121621', margin: 0 }}>
              Your order will be shipped to:
              <br />
              {data.name}
            </p>
            <p style={{ ...T, color: '#121621', margin: 0 }}>{data.street} {data.number}</p>
            <p style={{ ...T, color: '#121621', margin: 0 }}>{data.postcode}</p>
            <p style={{ ...T, color: '#121621', margin: 0 }}>{data.city}</p>
            <p style={{ ...T, color: '#121621', margin: 0 }}>Belgium</p>
          </div>

          <p style={{ ...T, color: '#121621', margin: 0 }}>
            In the meantime you can track your order from your Launchpad and complete your Worldline account activation.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onContinue}
              style={{
                minWidth: 44,
                minHeight: 44,
                backgroundColor: '#277777',
                border: '1px solid #277777',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '18px',
                color: 'white',
                boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Checkout() {
  const [orderItems] = useState<OrderItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('basketOrder') || '[]') } catch { return [] }
  })
  const [phase, setPhase]             = useState<Phase>('form')
  const [currentStep, setCurrentStep] = useState(1)
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [quitOpen,   setQuitOpen]     = useState(false)
  const [accountData, setAccountData]   = useState<AccountForm | null>(null)
  const [companyQuery, setCompanyQuery] = useState('')
  const [companyData, setCompanyData]       = useState<CompanyData>(DEFAULT_COMPANY)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const maxScrollTop        = useRef<number>(0)
  const passwordRef = useRef<HTMLDivElement>(null)
  const companyRef  = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)
  const editRef     = useRef<HTMLDivElement>(null)
  const summaryRef  = useRef<HTMLDivElement>(null)
  const paymentRef  = useRef<HTMLDivElement>(null)
  const successRef  = useRef<HTMLDivElement>(null)

  // Scroll new bubble to top and record that position as the scroll ceiling
  useEffect(() => {
    const map: Partial<Record<Phase, React.RefObject<HTMLDivElement | null>>> = {
      password: passwordRef,
      company:  companyRef,
      selected: selectedRef,
      edit:     editRef,
      summary:  summaryRef,
      payment:  paymentRef,
      success:  successRef,
    }
    const ref = map[phase]
    if (!ref?.current || !scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const element   = ref.current

    const id = requestAnimationFrame(() => {
      setTimeout(() => {
        const containerTop = container.getBoundingClientRect().top
        const elementTop   = element.getBoundingClientRect().top
        const scrollTarget = Math.max(0, container.scrollTop + (elementTop - containerTop) - 48)
        maxScrollTop.current = (phase === 'summary' || phase === 'payment' || phase === 'success') ? container.scrollHeight : scrollTarget
        scrollTo(container, scrollTarget)
      }, 180)
    })
    return () => cancelAnimationFrame(id)
  }, [phase])

  // Clamp: prevent scrolling below the latest bubble
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => {
      if (el.scrollTop > maxScrollTop.current) {
        el.scrollTop = maxScrollTop.current
      }
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function handleFormContinue(data: AccountForm) {
    setAccountData(data)
    setPhase('verification')
    localStorage.setItem('user_firstName', data.firstName)
    localStorage.setItem('user_lastName', data.lastName)
  }

  function handleEmailClick() {
    setPhase('password')
  }

  function handlePasswordContinue() {
    setCurrentStep(2)
    setPhase('company')
  }

  // Phase ordering — drives cumulative rendering
  const phaseIdx = CHECKOUT_PHASE_ORDER.indexOf(phase)
  const is   = (p: Phase) => phase === p
  const past = (p: Phase) => CHECKOUT_PHASE_ORDER.indexOf(p) < phaseIdx

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
        <Toolbar
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={() => setQuitOpen(true)}
          onStepperClick={() => setDrawerOpen(true)}
        />
        <div ref={scrollContainerRef} style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: 600, overflowY: 'auto', overflowAnchor: 'none', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 48, paddingTop: 48, paddingBottom: 'calc(100vh - 104px)' }}>

          {/* Step 1 form — only shown before submission */}
          {is('form') && (
            <Step1Form onContinue={handleFormContinue} />
          )}

          {/* Verification — full while active, collapses to compact once past */}
          <AnimatePresence mode="popLayout">
            {is('verification') && accountData && (
              <motion.div key="verification-full" exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } }}>
                <VerificationBubble
                  data={accountData}
                  onEmailClick={handleEmailClick}
                  onEditName={() => { setAccountData(null); setPhase('form') }}
                />
              </motion.div>
            )}
            {past('verification') && accountData && (
              <motion.div key="verification-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <UserBubble>
                    <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>
                      {accountData.firstName} {accountData.lastName}
                    </p>
                    <p style={{ ...T, color: '#525d5d', margin: 0, textAlign: 'right' }}>
                      {accountData.email}
                    </p>
                  </UserBubble>
                  <CompactAiBubble text="Verify your email" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password — full while active, collapses to compact once past */}
          <AnimatePresence mode="popLayout">
            {is('password') && (
              <motion.div key="password-full" exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } }}>
                <PasswordBubble
                  scrollRef={passwordRef}
                  onContinue={handlePasswordContinue}
                  done={false}
                />
              </motion.div>
            )}
            {past('password') && (
              <motion.div key="password-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                <CompactAiBubble text="Your account is set up" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Company lookup → results → detail → edit */}
          <AnimatePresence mode="wait">
            {(is('company') || is('results')) && (
              <CompanyLookupBubble
                key="company-lookup"
                scrollRef={companyRef}
                initialQuery={companyQuery}
                onQueryChange={is('company') ? setCompanyQuery : undefined}
                onFind={is('company') ? () => setPhase('results') : undefined}
                onEditSearch={() => setPhase('company')}
                showResults={is('results')}
                onEdit={() => setPhase('edit')}
                onConfirm={() => setPhase('selected')}
              />
            )}
            {is('selected') && (
              <CompanyDetailBubble
                key="selected"
                scrollRef={selectedRef}
                data={companyData}
                onBack={() => setPhase('results')}
                onEdit={() => setPhase('edit')}
                onConfirm={() => setPhase('summary')}
              />
            )}
            {is('edit') && (
              <CompanyEditBubble
                key="edit"
                scrollRef={editRef}
                data={companyData}
                onBack={() => setPhase('selected')}
                onSave={d => { setCompanyData(d); setPhase('selected') }}
              />
            )}
          </AnimatePresence>

          {/* Summary — full while active, collapses to compact once payment is selected */}
          <AnimatePresence mode="popLayout">
            {is('summary') && accountData && (
              <motion.div key="summary-full" exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } }}>
                <SummaryBubble
                  scrollRef={summaryRef}
                  data={companyData}
                  account={accountData}
                  orderItems={orderItems}
                  onPayment={(label) => { setSelectedPayment(label); setPhase('payment') }}
                  onEditCompany={() => setPhase('selected')}
                />
              </motion.div>
            )}
            {past('summary') && accountData && (
              <motion.div key="summary-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <UserBubble>
                    <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{companyData.name}</p>
                  </UserBubble>
                  <UserBubble>
                    <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{companyData.street} {companyData.number}</p>
                    <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{companyData.postcode} {companyData.city}</p>
                    <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>Belgium</p>
                  </UserBubble>
                  <CompactSummaryBubble data={companyData} orderItems={orderItems} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment — chosen method bubble + bank iframe */}
          {(is('payment') || past('payment')) && selectedPayment && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE, delay: 0.06 }}
            >
              <UserBubble>
                <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>Pay with {selectedPayment}</p>
              </UserBubble>
            </motion.div>
          )}
          {is('payment') && (
            <BankBubble scrollRef={paymentRef} onPay={() => { setCurrentStep(TOTAL_STEPS); setPhase('success') }} />
          )}

          {/* Success */}
          {is('success') && (
            <motion.div
              ref={successRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ width: '100%', scrollMarginTop: 48 }}
            >
              <SuccessView onContinue={() => navigate('/dashboard')} data={companyData} />
            </motion.div>
          )}

        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Checkout">
        <StepperContent currentStep={currentStep} steps={CHECKOUT_STEPS} />
      </Drawer>

      <Modal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title="Leave checkout?"
        cancelLabel="Stay"
        confirmLabel="Leave"
        onCancel={() => setQuitOpen(false)}
        onConfirm={() => navigate('/basket')}
      >
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#525d5d', margin: 0 }}>
          Your progress will be lost if you leave now. Are you sure you want to go back to your basket?
        </p>
      </Modal>

      <AiChatWidget />
    </>
  )
}
