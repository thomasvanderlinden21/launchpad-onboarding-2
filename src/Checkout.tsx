import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Drawer } from './Drawer'
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

const EXIT_UP: object = {
  opacity: 0, y: -20,
  transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
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
      {/* Edit button — fades in on hover, sits left of the bubble */}
      <motion.button
        type="button"
        onClick={onEdit}
        animate={{ opacity: hovered && onEdit ? 1 : 0, scale: hovered && onEdit ? 1 : 0.85 }}
        transition={{ duration: 0.15 }}
        aria-label="Edit this answer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9999, backgroundColor: '#e6f0ef', border: '1px solid #c8ddd9', color: '#277777', cursor: 'pointer', flexShrink: 0, pointerEvents: hovered && onEdit ? 'auto' : 'none' }}
      >
        <EditIcon />
      </motion.button>

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

function CompanyLookupBubble({ scrollRef, initialQuery = '', onQueryChange, onFind, onEditSearch, showResults, data, onEdit, onConfirm }: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  initialQuery?: string; onQueryChange?: (q: string) => void; onFind?: () => void; onEditSearch?: () => void
  showResults: boolean; data: CompanyData; onEdit: () => void; onConfirm: () => void
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
            <button type="button" onClick={onFind} disabled={!canSearch} aria-label="find my company"
              style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', minHeight: 44, cursor: canSearch ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', opacity: canSearch ? 1 : 0.5, whiteSpace: 'nowrap' }}>
              find my company
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

const imgLowCostDevice = 'https://www.figma.com/api/mcp/asset/2287ea97-d32a-40c3-8324-f7abaf67e802'
const imgLowCostDock   = 'https://www.figma.com/api/mcp/asset/ac0e58d4-bc83-43bc-9865-2f7c83249520'
const Sm: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px' }

const PAY_WHEN_OPTIONS = [
  { id: 'now',   label: 'Pay now',   desc: 'Verify your identity later' },
  { id: 'later', label: 'Pay later', desc: 'Verify your identity now' },
]

// Figma payment asset URLs
const imgApplePayLogo  = 'https://www.figma.com/api/mcp/asset/b9331e7a-8c06-4af6-8090-96c7756babf9'
const imgGPayText      = 'https://www.figma.com/api/mcp/asset/5b7f35ca-26d7-4df0-87f2-dfbe636f3e93'
const imgGPayG         = 'https://www.figma.com/api/mcp/asset/d6cb3233-1006-4488-8475-4b2f9bb1d554'
const imgPayPalLogo    = 'https://www.figma.com/api/mcp/asset/b4dd9af2-d7b2-45fb-b149-eeed7689dd36'
const imgLockIcon      = 'https://www.figma.com/api/mcp/asset/0498cc2e-a3ef-4bc0-aaf4-c77ed952573f'
const imgCloseIcon     = 'https://www.figma.com/api/mcp/asset/03a408b4-57b4-4368-a466-eb6c82e638ba'
const imgCalendarIcon  = 'https://www.figma.com/api/mcp/asset/76dee00b-ef13-4d80-b129-c6dcac83bea8'
const imgHelpCircle    = 'https://www.figma.com/api/mcp/asset/62a16288-8093-4009-9303-1b13e0eeda45'
const imgRefreshCwIcon = 'https://www.figma.com/api/mcp/asset/2cbf883d-deac-4e52-bd36-05bfe351122d'
const imgPackageIcon   = 'https://www.figma.com/api/mcp/asset/4e4f9983-8c37-41b2-8110-c35d8780fee4'
const imgLockBadge     = 'https://www.figma.com/api/mcp/asset/4f9d644e-1640-4e6d-a29b-f6f068d41d67'

