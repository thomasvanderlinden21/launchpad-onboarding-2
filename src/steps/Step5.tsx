import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AI_BG = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE = [0.22, 1, 0.36, 1] as const

type Phase = 'review' | 'submitted'

interface Step5Props {
  onComplete: () => void
}


const DOCUMENTS = [
  'Contract agreement',
  'Identification of the beneficial owner',
  'Terms and conditions',
  'Privacy notice',
  'Processing terms',
]

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
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', margin: 0 }}>{question}</p>
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'relative', backgroundColor: USER_BG, borderRadius: '12px 0 12px 12px', padding: 12, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))' }}>
        <UserAvatar />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', margin: 0, textAlign: 'right' }}>{text}</p>
      </div>
    </div>
  )
}

function DocumentIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="8" y="2" width="17" height="22" rx="2" fill="#f5f7f7" stroke="#e6ebeb" strokeWidth="1.5"/>
      <path d="M19 2v6h6" stroke="#e6ebeb" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 13h10M11 17h10M11 21h6" stroke="#b4b7bc" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="3" y="18" width="13" height="8" rx="1.5" fill="#277777"/>
      <text x="9.5" y="24.5" textAnchor="middle" fill="white" fontSize="5" fontWeight="700" fontFamily="Inter,sans-serif">PDF</text>
    </svg>
  )
}

function DocumentTile({ label, isFirst, isLast }: { label: string; isFirst: boolean; isLast: boolean }) {
  return (
    <button
      type="button"
      style={{
        width: '100%',
        minHeight: 64,
        border: '1px solid #e6ebeb',
        borderTopLeftRadius: isFirst ? 8 : 0,
        borderTopRightRadius: isFirst ? 8 : 0,
        borderBottomLeftRadius: isLast ? 8 : 0,
        borderBottomRightRadius: isLast ? 8 : 0,
        marginTop: isFirst ? 0 : -1,
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <DocumentIcon />
      <span style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621' }}>{label}</span>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="15,3 21,3 21,9" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="10" y1="14" x2="21" y2="3" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round"/>
      </svg>
    </button>
  )
}

function PrimaryBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 40,
        backgroundColor: '#277777',
        border: '1px solid #277777',
        borderRadius: 4,
        padding: '8px 10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
        color: '#ffffff',
        boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}

export function Step5({ onComplete }: Step5Props) {
  const [phase, setPhase] = useState<Phase>('review')
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div style={{ width: '100%', paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Always visible: bank connected context */}
      <UserBubble text="Bank account connected" />

      {/* Review phase history (visible once submitted) */}
      {phase === 'submitted' && (
        <AiHistoryBubble question="Take a moment to review the below documents" />
      )}

      <AnimatePresence mode="wait">
        {phase === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
                Take a moment to review the below documents
              </h2>

              <div style={{ width: '100%' }}>
                {DOCUMENTS.map((doc, i) => (
                  <DocumentTile key={doc} label={doc} isFirst={i === 0} isLast={i === DOCUMENTS.length - 1} />
                ))}
              </div>

              <label style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <div
                  onClick={() => setConfirmed(v => !v)}
                  style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2, border: `1px solid ${confirmed ? '#277777' : '#b4b7bc'}`, backgroundColor: confirmed ? '#277777' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {confirmed && (
                    <svg width={10} height={10} viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d' }}>
                  I confirm that I have reviewed all documents, agree to all the contractual terms, and confirm that the beneficial owner(s) information provided are true, accurate and complete.
                </p>
              </label>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="I agree, submit now" onClick={() => setPhase('submitted')} disabled={!confirmed} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'submitted' && (
          <motion.div key="submitted" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UserBubble text="Documents reviewed and submitted" />
            <AiBubble>
              <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0, width: '100%', textAlign: 'center' }}>
                Thank you Alex!
              </h2>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <svg width={76} height={76} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 2h14M5 22h14" stroke="#277777" strokeWidth={1.5} strokeLinecap="round"/>
                  <path d="M6 2c0 4.5 2.5 7 6 9-3.5 2-6 4.5-6 9" stroke="#277777" strokeWidth={1.5} strokeLinecap="round"/>
                  <path d="M18 2c0 4.5-2.5 7-6 9 3.5 2 6 4.5 6 9" stroke="#277777" strokeWidth={1.5} strokeLinecap="round"/>
                  <path d="M9.5 18.5h5" stroke="#277777" strokeWidth={1.5} strokeLinecap="round"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621' }}>We're now completing the final checks to activate your account.</p>
                  <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621' }}>We'll be in touch as soon as everything is ready.</p>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="Continue to Launchpad" onClick={onComplete} />
              </div>
            </AiBubble>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}