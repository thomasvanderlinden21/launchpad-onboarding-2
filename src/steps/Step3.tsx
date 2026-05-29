import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AI_BG = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE = [0.22, 1, 0.36, 1] as const
const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

type Phase = 'details' | 'location' | 'description' | 'category-choice' | 'category-confirm' | 'turnover'

interface Step3Props {
  onComplete: () => void
}

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>{children}</label>
}

const inputStyle: React.CSSProperties = {
  ...T,
  color: '#121621',
  backgroundColor: 'white',
  border: '1px solid #b4b7bc',
  borderRadius: 4,
  minHeight: 40,
  padding: '8px 10px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
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
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
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

function PrimaryBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 44,
        backgroundColor: '#277777',
        border: '1px solid #277777',
        borderRadius: 4,
        padding: '8px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '18px',
        color: 'white',
        boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}

function SecondaryBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 44,
        backgroundColor: '#e6ebeb',
        border: '1px solid #b4b7bc',
        borderRadius: 4,
        padding: '8px 14px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '18px',
        color: '#121621',
      }}
    >
      {label}
    </button>
  )
}

export function Step3({ onComplete }: Step3Props) {
  const [phase, setPhase] = useState<Phase>('details')

  const [differentTradingName, setDifferentTradingName] = useState<boolean>(true)
  const [tradingName, setTradingName] = useState('Beantastic Coffee')
  const [vatId, setVatId] = useState('BE0123456789')
  const [customerContact, setCustomerContact] = useState('')
  const [website, setWebsite] = useState('')

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Eating Places and Restaurants')
  const [categoryGroup, setCategoryGroup] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [finalCategory, setFinalCategory] = useState('')
  const [averageTransactionValue, setAverageTransactionValue] = useState('')
  const [monthlyTurnover, setMonthlyTurnover] = useState('')

  const detailsComplete = vatId.trim() !== '' && customerContact.trim() !== '' && website.trim() !== '' && (!differentTradingName || tradingName.trim() !== '')

  const descriptionScore = useMemo(() => {
    const text = description.trim()
    const words = text.split(/\s+/).filter(Boolean).length
    if (!text) return { tone: 'neutral' as const, label: '' }
    if (words < 3) return { tone: 'warn' as const, label: 'Narrowing it down' }
    return { tone: 'good' as const, label: 'This is great company type identified' }
  }, [description])

  const canContinueDescription = description.trim().split(/\s+/).filter(Boolean).length >= 3
  const canContinueCategoryChoice = categoryGroup !== '' && subCategory !== '' && finalCategory !== ''
  const canContinueTurnover = averageTransactionValue !== '' && monthlyTurnover !== ''

  const salesLocationSummary = 'Sales location is 1442 Chaussee de Haecht'
  const businessSummary = `${differentTradingName ? tradingName : 'Beantastic Coffee'} VAT ID ${vatId}`

  const CATEGORY_GROUP_OPTIONS = [
    { value: 'food-and-drink', label: 'Food and drink' },
    { value: 'retail', label: 'Retail' },
  ]

  const SUB_CATEGORY_OPTIONS = [
    { value: 'restaurant-fast-foods', label: 'Restaurant and fast foods' },
    { value: 'cafes', label: 'Cafes' },
  ]

  const DESCRIPTION_OPTIONS = [
    { value: 'Eating Places and Restaurants', label: 'Eating Places & Restaurants' },
    { value: 'Fast Food Restaurants', label: 'Fast Food Restaurants' },
    { value: 'Other', label: 'Other' },
  ]

  const TRANSACTION_VALUE_OPTIONS = [
    { value: 'under-10', label: 'Under EUR 10' },
    { value: '10-25', label: 'EUR 10 - EUR 25' },
    { value: '25-50', label: 'EUR 25 - EUR 50' },
    { value: '50-plus', label: 'More than EUR 50' },
  ]

  const MONTHLY_TURNOVER_OPTIONS = [
    { value: 'under-5k', label: 'Under EUR 5,000' },
    { value: '5k-20k', label: 'EUR 5,000 - EUR 20,000' },
    { value: '20k-50k', label: 'EUR 20,000 - EUR 50,000' },
    { value: '50k-plus', label: 'More than EUR 50,000' },
  ]

  return (
    <div style={{ width: '100%', paddingBottom: 32 }}>
      <AnimatePresence mode="wait">
        {phase === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Tell us about company</AiTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, lineHeight: '16px', color: '#525d5d', margin: 0 }}>Do you operate under a different trading name?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <RadioOption label="Yes" selected={differentTradingName} onClick={() => setDifferentTradingName(true)} />
                  <RadioOption label="No" selected={!differentTradingName} onClick={() => setDifferentTradingName(false)} />
                </div>
              </div>

              {differentTradingName && (
                <input value={tradingName} onChange={e => setTradingName(e.target.value)} style={inputStyle} />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldLabel>VAT ID</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <input value={vatId} onChange={e => setVatId(e.target.value)} style={{ ...inputStyle, paddingRight: 34 }} />
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#121621', display: 'inline-flex' }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.5} />
                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                      <circle cx={12} cy={17} r=".5" fill="currentColor" stroke="currentColor" strokeWidth={1} />
                    </svg>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldLabel>Provide the best customer service contact for customers</FieldLabel>
                <input value={customerContact} onChange={e => setCustomerContact(e.target.value)} placeholder="Email or contact number" style={inputStyle} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldLabel>Website or online presence</FieldLabel>
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://website.com" style={inputStyle} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="Continue" onClick={() => setPhase('location')} disabled={!detailsComplete} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'location' && (
          <motion.div key="location" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UserBubble text={businessSummary} />
            <AiBubble>
              <AiTitle>Where will your terminal be used?</AiTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Beantastic Coffee</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Chaussee de Haecht, 1442</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>1130</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Brussels</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Belgium</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <SecondaryBtn label="Add location" onClick={() => {}} />
                <PrimaryBtn label="Confirm location" onClick={() => setPhase('description')} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'description' && (
          <motion.div key="description" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UserBubble text={salesLocationSummary} />
            <AiBubble>
              <AiTitle>What products or services does your company provide?</AiTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder='Beantastic Coffee is a coffee shop that...'
                  style={{ ...inputStyle, minHeight: 92, resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                />
                {descriptionScore.label && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: '16px', color: '#6b7676' }}>{descriptionScore.label}</span>
                    <span style={{ width: 12, height: 12, borderRadius: 9999, backgroundColor: descriptionScore.tone === 'good' ? '#17a673' : '#f4b000' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPhase('category-choice')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: '18px',
                    color: '#121621',
                  }}
                >
                  Choose from categories
                </button>
                <PrimaryBtn label="Continue" onClick={() => setPhase('category-confirm')} disabled={!canContinueDescription} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'category-choice' && (
          <motion.div key="category-choice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UserBubble text={salesLocationSummary} />
            <AiBubble>
              <AiTitle>What products or services does your company provide?</AiTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Category</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={categoryGroup}
                      onChange={e => {
                        setCategoryGroup(e.target.value)
                        setSubCategory('')
                        setFinalCategory('')
                      }}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: categoryGroup ? '#121621' : '#9ca4a6' }}
                    >
                      <option value="" disabled>Please select</option>
                      {CATEGORY_GROUP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Sub category</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={subCategory}
                      onChange={e => {
                        setSubCategory(e.target.value)
                        setFinalCategory('')
                      }}
                      disabled={categoryGroup === ''}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: subCategory ? '#121621' : '#9ca4a6', cursor: categoryGroup === '' ? 'not-allowed' : 'pointer' }}
                    >
                      <option value="" disabled>Please select</option>
                      {SUB_CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Description</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={finalCategory}
                      onChange={e => {
                        setFinalCategory(e.target.value)
                        setCategory(e.target.value)
                      }}
                      disabled={subCategory === ''}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: finalCategory ? '#121621' : '#9ca4a6', cursor: subCategory === '' ? 'not-allowed' : 'pointer' }}
                    >
                      <option value="" disabled>Please select</option>
                      {DESCRIPTION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPhase('description')}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621' }}
                >
                  Type description
                </button>
                <PrimaryBtn label="Continue" onClick={() => setPhase('category-confirm')} disabled={!canContinueCategoryChoice} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'category-confirm' && (
          <motion.div key="category-confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UserBubble text={salesLocationSummary} />
            <AiBubble>
              <AiTitle>Based on your description, is it correct to say your business category is:</AiTitle>
              <div style={{ backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, minHeight: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                <span style={{ display: 'inline-flex', color: '#277777' }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 9l2-5h14l2 5v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth={1.5} />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth={1.5} />
                  </svg>
                </span>
                <span style={{ ...T, color: '#121621' }}>{category}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPhase('category-choice')}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#121621' }}
                >
                  Choose from categories
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <SecondaryBtn label="No, go back" onClick={() => setPhase('description')} />
                  <PrimaryBtn label="Yes, continue" onClick={() => setPhase('turnover')} />
                </div>
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'turnover' && (
          <motion.div key="turnover" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UserBubble text="Beantasric Coffee is Food and Drink" />
            <AiBubble>
              <AiTitle>This will help us estimate your annual turnover</AiTitle>
              <p style={{ ...T, color: '#121621', margin: 0 }}>Don&apos;t worry if you don&apos;t know the exact range, it&apos;s just an estimate.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Estimated average value per transaction</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={averageTransactionValue}
                      onChange={e => setAverageTransactionValue(e.target.value)}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: averageTransactionValue ? '#121621' : '#6b7676' }}
                    >
                      <option value="" disabled>Please select</option>
                      {TRANSACTION_VALUE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Estimated monthly card transaction turnover</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={monthlyTurnover}
                      onChange={e => setMonthlyTurnover(e.target.value)}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: monthlyTurnover ? '#121621' : '#6b7676' }}
                    >
                      <option value="" disabled>Please select</option>
                      {MONTHLY_TURNOVER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="Continue" onClick={onComplete} disabled={!canContinueTurnover} />
              </div>
            </AiBubble>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
