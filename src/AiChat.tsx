import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useConversationScroll } from './hooks/useConversationScroll'

type ChatMode = 'closed' | 'compact' | 'expanded'

const AI_BUBBLE_COLOR = '#C7E5DF'
const EASE = [0.22, 1, 0.36, 1] as const

export type Suggestion = { label: string; response: string }

// ─── Default (business ID) suggestion ────────────────────────────────────────

const DEFAULT_SUGGESTION: Suggestion = {
  label: 'Where can I find my business identification number?',
  response: `Good question Alex, you can find your business identification number (also known as the CBE, KBO, or enterprise number) immediately by searching the official CBE Public Search tool using your company name or address. It is a 10-digit number.\n\nExample:\nWithout VAT 0123.456.789\nWith VAT BE0123.456.789\n\nAlternatively you can check your initial registration paperwork, bank account details, or your company's official statutes (published in the Belgian Official Journal/Moniteur belge).`,
}

const FALLBACK_RESPONSE = `Sorry, not all prompts are included in this prototype. Try one of these instead:`

// ─── Identity-step suggestions ────────────────────────────────────────────────

export const IDENTITY_SUGGESTIONS: Suggestion[] = [
  {
    label: 'Why do I need to provide ID documents?',
    response: `Great question! We're required by law to verify the identity of all our customers. This is part of Know Your Customer (KYC) regulations and Anti-Money Laundering (AML) compliance — standard practice for all financial services providers.\n\nIt also helps protect you: by confirming your identity, we make sure no one else can open a Launchpad account in your name.\n\nYour documents are processed securely by our trusted partner IDnow and are never stored longer than legally required.`,
  },
  {
    label: 'What do I need to do a video selfie?',
    response: `For the selfie verification you'll need:\n\n• A valid passport or national ID card\n• Access to your smartphone's camera\n• Good lighting and a stable internet connection\n\nAfter scanning the QR code on screen, IDnow will guide you step by step. The whole process usually takes about 5 minutes.`,
  },
]

type Message = {
  id: number
  role: 'user' | 'ai'
  text: string
  time: string
  fallback?: boolean
}

function now() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon({ color = 'white', size = 17 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 1l2.2 6.4L18 10l-5.8 2.6L10 19l-2.2-6.4L2 10l5.8-2.6L10 1z" fill={color} stroke={color} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M16 2l.8 2.2L19 5l-2.2.8L16 8l-.8-2.2L13 5l2.2-.8L16 2z" fill={color} stroke={color} strokeWidth={0.3} strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <circle cx={5} cy={3.5} r={2} fill="white" />
      <path d="M1 9c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth={1} strokeLinecap="round" />
    </svg>
  )
}

