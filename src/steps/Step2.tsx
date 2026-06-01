import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AI_BG = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE = [0.22, 1, 0.36, 1] as const
const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

type Step2Phase = 'overview' | 'add' | 'edit'

interface KeyIndividual {
  id: string
  name: string
  detail: string
}

const initialIndividuals: KeyIndividual[] = []

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
        <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{text}</p>
      </div>
    </div>
  )
}

function AiTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>{children}</h2>
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <p style={{ ...T, color: '#121621', margin: 0 }}>{children}</p>
}

const inputStyle: React.CSSProperties = {
  ...T,
  color: '#121621',
  backgroundColor: 'white',
  border: '1px solid #b4b7bc',
  borderRadius: 4,
  padding: 8,
  minHeight: 40,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

function LabeledInput({ label, value, onChange, placeholder = '', flex = '1 0 0' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  flex?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex, minWidth: 0 }}>
      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

function RadioOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minHeight: 40,
        backgroundColor: 'white',
        border: `1px solid ${selected ? '#277777' : '#e6ebeb'}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: 9999, border: `1px solid ${selected ? '#277777' : '#9ca4a6'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: '#277777' }} />}
      </span>
      <span style={{ ...T, color: '#121621' }}>{label}</span>
    </button>
  )
}

function UploadBox() {
  return (
    <div style={{ border: '1px dashed #b4b7bc', borderRadius: 4, backgroundColor: 'white', minHeight: 84, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <p style={{ ...T, color: '#6b7676', margin: 0 }}>Drag and drop to upload or</p>
      <button type="button" style={{ minHeight: 40, backgroundColor: '#e6ebeb', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#121621' }}>
        Select file
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth={1.5} />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth={1.5} />
        </svg>
      </button>
    </div>
  )
}

export interface Step2Individual { name: string; detail: string }
interface Step2Props {
  onComplete: (individuals: Step2Individual[]) => void
  selfIndividual?: Step2Individual
  initialData?: Step2Individual[]
}

export function Step2({ onComplete, selfIndividual, initialData }: Step2Props) {
  const [phase, setPhase] = useState<Step2Phase>('overview')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [individuals, setIndividuals] = useState<KeyIndividual[]>(() => {
    if (initialData && initialData.length > 0) {
      return initialData.map((ind, i) => ({ id: `ind-${i}`, name: ind.name, detail: ind.detail }))
    }
    return selfIndividual ? [{ id: 'self', name: selfIndividual.name, detail: selfIndividual.detail }] : []
  })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSignatory, setIsSignatory] = useState<boolean | null>(null)
  const [isUBO, setIsUBO] = useState<boolean | null>(null)
  const [ownershipPct, setOwnershipPct] = useState('')
  const [hasPhotoId, setHasPhotoId] = useState<boolean | null>(null)
  const [idType, setIdType] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [email, setEmail] = useState('')

  const canSaveBase = firstName.trim() !== '' && lastName.trim() !== '' && isSignatory !== null && isUBO !== null && (isUBO === false || ownershipPct.trim() !== '') && hasPhotoId !== null
  const canSave = canSaveBase && (hasPhotoId ? idType !== '' && idNumber.trim() !== '' && expiryDate.trim() !== '' : email.trim() !== '')

  function resetForm() {
    setFirstName('')
    setLastName('')
    setIsSignatory(null)
    setIsUBO(null)
    setOwnershipPct('')
    setHasPhotoId(null)
    setIdType('')
    setIdNumber('')
    setExpiryDate('')
    setEmail('')
  }

  function startEditing(person: KeyIndividual) {
    const parts = person.name.trim().split(' ')
    setFirstName(parts[0] ?? '')
    setLastName(parts.slice(1).join(' '))
    setIsSignatory(person.detail.toLowerCase().includes('signatory') || person.detail.toLowerCase().includes('director'))
    setIsUBO(person.detail.toLowerCase().includes('ubo'))
    setOwnershipPct('')
    setHasPhotoId(null)
    setIdType('')
    setIdNumber('')
    setExpiryDate('')
    setEmail('')
    setEditingId(person.id)
    setPhase('edit')
  }

  function handleSaveIndividual() {
    if (!canSave || !editingId) return
    const roles: string[] = []
    if (isSignatory) roles.push('Signatory')
    if (isUBO) roles.push('UBO')
    const detail = roles.length ? roles.join(' and ') : 'Key individual'
    setIndividuals(prev => prev.map(p => p.id === editingId ? { ...p, name: `${firstName} ${lastName}`, detail } : p))
    setPhase('overview')
    setEditingId(null)
    resetForm()
  }

  function handleExpiryDateChange(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`
    setExpiryDate(formatted)
  }

  function handleAddIndividual() {
    if (!canSave) return
    const details: string[] = []
    if (isSignatory) details.push('Signatory')
    if (isUBO) details.push('UBO')
    const detail = details.length ? details.join(' and ') : 'Key individual'
    setIndividuals(prev => [...prev, { id: `${Date.now()}`, name: `${firstName} ${lastName}`, detail }])
    setPhase('overview')
    resetForm()
  }

  return (
    <div style={{ width: '100%', paddingBottom: 32 }}>
      <AnimatePresence mode="wait">
        {phase === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <UserBubble text={selfIndividual ? `${selfIndividual.name} — identity verified` : 'Identity verification completed'} />

            <AiBubble>
              <AiTitle>Are there any other key individuals?</AiTitle>
              <BodyText>
                Please declare all <strong>signatories</strong> and <strong>UBO's</strong> associated with your company
              </BodyText>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {individuals.map(person => (
                  <div key={person.id} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: '#f5f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx={12} cy={8} r={4} stroke="#121621" strokeWidth={1.5} />
                        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
                      </svg>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#121621', margin: 0 }}>{person.name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6b7676', margin: 0 }}>{person.detail}</p>
                    </div>
                    <button type="button" aria-label="Edit key individual" onClick={() => startEditing(person)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#6b7676', flexShrink: 0 }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                        <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}

                <button type="button" onClick={() => setPhase('add')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #e6ebeb', backgroundColor: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
                    </svg>
                  </span>
                  <span style={{ ...T, color: '#121621' }}>Add key individual</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => onComplete(individuals.map(i => ({ name: i.name, detail: i.detail })))} style={{ minHeight: 44, backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)' }}>
                  Continue
                </button>
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'add' && (
          <motion.div key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <UserBubble text={selfIndividual
              ? `Confirmed ${selfIndividual.name}'s details are correct`
              : individuals.length > 0
                ? `Confirmed ${individuals[0].name}'s details are correct`
                : 'Adding key individual'
            } />

            <AiBubble>
              <AiTitle>Add new key individual</AiTitle>
              <BodyText>Make sure the below details match the ID document.</BodyText>

              <div style={{ display: 'flex', gap: 12 }}>
                <LabeledInput label="First name" value={firstName} onChange={setFirstName} />
                <LabeledInput label="Last name" value={lastName} onChange={setLastName} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ ...T, color: '#525d5d', margin: 0 }}>Is this person a signatory?</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <RadioOption label="Yes" selected={isSignatory === true} onClick={() => setIsSignatory(true)} />
                  <RadioOption label="No" selected={isSignatory === false} onClick={() => setIsSignatory(false)} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ ...T, color: '#525d5d', margin: 0 }}>Is this person Ultimate Beneficial Owner (UBO)?</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <RadioOption label="Yes" selected={isUBO === true} onClick={() => setIsUBO(true)} />
                  <RadioOption label="No" selected={isUBO === false} onClick={() => { setIsUBO(false); setOwnershipPct('') }} />
                </div>
              </div>

              {isUBO === true && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ ...T, color: '#525d5d' }}>What is your percentage ownership?</label>
                  <div style={{ position: 'relative' }}>
                    <input value={ownershipPct} onChange={e => setOwnershipPct(e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, paddingRight: 34 }} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', ...T, color: '#121621' }}>%</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ ...T, color: '#525d5d', margin: 0 }}>Do you have a photo this person's ID document</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <RadioOption label="Yes" selected={hasPhotoId === true} onClick={() => setHasPhotoId(true)} />
                  <RadioOption label="No" selected={hasPhotoId === false} onClick={() => setHasPhotoId(false)} />
                </div>
              </div>

              {hasPhotoId === true && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ ...T, color: '#525d5d' }}>ID type</label>
                    <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                      <select value={idType} onChange={e => setIdType(e.target.value)} style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: idType ? '#121621' : '#9ca4a6' }}>
                        <option value="" disabled>Please select</option>
                        <option value="passport">Passport</option>
                        <option value="id-card">National ID card</option>
                      </select>
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <LabeledInput label="ID number" value={idNumber} onChange={setIdNumber} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 0 0' }}>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Expiry date</label>
                      <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input value={expiryDate} onChange={e => handleExpiryDateChange(e.target.value)} placeholder="dd-mm-yyyy" style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', color: '#121621', minWidth: 0 }} />
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="#121621" strokeWidth={1.5} />
                          <path d="M8 3v4M16 3v4M3 10h18" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ ...T, color: '#525d5d' }}>Upload ID document</label>
                    <UploadBox />
                  </div>
                </>
              )}

              {hasPhotoId === false && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ ...T, color: '#525d5d' }}>What is their email address?</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0 }}>
                    We will send an email to verify their identity and you will receive an email confirmation once verified.
                  </p>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => { setPhase('overview'); resetForm() }} style={{ minHeight: 44, backgroundColor: '#e6ebeb', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleAddIndividual} disabled={!canSave} style={{ minHeight: 44, backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', opacity: canSave ? 1 : 0.5 }}>
                  Add key individual
                </button>
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'edit' && (
          <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <UserBubble text={`Editing ${individuals.find(i => i.id === editingId)?.name ?? 'key individual'}`} />

            <AiBubble>
              <AiTitle>Edit key individual</AiTitle>
              <BodyText>Make sure the below details match the ID document.</BodyText>

              <div style={{ display: 'flex', gap: 12 }}>
                <LabeledInput label="First name" value={firstName} onChange={setFirstName} />
                <LabeledInput label="Last name" value={lastName} onChange={setLastName} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ ...T, color: '#525d5d', margin: 0 }}>Is this person a signatory?</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <RadioOption label="Yes" selected={isSignatory === true} onClick={() => setIsSignatory(true)} />
                  <RadioOption label="No" selected={isSignatory === false} onClick={() => setIsSignatory(false)} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ ...T, color: '#525d5d', margin: 0 }}>Is this person Ultimate Beneficial Owner (UBO)?</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <RadioOption label="Yes" selected={isUBO === true} onClick={() => setIsUBO(true)} />
                  <RadioOption label="No" selected={isUBO === false} onClick={() => { setIsUBO(false); setOwnershipPct('') }} />
                </div>
              </div>

              {isUBO === true && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ ...T, color: '#525d5d' }}>What is your percentage ownership?</label>
                  <div style={{ position: 'relative' }}>
                    <input value={ownershipPct} onChange={e => setOwnershipPct(e.target.value.replace(/\D/g, ''))} style={{ ...inputStyle, paddingRight: 34 }} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', ...T, color: '#121621' }}>%</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ ...T, color: '#525d5d', margin: 0 }}>Do you have a photo of this person's ID document?</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <RadioOption label="Yes" selected={hasPhotoId === true} onClick={() => setHasPhotoId(true)} />
                  <RadioOption label="No" selected={hasPhotoId === false} onClick={() => setHasPhotoId(false)} />
                </div>
              </div>

              {hasPhotoId === true && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ ...T, color: '#525d5d' }}>ID type</label>
                    <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                      <select value={idType} onChange={e => setIdType(e.target.value)} style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: idType ? '#121621' : '#9ca4a6' }}>
                        <option value="" disabled>Please select</option>
                        <option value="passport">Passport</option>
                        <option value="id-card">National ID card</option>
                      </select>
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <LabeledInput label="ID number" value={idNumber} onChange={setIdNumber} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 0 0' }}>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>Expiry date</label>
                      <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input value={expiryDate} onChange={e => handleExpiryDateChange(e.target.value)} placeholder="dd-mm-yyyy" style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', color: '#121621', minWidth: 0 }} />
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="#121621" strokeWidth={1.5} />
                          <path d="M8 3v4M16 3v4M3 10h18" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ ...T, color: '#525d5d' }}>Upload ID document</label>
                    <UploadBox />
                  </div>
                </>
              )}

              {hasPhotoId === false && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ ...T, color: '#525d5d' }}>What is their email address?</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '18px', color: '#525d5d', margin: 0 }}>
                    We will send an email to verify their identity and you will receive an email confirmation once verified.
                  </p>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => { setPhase('overview'); setEditingId(null); resetForm() }} style={{ minHeight: 44, backgroundColor: '#e6ebeb', border: '1px solid #b4b7bc', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleSaveIndividual} disabled={!canSave} style={{ minHeight: 44, backgroundColor: '#277777', border: '1px solid #277777', borderRadius: 4, padding: '8px 16px', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: 'white', boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)', opacity: canSave ? 1 : 0.5 }}>
                  Save changes
                </button>
              </div>
            </AiBubble>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