const CARD_LOGOS = [
  { src: 'https://www.figma.com/api/mcp/asset/f004da1c-0142-4434-97ff-58101fb9d202', alt: 'Visa',       bg: 'white' },
  { src: 'https://www.figma.com/api/mcp/asset/2fb429da-9fbe-4f0a-808f-16c438d7d1a4', alt: 'Mastercard', bg: 'white' },
  { src: 'https://www.figma.com/api/mcp/asset/f157eae9-8818-4c7e-9f2a-6466c774b04e', alt: 'Maestro',    bg: 'white' },
  { src: 'https://www.figma.com/api/mcp/asset/16373b5d-2aeb-4e01-b5e2-2e550564ce48', alt: 'Amex',       bg: '#1f72cd' },
  { src: 'https://www.figma.com/api/mcp/asset/6c2d0aa3-0d23-4948-abb3-418da53e5ee7', alt: 'Bancontact', bg: 'white' },
  { src: 'https://www.figma.com/api/mcp/asset/a213937d-fbf0-4eeb-be77-137684b7985d', alt: 'JCB',        bg: 'white' },
  { src: 'https://www.figma.com/api/mcp/asset/c9b1d6b7-95b1-41f1-a586-561e9a7e586f', alt: 'Discover',   bg: 'white' },
  { src: 'https://www.figma.com/api/mcp/asset/6c178ba2-dec5-4e05-afff-446489c1cfb1', alt: 'UnionPay',   bg: 'white' },
  { src: 'https://www.figma.com/api/mcp/asset/6e809dfc-5fc1-4f14-b221-b664c6756aed', alt: 'Diners',     bg: 'white' },
]

const PAY_TABS = [
  { id: 'card',      content: (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth={1.5}/><path d="M2 10h20" stroke="currentColor" strokeWidth={1.5}/></svg>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px' }}>Card</span>
    </div>
  )},
  { id: 'applepay',  content: <div style={{ position: 'relative', width: 40, height: 24 }}><img src={imgApplePayLogo} alt="Apple Pay" style={{ position: 'absolute', inset: '20% 10% 24% 10%', width: '80%', height: '56%', objectFit: 'contain' }} /></div> },
  { id: 'googlepay', content: (
    <div style={{ position: 'relative', width: 40, height: 24 }}>
      <img src={imgGPayG}    alt="" style={{ position: 'absolute', top: '25%', left: '10%', width: '35%', height: '50%', objectFit: 'contain' }} />
      <img src={imgGPayText} alt="Google Pay" style={{ position: 'absolute', top: '28%', left: '44%', right: '10%', height: '44%', objectFit: 'contain' }} />
    </div>
  )},
  { id: 'paypal',    content: <div style={{ position: 'relative', width: 40, height: 24 }}><img src={imgPayPalLogo} alt="PayPal" style={{ position: 'absolute', inset: '29% 10% 26% 10%', width: '80%', height: '45%', objectFit: 'contain' }} /></div> },
]