function SendActiveIcon() {
  return (
    <svg width={33} height={33} viewBox="0 0 33 33" fill="none" aria-hidden="true">
      <circle cx={16.5} cy={16.5} r={15.5} stroke="#277777" strokeWidth={1.5} fill="none" />
      <path d="M16.5 22V12M12 16.5l4.5-4.5 4.5 4.5" stroke="#277777" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width={33} height={33} viewBox="0 0 33 33" fill="none" aria-hidden="true">
      <circle cx={16.5} cy={16.5} r={15.5} stroke="#d0d5d5" strokeWidth={1} fill="none" />
      <path d="M16.5 22V12M12 16.5l4.5-4.5 4.5 4.5" stroke="#b4b7bc" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WorldlineMark() {
  return (
    <svg width="44" height="21" viewBox="0 0 29 14" fill="none" aria-label="Worldline">
      <path d="M9.91277 13.6726C9.50482 10.4421 8.37393 7.45709 6.62595 5.07721C6.16636 4.44933 5.67321 3.87967 5.15423 3.36572C4.65075 3.79866 4.18084 4.26451 3.74707 4.76327C5.85394 6.8368 7.37471 10.0041 7.88594 13.6726H9.91277Z" fill="#277777"/>
      <path d="M6.118 13.6725C5.73568 11.2452 4.85558 9.00884 3.53928 7.19788C3.25447 6.80563 2.9517 6.43886 2.63866 6.1001C2.25121 6.68337 1.90738 7.29722 1.6123 7.93908C2.81057 9.42401 3.69324 11.4133 4.09608 13.6725H6.118Z" fill="#277777"/>
      <path d="M0.916653 9.88623C0.597261 11.0902 0.426758 12.3608 0.426758 13.6724H2.3239C2.05014 12.2866 1.57465 11.0006 0.916653 9.88623Z" fill="#277777"/>
      <path d="M17.6378 13.6725C18.2507 8.59467 20.5226 5.17506 22.4722 3.11171C22.6333 2.94312 22.7945 2.77957 22.9556 2.62104C22.6861 2.43484 22.4061 2.2587 22.1235 2.09011C21.994 2.21844 21.8646 2.34928 21.7404 2.48264C20.0761 4.239 18.1952 6.9289 17.1966 10.7134C16.8902 9.186 16.4622 7.71146 15.9154 6.30738C16.9985 3.99996 18.3432 2.21844 19.5795 0.899908C19.2466 0.781644 18.9058 0.67596 18.5624 0.580342C17.4978 1.75796 16.3804 3.25766 15.4161 5.11467C14.7214 3.57471 13.876 2.1354 12.8933 0.831969C12.7321 0.620602 12.571 0.411751 12.4046 0.210449C11.6437 0.321165 10.9041 0.492272 10.1882 0.711188C11.9053 2.60343 13.3027 4.99892 14.2617 7.73411C13.9077 8.69784 13.6039 9.73203 13.3635 10.8442C12.6872 7.91025 11.4747 5.21783 9.78662 2.97835C9.35337 2.40464 8.899 1.87119 8.42349 1.38052C7.78683 1.6724 7.17395 2.00707 6.59277 2.38199C9.30582 4.9964 11.2264 9.02747 11.7705 13.67H13.9183C14.0794 12.0973 14.3726 10.6555 14.7636 9.33949C15.144 10.7184 15.4135 12.1678 15.5614 13.67H17.6378V13.6725Z" fill="#277777"/>
      <path d="M21.0933 13.6702C21.6753 9.74705 23.4605 7.08102 25.0055 5.44805C25.1125 5.33603 25.2195 5.2265 25.3265 5.12195C25.1177 4.88049 24.9011 4.64401 24.6741 4.41748C22.4974 6.54333 20.6757 9.63005 20.1094 13.6727H21.0933V13.6702Z" fill="#277777"/>
      <path d="M24.9022 13.6725C25.3735 11.1811 26.4319 9.35517 27.4614 8.0954C27.314 7.77409 27.156 7.46042 26.9849 7.15186C25.5552 8.77119 24.3835 10.9439 23.9043 13.6725H24.9022Z" fill="#277777"/>
      <path d="M28.4725 11.3584C28.1513 12.0565 27.885 12.8286 27.6982 13.6722H28.6467C28.6492 12.8842 28.5895 12.112 28.4725 11.3584Z" fill="#277777"/>
    </svg>
  )
}

// ─── Avatars ──────────────────────────────────────────────────────────────────

function AiAvatar() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <SparkleIcon color="white" size={11} />
    </div>
  )
}

function UserAvatar() {
  return (
    <div style={{ width: 20, height: 20, borderRadius: 9999, backgroundColor: '#066076', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <PersonIcon />
    </div>
  )
}

// ─── Thinking dots ────────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingLeft: 8 }}
    >
      <div style={{ paddingTop: 4, flexShrink: 0 }}><AiAvatar /></div>
      <div style={{ backgroundColor: AI_BUBBLE_COLOR, borderRadius: '0px 12px 12px 12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 5, filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.08))' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
            style={{ width: 7, height: 7, borderRadius: 9999, backgroundColor: '#277777', opacity: 0.65 }} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Message bubbles ──────────────────────────────────────────────────────────

function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }}
      style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, paddingRight: 8 }}>
      <div style={{ backgroundColor: '#dcf4fa', borderRadius: '12px 0px 12px 12px', padding: 12, maxWidth: '70%', filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.08))' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', margin: 0, textAlign: 'right' }}>{text}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#6b7676', margin: '4px 0 0', textAlign: 'right' }}>{time}</p>
      </div>
      <div style={{ paddingTop: 4, flexShrink: 0 }}><UserAvatar /></div>
    </motion.div>
  )
}

function AiMessageBubble({ text, time, fallback, fallbackSuggestions, onSuggestionClick }: {
  text: string; time: string; fallback?: boolean
  fallbackSuggestions?: Suggestion[]
  onSuggestionClick?: (s: Suggestion) => void
}) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingLeft: 8 }}>
      <div style={{ paddingTop: 4, flexShrink: 0 }}><AiAvatar /></div>
      <div style={{ backgroundColor: AI_BUBBLE_COLOR, borderRadius: '0px 12px 12px 12px', padding: 12, maxWidth: '80%', filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.08))' }}>
        {fallback ? (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', margin: 0 }}>{FALLBACK_RESPONSE}</p>
            {(fallbackSuggestions ?? []).map(s => (
              <div key={s.label} style={{ marginTop: 8 }}>
                <button type="button" onClick={() => onSuggestionClick?.(s)}
                  style={{ backgroundColor: '#dcf4fa', borderRadius: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#066076' }}>{s.label}</span>
                </button>
              </div>
            ))}
          </>
        ) : (
          paragraphs.map((para, i) => (
            <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', margin: i > 0 ? '12px 0 0' : 0 }}>
              {para}
            </p>
          ))
        )}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#6b7676', margin: '8px 0 0' }}>{time}</p>
      </div>
    </motion.div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

function InputBar({ value, onChange, onSend, placeholder = 'Ask me anything' }: {
  value: string; onChange: (v: string) => void; onSend: () => void; placeholder?: string
}) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) { e.preventDefault(); onSend() }
  }
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
      <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKey} placeholder={placeholder}
        style={{ flex: '1 0 0', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621', background: 'none', border: 'none', outline: 'none', minWidth: 0 }} />
      <button type="button" onClick={onSend} disabled={!value.trim()} aria-label="Send"
        style={{ flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: value.trim() ? 'pointer' : 'default', display: 'flex', opacity: value.trim() ? 1 : 0.5 }}>
        {value.trim() ? <SendActiveIcon /> : <SendIcon />}
      </button>
    </div>
  )
}

