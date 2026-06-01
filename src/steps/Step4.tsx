import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AI_BG = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE = [0.22, 1, 0.36, 1] as const
const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

type Phase = 'select-bank' | 'bank-login' | 'authorize' | 'connecting' | 'success'

export interface Step4Data { bankName: string; bankLogo: string; accountLabel: string }
interface Step4Props {
  onComplete: (data: Step4Data) => void
}

const SCREEN_LOGIN     = '/images/connect-bank-01.png'
const SCREEN_AUTHORIZE = '/images/connect-bank-02.png'
const SCREEN_CONNECTING = '/images/connect-bank-03.png'
const SCREEN_SUCCESS   = '/images/connect-bank-04.png'

const BANKS = [
  { id: 'ing',            name: 'ING',            logo: '/images/ing.png' },
  { id: 'abn-amro',       name: 'ABN Amro',       logo: '/images/abn-amro.png' },
  { id: 'handelsbanken',  name: 'Handelsbanken',  logo: '/images/handelsbanken.png' },
  { id: 'revolut',        name: 'Revolut',        logo: '/images/revolut.png' },
  { id: 'triodos',        name: 'Triodos',        logo: '/images/triodos.png' },
  { id: 'yoursafe',       name: 'Yoursafe',       logo: '/images/yoursafe.png' },
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

function ScreenImage({ src, alt, height, onClick }: { src: string; alt: string; height: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ width: 493, maxWidth: '100%', backgroundColor: 'white', border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden', cursor: onClick ? 'pointer' : 'default' }}
    >
      <img src={src} alt={alt} style={{ width: '100%', height, display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
    </div>
  )
}

const ACCOUNTS = [
  { id: '8976', label: 'Account number ending in ...8976' },
  { id: '1292', label: 'Account number ending in ...1292' },
  { id: '0912', label: 'Account number ending in ...0912' },
]

function AuthorizeScreen({ bankLogo, onAuthorize, onDecline }: {
  bankLogo: string
  onAuthorize: (accountLabel: string) => void
  onDecline: () => void
}) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [termsChecked, setTermsChecked] = useState(false)
  const canAuthorize = selectedAccount !== null && termsChecked

  return (
    <div style={{ width: 493, maxWidth: '100%', backgroundColor: 'white', border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Bank header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e8' }}>
        <img src={bankLogo} alt="Bank" style={{ height: 32, objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#333" strokeWidth={1.5} strokeLinejoin="round" />
            </svg>
            Give feedback
          </span>
          <span style={{ fontSize: 12, color: '#333' }}>NL | <strong>EN</strong></span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: 0, lineHeight: '26px' }}>
          Worldline would like to access your account information
        </h2>

        {/* Worldline logo card */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20, border: '1px solid #e8e8e8', borderRadius: 8 }}>
          <img src="/images/worldline-logo.svg" alt="Worldline" style={{ height: 64, objectFit: 'contain' }} />
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: '20px' }}>
          To be transparent about how your data is shared. ING will your data with our trusted partner <strong>Plaid</strong>. Worldline will retrieve your data from Plaid.
        </p>

        {/* Account radio options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACCOUNTS.map(acc => (
            <button
              key={acc.id}
              type="button"
              onClick={() => setSelectedAccount(acc.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', textAlign: 'left',
                border: `1px solid ${selectedAccount === acc.id ? '#ff5400' : '#d9d9d9'}`,
                borderRadius: 4, background: 'white', cursor: 'pointer', width: '100%',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 9999, flexShrink: 0,
                border: `2px solid ${selectedAccount === acc.id ? '#ff5400' : '#aaa'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selectedAccount === acc.id && (
                  <span style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: '#ff5400' }} />
                )}
              </span>
              <span style={{ fontSize: 14, color: '#1a1a1a' }}>{acc.label}</span>
            </button>
          ))}
        </div>

        {/* Terms checkbox */}
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={e => setTermsChecked(e.target.checked)}
            style={{ marginTop: 2, cursor: 'pointer', flexShrink: 0, accentColor: '#ff5400' }}
          />
          <span style={{ fontSize: 12, color: '#333', lineHeight: '18px' }}>
            I confirm that I have reviewed and agree to the{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms and Conditions</span>.{' '}
            I am specifically directing ING to send my account information to Worldline via Plaid on my behalf whenever requested by Worldline. I understand that ING will continue to do this until access expires or I ask ING to stop.
          </span>
        </label>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={onDecline}
            style={{ padding: '10px 24px', border: '1px solid #d9d9d9', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => onAuthorize(ACCOUNTS.find(a => a.id === selectedAccount)?.label ?? '')}
            disabled={!canAuthorize}
            style={{ padding: '10px 24px', border: 'none', borderRadius: 4, background: canAuthorize ? '#ff5400' : '#ffb380', cursor: canAuthorize ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, color: 'white' }}
          >
            Authorize
          </button>
        </div>
      </div>
    </div>
  )
}

export function Step4({ onComplete }: Step4Props) {
  const [phase, setPhase] = useState<Phase>('select-bank')
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedAccountLabel, setSelectedAccountLabel] = useState('')

  useEffect(() => {
    if (phase !== 'connecting') return
    const id = window.setTimeout(() => setPhase('success'), 1400)
    return () => window.clearTimeout(id)
  }, [phase])

  const selectedBankName = BANKS.find(b => b.id === selectedBank)?.name ?? 'Bank'

  return (
    <div style={{ width: '100%', paddingBottom: 32 }}>
      <AnimatePresence mode="wait">

        {phase === 'select-bank' && (
          <motion.div key="select-bank" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <p style={{ ...T, color: '#121621', margin: 0 }}>Select your bank to connect your account and receive payouts.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {BANKS.map(bank => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => { setSelectedBank(bank.id); setPhase('bank-login') }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: 16,
                      backgroundColor: selectedBank === bank.id ? '#e6f0ef' : 'white',
                      border: `1px solid ${selectedBank === bank.id ? '#277777' : '#e6ebeb'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                  >
                    <img src={bank.logo} alt={bank.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#121621', textAlign: 'center' }}>{bank.name}</span>
                  </button>
                ))}
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'bank-login' && (
          <motion.div key="bank-login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <ScreenImage src={SCREEN_LOGIN} alt="Bank login screen" height={790} onClick={() => setPhase('authorize')} />
            </AiBubble>
          </motion.div>
        )}

        {phase === 'authorize' && (
          <motion.div key="authorize" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <AuthorizeScreen
                bankLogo={BANKS.find(b => b.id === selectedBank)?.logo ?? '/images/ing.png'}
                onAuthorize={(label) => { setSelectedAccountLabel(label); setPhase('connecting') }}
                onDecline={() => setPhase('bank-login')}
              />
            </AiBubble>
          </motion.div>
        )}

        {phase === 'connecting' && (
          <motion.div key="connecting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <ScreenImage src={SCREEN_CONNECTING} alt="Connecting screen" height={579} />
            </AiBubble>
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Connect your bank account</AiTitle>
              <ScreenImage src={SCREEN_SUCCESS} alt="Success screen" height={579} onClick={() => {
                const bank = BANKS.find(b => b.id === selectedBank)
                if (bank) onComplete({ bankName: bank.name, bankLogo: bank.logo, accountLabel: selectedAccountLabel })
              }} />
            </AiBubble>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
