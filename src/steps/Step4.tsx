import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AI_BG = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE = [0.22, 1, 0.36, 1] as const
const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

type Phase = 'bank-login' | 'authorize' | 'connecting' | 'success'

interface Step4Props {
  onComplete: () => void
}

// Exact references from the four requested Figma nodes:
// 40008477:46505, 40008477:46718, 40008477:46965, 40008477:47230
const SCREEN_LOGIN = 'https://www.figma.com/api/mcp/asset/2d9e22b1-6844-4098-bcb5-8971324245b8'
const SCREEN_AUTHORIZE = 'https://www.figma.com/api/mcp/asset/b700ad1c-178c-4b87-acb1-dcdc559c3f9a'
const SCREEN_CONNECTING = 'https://www.figma.com/api/mcp/asset/a89679af-9985-4dff-a598-df970b124a34'
const SCREEN_SUCCESS = 'https://www.figma.com/api/mcp/asset/b265cb04-33ab-458f-bf3e-2c016aa14f47'

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
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: 24, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{text}</p>
      </div>
    </div>
  )
}

function AiTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>{children}</h2>
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
        color: 'white',
        boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}

function ScreenImage({ src, alt, height }: { src: string; alt: string; height: number }) {
  return (
    <div style={{ width: 493, maxWidth: '100%', backgroundColor: 'white', border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
      <img src={src} alt={alt} style={{ width: '100%', height, display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
    </div>
  )
}

export function Step4({ onComplete }: Step4Props) {
  const [phase, setPhase] = useState<Phase>('bank-login')

  useEffect(() => {
    if (phase !== 'connecting') return
    const id = window.setTimeout(() => setPhase('success'), 1400)
    return () => window.clearTimeout(id)
  }, [phase])

  return (
    <div style={{ width: '100%', paddingBottom: 32 }}>
      <AnimatePresence mode="wait">
        {phase === 'bank-login' && (
          <motion.div key="bank-login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <UserBubble text="ING Bank selected" />
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <ScreenImage src={SCREEN_LOGIN} alt="Bank login screen" height={790} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="Continue" onClick={() => setPhase('authorize')} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'authorize' && (
          <motion.div key="authorize" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <UserBubble text="ING Bank selected" />
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <ScreenImage src={SCREEN_AUTHORIZE} alt="Authorization screen" height={790} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setPhase('bank-login')} style={{ minHeight: 40, border: '1px solid #b4b7bc', backgroundColor: '#e6ebeb', borderRadius: 4, padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621', cursor: 'pointer' }}>Decline</button>
                <button type="button" onClick={() => setPhase('connecting')} style={{ minHeight: 40, border: '1px solid #ff5400', backgroundColor: '#ff5400', borderRadius: 4, padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#ffffff', cursor: 'pointer', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)' }}>Authorize</button>
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'connecting' && (
          <motion.div key="connecting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <UserBubble text="ING Bank selected" />
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <ScreenImage src={SCREEN_CONNECTING} alt="Connecting screen" height={579} />
            </AiBubble>
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <UserBubble text="ING Bank selected" />
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <ScreenImage src={SCREEN_SUCCESS} alt="Success screen" height={579} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onComplete}
                  style={{ minHeight: 40, border: '1px solid #ff5400', backgroundColor: '#ff5400', borderRadius: 4, padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#ffffff', cursor: 'pointer', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)' }}
                >
                  Continue
                </button>
              </div>
            </AiBubble>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