function SummaryBubble({ scrollRef, data, account, onPayment, onEditCompany }: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  data: CompanyData
  account: AccountForm
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
  const address = `${data.street} ${data.number}, ${data.postcode}, ${data.city}, Belgium`

  return (
    <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', scrollMarginTop: 48 }}>

      {/* User bubble — company name confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: EASE, delay: 0.06 }}
      >
        <UserBubble onEdit={onEditCompany}>
          <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{data.name}</p>
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

            {/* Product 1 */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ width: 96, height: 107, backgroundColor: '#f5f5f7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                <img src={imgLowCostDevice} alt="Link 2500" style={{ width: 91, height: 101, objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ ...T, color: '#121621', margin: 0 }}>Link 2500</p>
                  <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>Hand held terminal</p>
                  <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>Connectivity: Bluetooth + WiFi</p>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#1d1d1f', margin: 0, whiteSpace: 'nowrap' }}>€89</p>
              </div>
            </div>

            {/* Product 2 */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ width: 96, height: 107, backgroundColor: '#f5f5f7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                <img src={imgLowCostDock} alt="Charging station" style={{ width: 86, height: 68, objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ ...T, color: '#121621', margin: 0 }}>Charging station</p>
                  <p style={{ ...Sm, color: '#6b7676', margin: 0 }}>Bundle offer</p>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#1d1d1f', margin: 0, whiteSpace: 'nowrap' }}>€26</p>
              </div>
            </div>

            {/* Ship to */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', margin: 0 }}>Ship to:</p>
                <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>{data.name}</p>
                <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>{address}</p>
              </div>
              <button type="button" style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>Edit</button>
            </div>

            {/* Price breakdown */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Subtotal', '€92'], ['VAT (20%)', '€23'], ['Shipping', 'Free']].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>{label}</p>
                    <p style={{ ...Sm, color: '#1d1d1f', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#121621', margin: 0 }}>Total</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, lineHeight: '24px', color: '#121621', margin: 0 }}>€115</p>
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
                        <img src={imgLockIcon} alt="" style={{ width: 20, height: 20, flexShrink: 0, objectFit: 'contain' }} />
                      </div>
                    </div>
                    {/* Cardholder name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Cardholder name</label>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '12px 12px', gap: 8 }}>
                        <input value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Alex Carter"
                          style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#121621' }} />
                        <img src={imgCloseIcon} alt="" style={{ width: 16, height: 16, flexShrink: 0, objectFit: 'contain', cursor: 'pointer' }} onClick={() => setCardHolder('')} />
                      </div>
                    </div>
                    {/* Expiry + CVV */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Expiry date</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '8px 8px', gap: 8 }}>
                          <input value={expiry} onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,4); setExpiry(d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d) }} placeholder="DD/MM"
                            style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#6b7676' }} />
                          <img src={imgCalendarIcon} alt="" style={{ width: 20, height: 20, flexShrink: 0, objectFit: 'contain' }} />
                        </div>
                      </div>
                      <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>CVV</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: '8px 8px', gap: 8 }}>
                          <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="123"
                            style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#6b7676' }} />
                          <img src={imgHelpCircle} alt="" style={{ width: 20, height: 20, flexShrink: 0, objectFit: 'contain' }} />
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

            {/* Trust badges — Figma icons */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
              {[
                { src: imgRefreshCwIcon, label: 'Free returns' },
                { src: imgPackageIcon,   label: 'Free shipping' },
                { src: imgLockBadge,     label: 'Secure encrypted payment' },
              ].map(({ src, label }) => (
                <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <img src={src} alt="" style={{ width: 14, height: 14, flexShrink: 0 }} />
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

function CompactSummaryBubble({ data, account }: { data: CompanyData; account: AccountForm }) {
  const address = `${data.street} ${data.number}, ${data.postcode}, ${data.city}, Belgium`
  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: 16, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AiAvatar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['Link 2500', '€89'], ['Charging station', '€26']].map(([name, price]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ ...Sm, color: '#121621', margin: 0 }}>{name}</p>
              <p style={{ ...Sm, color: '#121621', margin: 0 }}>{price}</p>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', margin: 0 }}>Total</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', margin: 0 }}>€115</p>
        </div>
        <p style={{ ...Sm, color: '#525d5d', margin: 0 }}>Ships to: {data.name}, {address}</p>
      </div>
    </div>
  )
}

const imgBankIdCheck = 'https://www.figma.com/api/mcp/asset/e380b8ac-e499-459f-a0f6-ca1a9cd7be42'
const imgBankAiAvatar = 'https://www.figma.com/api/mcp/asset/88e15c4d-76c5-4514-bdf6-5aab6b139a35'
const imgBankLoadingIcon = 'https://www.figma.com/api/mcp/asset/e17602a5-4961-425d-a80b-f2a39696e396'

function BankBubble({ scrollRef, onPay }: { scrollRef: React.RefObject<HTMLDivElement | null>; onPay: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(() => onPay(), 3000)
    return () => window.clearTimeout(id)
  }, [onPay])

  return (
    <motion.div ref={scrollRef} {...ENTER_DOWN} transition={{ ...ENTER_DOWN.transition, delay: 0.26 }} style={{ width: '100%', scrollMarginTop: 48 }}>
      <div style={{ padding: 12, width: '100%' }}>
        <div style={{ position: 'relative', backgroundColor: '#e6f0ef', borderRadius: '0 12px 12px 12px', padding: 32, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <img src={imgBankAiAvatar} alt="" aria-hidden="true" style={{ position: 'absolute', top: -12, left: -12, width: 17, height: 17 }} />

          <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0, textAlign: 'center' }}>
            Connecting to your bank
          </h2>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 358, maxWidth: '100%', height: 142, borderRadius: 20, overflow: 'hidden', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={imgBankIdCheck} alt="Mastercard ID Check" style={{ width: '99.81%', height: '141.55%', objectFit: 'cover', objectPosition: 'center 22%' }} />
            </div>

            <motion.img
              src={imgBankLoadingIcon}
              alt=""
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              style={{ width: 50, height: 50 }}
            />

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

const imgSuccessOrderVector = 'https://www.figma.com/api/mcp/asset/52a89be8-f46d-475e-be02-83c334010b07'
const imgSuccessAiAvatar = 'https://www.figma.com/api/mcp/asset/a60ecada-8684-4b55-9f63-9f61507a5b8b'

function SuccessView({ onContinue, data }: { onContinue: () => void; data: CompanyData }) {
  const orderNumber = '#WL123547'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ flex: 1, width: '100%', maxWidth: 600, paddingTop: 48, paddingBottom: 32 }}
    >
      <div style={{ padding: 12, width: '100%' }}>
        <div style={{ position: 'relative', backgroundColor: '#e6f0ef', borderRadius: '0 12px 12px 12px', padding: 32, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <img src={imgSuccessAiAvatar} alt="" aria-hidden="true" style={{ position: 'absolute', top: -12, left: -12, width: 17, height: 17 }} />

          <h1 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
            Thank you for your purchase
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <img src={imgSuccessOrderVector} alt="" aria-hidden="true" style={{ width: 54.194, height: 38.667, flexShrink: 0 }} />
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
  const [phase, setPhase]             = useState<Phase>('form')
  const [currentStep, setCurrentStep] = useState(1)
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [accountData, setAccountData]   = useState<AccountForm | null>(null)
  const [companyQuery, setCompanyQuery] = useState('')
  const [companyData, setCompanyData]       = useState<CompanyData>(DEFAULT_COMPANY)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const maxScrollTop        = useRef<number>(0)
  const passwordRef = useRef<HTMLDivElement>(null)
  const companyRef  = useRef<HTMLDivElement>(null)
  const resultsRef  = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)
  const editRef     = useRef<HTMLDivElement>(null)
  const summaryRef  = useRef<HTMLDivElement>(null)
  const paymentRef  = useRef<HTMLDivElement>(null)

  // Scroll new bubble to top and record that position as the scroll ceiling
  useEffect(() => {
    const map: Partial<Record<Phase, React.RefObject<HTMLDivElement | null>>> = {
      password: passwordRef,
      company:  companyRef,
      selected: selectedRef,
      edit:     editRef,
      summary:  summaryRef,
      payment:  paymentRef,
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
        maxScrollTop.current = (phase === 'summary' || phase === 'payment') ? container.scrollHeight : scrollTarget
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
  const PHASE_ORDER: Phase[] = ['form', 'verification', 'password', 'company', 'results', 'selected', 'edit', 'summary', 'payment', 'success']
  const phaseIdx = PHASE_ORDER.indexOf(phase)
  const from = (p: Phase) => PHASE_ORDER.indexOf(p) <= phaseIdx
  const is   = (p: Phase) => phase === p
  const past = (p: Phase) => PHASE_ORDER.indexOf(p) < phaseIdx
  const noRef = { current: null } as React.RefObject<HTMLDivElement | null>

  if (is('success')) {
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
          <Toolbar currentStep={TOTAL_STEPS} totalSteps={TOTAL_STEPS} onBack={() => navigate('/dashboard', { state: { back: true } })} />
          <SuccessView onContinue={() => navigate('/dashboard')} data={companyData} />
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
        <Toolbar
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={() => navigate('/dashboard', { state: { back: true } })}
          onStepperClick={() => setDrawerOpen(true)}
        />
        <div ref={scrollContainerRef} style={{ flex: 1, width: '100%', maxWidth: 600, overflowY: 'auto', overflowAnchor: 'none', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 48, paddingTop: 48, paddingBottom: 'calc(100vh - 104px)' }}>

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
                data={companyData}
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
                  onPayment={(label) => { setSelectedPayment(label); setPhase('payment') }}
                  onEditCompany={() => setPhase('selected')}
                />
              </motion.div>
            )}
            {past('summary') && accountData && (
              <motion.div key="summary-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                <CompactSummaryBubble data={companyData} account={accountData} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment — chosen method bubble + bank iframe */}
          {is('payment') && selectedPayment && (
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
            <BankBubble scrollRef={paymentRef} onPay={() => setPhase('success')} />
          )}

        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Checkout">
        <StepperContent currentStep={currentStep} steps={CHECKOUT_STEPS} />
      </Drawer>

      <AiChatWidget />
    </>
  )
}