function CompactInputBar({ onClick, placeholder = 'Ask me anything' }: { onClick: () => void; placeholder?: string }) {
  return (
    <div onClick={onClick} style={{ backgroundColor: 'white', borderRadius: 12, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <p style={{ flex: '1 0 0', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#b4b7bc', margin: 0 }}>{placeholder}</p>
      <div style={{ flexShrink: 0, display: 'flex' }}><SendIcon /></div>
    </div>
  )
}

function HideButton({ onHide }: { onHide: () => void }) {
  return (
    <button type="button" onClick={onHide} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d', whiteSpace: 'nowrap' }}>Hide Jani</span>
      <SparkleIcon color="#525d5d" size={16} />
    </button>
  )
}

function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ backgroundColor: '#dcf4fa', borderRadius: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, border: 'none', cursor: 'pointer', display: 'block', overflow: 'hidden', maxWidth: '100%' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#066076', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
        {label}
      </span>
    </button>
  )
}

// ─── Unified chat panel ───────────────────────────────────────────────────────

interface ChatPanelProps {
  mode: 'compact' | 'expanded'
  onHide: () => void
  onExpand: () => void
  onClose: () => void
  suggestions: Suggestion[]
  placeholder: string
  pendingMessage?: string | null
  onPendingMessageSent?: () => void
}

function ChatPanel({ mode, onHide, onExpand, onClose, suggestions, placeholder, pendingMessage, onPendingMessageSent }: ChatPanelProps) {
  const isExpanded = mode === 'expanded'
  const [messages, setMessages] = useState<Message[]>([])
  const [thinking, setThinking] = useState(false)
  const [draft, setDraft] = useState('')
  const nextId = useRef(0)
  const lastHandledPending = useRef<string | null>(null)

  const { scrollRef, bottomAnchorRef, showJumpToLatest, jumpToLatest } =
    useConversationScroll([messages, thinking])

  const responseMap = Object.fromEntries(suggestions.map(s => [s.label.toLowerCase(), s.response]))

  // Pre-load example conversation once on first expand (skip if triggered externally)
  useEffect(() => {
    if (!isExpanded || messages.length > 0 || pendingMessage) return
    const first = suggestions[0]
    if (!first) return
    setMessages([{ id: nextId.current++, role: 'user', text: first.label, time: '11:00' }])
    setThinking(true)
    const t = setTimeout(() => {
      setThinking(false)
      setMessages(prev => [...prev, { id: nextId.current++, role: 'ai', text: first.response, time: '11:01' }])
    }, 2200)
    return () => clearTimeout(t)
  }, [isExpanded])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || thinking) return
    const responseText = responseMap[text.toLowerCase()]
    const isFallback = !responseText
    setMessages(prev => [...prev, { id: nextId.current++, role: 'user', text, time: now() }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      setMessages(prev => [...prev, {
        id: nextId.current++,
        role: 'ai',
        text: responseText ?? FALLBACK_RESPONSE,
        time: now(),
        fallback: isFallback,
      }])
    }, 2200)
  }, [thinking, responseMap])

  const send = useCallback(() => {
    if (!draft.trim()) return
    sendMessage(draft.trim())
    setDraft('')
  }, [draft, sendMessage])

  // Send externally triggered message once expanded
  const sendMessageRef = useRef(sendMessage)
  useEffect(() => { sendMessageRef.current = sendMessage }, [sendMessage])
  useEffect(() => {
    if (!isExpanded || !pendingMessage || lastHandledPending.current === pendingMessage) return
    lastHandledPending.current = pendingMessage
    sendMessageRef.current(pendingMessage)
    onPendingMessageSent?.()
  }, [isExpanded, pendingMessage])

  const handleSuggestionClick = useCallback((s: Suggestion) => {
    if (!isExpanded) { onExpand(); return }
    sendMessage(s.label)
  }, [isExpanded, onExpand, sendMessage])

  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 12, boxShadow: '0px 8px 40px rgba(0,0,0,0.14)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="header"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 50, opacity: 1, transition: { duration: 0.32, ease: EASE, delay: 0.28 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.28, ease: EASE } }}
            style={{ flexShrink: 0, overflow: 'hidden', borderBottom: '1px solid #e6ebeb' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 50 }}>
              <div style={{ flex: '1 0 0' }} />
              <div style={{ flex: '1 0 0', display: 'flex', justifyContent: 'center' }}><WorldlineMark /></div>
              <div style={{ flex: '1 0 0', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} aria-label="Close chat" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  <CloseIcon />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="messages"
            ref={scrollRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '55vh', opacity: 1, transition: { duration: 0.42, ease: EASE, delay: 0.28 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.38, ease: EASE } }}
            style={{ flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 12px', position: 'relative' }}
          >
            {messages.map(msg =>
              msg.role === 'user'
                ? <UserBubble key={msg.id} text={msg.text} time={msg.time} />
                : <AiMessageBubble key={msg.id} text={msg.text} time={msg.time} fallback={msg.fallback}
                    fallbackSuggestions={suggestions}
                    onSuggestionClick={s => handleSuggestionClick(s)} />
            )}
            <AnimatePresence>{thinking && <ThinkingDots key="dots" />}</AnimatePresence>
            <div ref={bottomAnchorRef} style={{ flexShrink: 0, height: 1 }} />

            <AnimatePresence>
              {showJumpToLatest && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                  <button type="button" onClick={jumpToLatest}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#277777', color: 'white', border: 'none', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, boxShadow: '0px 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
                    ↓ Jump to latest
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <motion.div key="input-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
              <InputBar value={draft} onChange={setDraft} onSend={send} placeholder={placeholder} />
            </motion.div>
          ) : (
            <motion.div key="input-compact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
              <CompactInputBar onClick={onExpand} placeholder={placeholder} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map(s => (
              <SuggestionChip key={s.label} label={s.label} onClick={() => handleSuggestionClick(s)} />
            ))}
          </div>
          <HideButton onHide={isExpanded ? onClose : onHide} />
        </div>
      </div>
    </div>
  )
}

