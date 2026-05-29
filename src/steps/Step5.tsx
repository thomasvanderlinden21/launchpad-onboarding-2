import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AI_BG = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE = [0.22, 1, 0.36, 1] as const

type Phase = 'review' | 'submitted'

interface Step5Props {
  onComplete: () => void
}

const DOC_ICON_PAGE = 'https://www.figma.com/api/mcp/asset/f2244f07-c7f6-4d2d-88f5-675ae6e796aa'
const DOC_ICON_PDF = 'https://www.figma.com/api/mcp/asset/596201ef-dc74-4e61-81be-6bb56f455fa1'
const OPEN_ICON = 'https://www.figma.com/api/mcp/asset/03d04485-f818-41e5-825c-3beff40e3faf'
const CHECK_ICON = 'https://www.figma.com/api/mcp/asset/78e4e5c5-851c-4bdc-8516-fc689d0c3554'
const HOURGLASS_ICON = 'https://www.figma.com/api/mcp/asset/20b722d2-9c02-4a3a-92f4-72721b6f4365'

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
    <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
      <img src={DOC_ICON_PAGE} alt="" aria-hidden="true" style={{ position: 'absolute', left: '17.5%', top: 0, width: '80%', height: '100%' }} />
      <div style={{ position: 'absolute', left: '2.5%', top: '45%', width: '65%', height: '40%', backgroundColor: '#277777', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
        <img src={DOC_ICON_PDF} alt="" aria-hidden="true" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
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
      <img src={OPEN_ICON} alt="" aria-hidden="true" style={{ width: 18, height: 18, flexShrink: 0 }} />
    </button>
  )
}

function PrimaryBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 40,
        backgroundColor: '#277777',
        border: '1px solid #277777',
        borderRadius: 4,
        padding: '8px 10px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
        color: '#ffffff',
        boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
      }}
    >
      {label}
    </button>
  )
}

export function Step5({ onComplete }: Step5Props) {
  const [phase, setPhase] = useState<Phase>('review')

  return (
    <div style={{ width: '100%', paddingBottom: 32 }}>
      <AnimatePresence mode="wait">
        {phase === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <UserBubble text="Bank account connected" />
            <AiBubble>
              <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>
                Take a moment to review the below documents
              </h2>

              <div style={{ width: '100%' }}>
                {DOCUMENTS.map((doc, i) => (
                  <DocumentTile key={doc} label={doc} isFirst={i === 0} isLast={i === DOCUMENTS.length - 1} />
                ))}
              </div>

              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <img src={CHECK_ICON} alt="" aria-hidden="true" style={{ width: 12, height: 12 }} />
                </div>
                <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d' }}>
                  I confirm that I have reviewed all documents, agree to all the contractual terms, and confirm that the beneficial owner(s) information provided are true, accurate and complete.
                </p>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="I agree, submit now" onClick={() => setPhase('submitted')} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'submitted' && (
          <motion.div key="submitted" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <UserBubble text="Documents reviewed and submitted" />
            <AiBubble>
              <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0, width: '100%', textAlign: 'center' }}>
                Thank you Alex!
              </h2>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <img src={HOURGLASS_ICON} alt="" aria-hidden="true" style={{ width: 76, height: 76 }} />
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