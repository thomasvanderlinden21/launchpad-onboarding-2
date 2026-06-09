import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const AI_BG = '#e6f0ef'
const EASE = [0.22, 1, 0.36, 1] as const
const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

type Phase = 'select-bank' | 'bank-login' | 'authorize' | 'connecting' | 'success' | 'manual'

export interface Step4Data { bankName: string; bankLogo: string; accountLabel: string }
interface Step4Props {
  onComplete: (data: Step4Data) => void
  onBack?: () => void
}

const SCREEN_LOGIN     = '/images/connect-bank-01.png'
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

const USER_BG = '#dcf4fa'

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'relative', backgroundColor: USER_BG, borderRadius: '12px 0 12px 12px', padding: 12, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))' }}>
        <div style={{ position: 'absolute', top: -12, right: -9, width: 17, height: 17, borderRadius: 9999, backgroundColor: '#066076', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <circle cx={5} cy={3.5} r={2} fill="white" />
            <path d="M1 9c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth={1} strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{text}</p>
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

function AiTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>{children}</h2>
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

function AuthorizeScreen({ bankLogo, onAuthorize, onDecline, onBack }: {
  bankLogo: string
  onAuthorize: (accountLabel: string) => void
  onDecline: () => void
  onBack: () => void
}) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [termsChecked, setTermsChecked] = useState(false)
  const canAuthorize = selectedAccount !== null && termsChecked

  return (
    <div style={{ width: 493, maxWidth: '100%', backgroundColor: 'white', border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Bank header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Choose a different bank"
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#525d5d', fontSize: 13, fontWeight: 500 }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Change bank
          </button>
          <img src={bankLogo} alt="Bank" style={{ height: 32, objectFit: 'contain' }} />
        </div>
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

function ManualBankForm({ onBack, onSubmit }: { onBack: () => void; onSubmit: (label: string) => void }) {
  const [accountHolder, setAccountHolder] = useState('')
  const [iban, setIban]                   = useState('')
  const [bankName, setBankName]           = useState('')
  const canSubmit = accountHolder.trim() !== '' && iban.trim() !== '' && bankName.trim() !== ''

  return (
    <AiBubble>
      <AiTitle>Enter your bank details</AiTitle>
      <p style={{ ...T, color: '#121621', margin: 0 }}>
        Fill in your bank account details manually to receive payouts.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {([
          { label: 'Account holder name', value: accountHolder, onChange: setAccountHolder, placeholder: 'Alex Carter' },
          { label: 'IBAN',               value: iban,           onChange: (v: string) => setIban(v.toUpperCase()), placeholder: 'BE68 5390 0754 7034' },
          { label: 'Bank name',          value: bankName,       onChange: setBankName, placeholder: 'e.g. ING, BNP Paribas Fortis' },
        ] as const).map(field => (
          <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>{field.label}</label>
            <input
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              style={{ ...T, color: '#121621', backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, padding: 12, outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <button type="button" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#525d5d' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <button type="button" onClick={() => onSubmit(`${bankName} — ${iban}`)} disabled={!canSubmit}
          style={{ backgroundColor: canSubmit ? '#277777' : '#9ca4a6', border: 'none', borderRadius: 4, padding: '10px 20px', cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: 'white', boxShadow: canSubmit ? 'inset 0px -2px 0px rgba(0,0,0,0.16)' : 'none' }}>
          Connect account
        </button>
      </div>
    </AiBubble>
  )
}

export function Step4({ onComplete }: Step4Props) {
  const [phase, setPhase] = useState<Phase>('select-bank')
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [selectedAccountLabel, setSelectedAccountLabel] = useState('')
  const [bankSearch, setBankSearch] = useState('')
  const filteredBanks = bankSearch.trim()
    ? BANKS.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
    : BANKS

  useEffect(() => {
    if (phase !== 'connecting') return
    const id = window.setTimeout(() => setPhase('success'), 1400)
    return () => window.clearTimeout(id)
  }, [phase])

  const pastBankSelection = ['bank-login', 'authorize', 'connecting', 'success'].includes(phase)
  const selectedBankName = BANKS.find(b => b.id === selectedBank)?.name ?? ''

  return (
    <div style={{ width: '100%', paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {pastBankSelection && (
        <>
          <AiHistoryBubble question="Let's connect your bank account" />
          <UserBubble text={selectedBankName} />
        </>
      )}

      <AnimatePresence mode="wait">

        {phase === 'select-bank' && (
          <motion.div key="select-bank" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Let's connect your bank account</AiTitle>

              {/* Plaid subtitle */}
              <p style={{ ...T, color: '#121621', margin: 0 }}>
                Worldline uses{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Plaid</span>
                {' '}to connect your bank account
              </p>

              {/* Search + bank logos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Search field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>
                    Find your bank
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px', gap: 8 }}>
                    <input
                      value={bankSearch}
                      onChange={e => setBankSearch(e.target.value)}
                      placeholder="Search"
                      style={{ ...T, flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#6b7676', padding: 0 }}
                    />
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#525d5d' }}>
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={1.5} />
                      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Bank logos — horizontal row */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  {filteredBanks.map(bank => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      style={{
                        width: 74, height: 74, flexShrink: 0,
                        backgroundColor: 'white',
                        border: `1px solid ${selectedBank === bank.id ? '#277777' : '#e6ebeb'}`,
                        borderRadius: 8, cursor: 'pointer', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <img src={bank.logo} alt={bank.name} style={{ width: 54, height: 54, objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Add bank details manually — display only with + icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: '#121621', flexShrink: 0 }}>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621' }}>
                  Add bank details manually
                </span>
              </div>

              {/* Payout currency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>
                  Payout currency
                </label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px', gap: 8 }}>
                  <span style={{ ...T, flex: 1, color: '#121621' }}>Euro (€)</span>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: '#525d5d' }}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Continue + privacy */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => selectedBank && setPhase('bank-login')}
                    disabled={!selectedBank}
                    style={{ backgroundColor: selectedBank ? '#277777' : '#9ca4a6', border: `1px solid ${selectedBank ? '#277777' : '#9ca4a6'}`, borderRadius: 4, padding: '8px 12px', minHeight: 40, cursor: selectedBank ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)' }}
                  >
                    Continue
                  </button>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#6b7676', margin: 0, textAlign: 'right' }}>
                  By clicking here, I agree to the{' '}
                  <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Plaid Privacy Policy</span>
                </p>
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'manual' && (
          <motion.div key="manual" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <ManualBankForm
              onBack={() => setPhase('select-bank')}
              onSubmit={(label) => { setSelectedAccountLabel(label); setPhase('connecting') }}
            />
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
                onBack={() => { setSelectedBank(null); setPhase('select-bank') }}
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
              <ScreenImage src={SCREEN_SUCCESS} alt="Success screen" height={285} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    const bank = BANKS.find(b => b.id === selectedBank)
                    if (bank) onComplete({ bankName: bank.name, bankLogo: bank.logo, accountLabel: selectedAccountLabel })
                  }}
                  style={{ backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '10px 20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)' }}
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