// ─── Ask Jani button ──────────────────────────────────────────────────────────

function AskButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button type="button" onClick={onClick}
      initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ duration: 0.22, ease: EASE }} aria-label="Open AI assistant"
      style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#277777', border: 'none', borderRadius: 100, paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, cursor: 'pointer', boxShadow: '0px 4px 16px rgba(39,119,119,0.35)' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: 'white', whiteSpace: 'nowrap' }}>Ask Jani</span>
      <SparkleIcon color="white" size={17} />
    </motion.button>
  )
}

// ─── Main widget ──────────────────────────────────────────────────────────────

interface AiChatWidgetProps {
  initialMode?: ChatMode
  suggestions?: Suggestion[]
  placeholder?: string
  externalTrigger?: { message: string; id: number } | null
  onOpen?: () => void
}

export function AiChatWidget({ initialMode = 'closed', suggestions, placeholder, externalTrigger, onOpen }: AiChatWidgetProps) {
  const [mode, setMode] = useState<ChatMode>(initialMode)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  const resolvedSuggestions = suggestions ?? [DEFAULT_SUGGESTION]
  const resolvedPlaceholder = placeholder ?? 'Ask me anything'

  useEffect(() => {
    if (!externalTrigger) return
    setMode('expanded')
    setPendingMessage(externalTrigger.message)
  }, [externalTrigger?.id])

  const panelStyle: React.CSSProperties = {
    position: 'fixed', bottom: 48,
    left: '50%', transform: 'translateX(-50%)',
    width: 'calc(100% - 24px)', maxWidth: 700,
    zIndex: 60,
    pointerEvents: mode === 'closed' ? 'none' : 'auto',
  }

  return (
    <>
      {/* Floating "Ask Jani" button — only when closed */}
      <div style={{ position: 'fixed', bottom: 48, right: 48, zIndex: 60 }}>
        <AnimatePresence>
          {mode === 'closed' && <AskButton onClick={() => { setMode('compact'); onOpen?.() }} />}
        </AnimatePresence>
      </div>

      {/* Unified panel */}
      <div style={panelStyle}>
        <AnimatePresence>
          {mode !== 'closed' && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <ChatPanel
                mode={mode as 'compact' | 'expanded'}
                onHide={() => setMode('closed')}
                onExpand={() => setMode('expanded')}
                onClose={() => setMode('closed')}
                suggestions={resolvedSuggestions}
                placeholder={resolvedPlaceholder}
                pendingMessage={pendingMessage}
                onPendingMessageSent={() => setPendingMessage(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
