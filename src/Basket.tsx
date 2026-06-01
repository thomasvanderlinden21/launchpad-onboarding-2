import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="#121621" strokeWidth={1.5} />
      <path d="M16.5 16.5L21 21" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="#121621" strokeWidth={1.5} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#121621" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M3 6h18" stroke="#121621" strokeWidth={1.5} />
      <path d="M16 10a4 4 0 01-8 0" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth={1.5} />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="#9ca4a6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACCESSORIES = [
  { id: 1, name: 'Protective Cover',               art: '23408', desc: 'Slim-fit cover designed for the Link/2500. Protects against everyday drops and scratches.', price: 19.95, img: '/images/acc-protective-cover.png' },
  { id: 2, name: 'Protective Cover + Lanyard',      art: '23407', desc: 'All-day protection with a lanyard so your terminal is always within reach.',               price: 24.95, img: '/images/acc-protective-cover-lanyard.png' },
  { id: 3, name: 'Desktop Stand + Cover',           art: '23408', desc: 'Transform your mobile terminal into a countertop setup. Includes protective cover.',        price: 59.95, img: '/images/acc-desktop-stand-cover.png' },
  { id: 4, name: 'Multi-Charger (3 terminals)',     art: '23073', desc: 'Charge up to 3 Link/2500 terminals simultaneously. Perfect for multi-terminal setups.',     price: 159.95, img: '/images/acc-multi-charger.png' },
  { id: 5, name: 'USB Cable (USB-A to USB-C 1.5m)', art: '23400', desc: '1.5m USB-A to USB-C cable for reliable daily charging.',                                   price: 5.95,  img: '/images/acc-usb-cable.png' },
  { id: 6, name: 'Power Supply (5V-1A USB-A)',      art: '23401', desc: '5V 1A USB-A power supply for charging your Link/2500 terminal.',                           price: 7.95,  img: '/images/acc-power-supply.png' },
  { id: 7, name: 'Battery (1200mAh)',               art: '23445', desc: 'Genuine 1200mAh replacement battery. Always have a spare ready for busy days.',             price: 27.95, img: '/images/acc-battery.png' },
]

// ─── Basket page ──────────────────────────────────────────────────────────────

export default function Basket() {
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [accQty, setAccQty] = useState<Record<number, number>>({})

  const addAcc = (id: number) => setAccQty(q => ({ ...q, [id]: (q[id] ?? 0) + 1 }))
  const removeAcc = (id: number) => setAccQty(q => { const next = { ...q }; delete next[id]; return next })
  const setAccQuantity = (id: number, qty: number) => {
    if (qty <= 0) removeAcc(id)
    else setAccQty(q => ({ ...q, [id]: qty }))
  }

  function handleCheckout() {
    const order = [
      { id: 'terminal', name: 'Link/2500', subtitle: 'Mobile Terminal', price: unitPrice, quantity, img: '/images/link-2500.png' },
      ...addedAccessories.map(acc => ({
        id: String(acc.id), name: acc.name, subtitle: `Art. ${acc.art}`, price: acc.price, quantity: accQty[acc.id] ?? 0, img: acc.img,
      })),
    ]
    localStorage.setItem('basketOrder', JSON.stringify(order))
    navigate('/checkout')
  }

  const unitPrice = 92
  const terminalSubtotal = unitPrice * quantity
  const accSubtotal = ACCESSORIES.reduce((sum, acc) => sum + acc.price * (accQty[acc.id] ?? 0), 0)
  const subtotal = terminalSubtotal + accSubtotal
  const vat = Math.round(subtotal * 0.2 * 100) / 100
  const total = subtotal + vat
  const totalItems = quantity + Object.values(accQty).reduce((s, v) => s + v, 0)
  const addedAccessories = ACCESSORIES.filter(acc => (accQty[acc.id] ?? 0) > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#f5f5f5', fontFamily: 'Inter, sans-serif', overflowY: 'auto' }}>

      {/* ── Top nav ── */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <img src="/images/worldline-logo.svg" alt="Worldline" style={{ height: 28, objectFit: 'contain' }} />

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: 32 }}>
            {['Instore', 'E-commerce', 'Pricing', 'Support'].map(link => (
              <span key={link} style={{ fontSize: 14, fontWeight: 400, color: '#121621', cursor: 'pointer' }}>{link}</span>
            ))}
          </nav>

          {/* Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><SearchIcon /></button>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><UserIcon /></button>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', position: 'relative' }}>
              <CartIcon />
              <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{totalItems}</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Home', 'All devices', 'Basket'].map((crumb, i, arr) => (
            <div key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: i === arr.length - 1 ? '#121621' : '#9ca4a6', fontWeight: i === arr.length - 1 ? 500 : 400, cursor: i < arr.length - 1 ? 'pointer' : 'default' }}>{crumb}</span>
              {i < arr.length - 1 && <ChevronRight />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 48px', width: '100%', boxSizing: 'border-box', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 28, fontWeight: 600, color: '#121621', margin: '0 0 4px' }}>Your Basket</h1>
            <p style={{ fontSize: 14, color: '#6b7676', margin: 0 }}>Review your devices and complete your setup</p>
          </div>

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Link/2500 */}
            <div style={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 80, height: 96, backgroundColor: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                <img src="/images/link-2500.png" alt="Link/2500" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#121621', margin: '0 0 2px' }}>Link/2500</p>
                <p style={{ fontSize: 13, color: '#9ca4a6', margin: '0 0 12px' }}>Mobile Terminal</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: 28, height: 28, border: '1px solid #e8e8e8', background: 'white', borderRadius: '4px 0 0 4px', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121621' }}>−</button>
                  <span style={{ width: 36, height: 28, border: '1px solid #e8e8e8', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: '#121621' }}>{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => q + 1)}
                    style={{ width: 28, height: 28, border: '1px solid #e8e8e8', background: 'white', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121621' }}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#121621' }}>€{(unitPrice * quantity).toFixed(0)}</span>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7676', padding: 0 }}>Remove</button>
              </div>
            </div>

            {/* Added accessories */}
            {addedAccessories.map(acc => (
              <div key={acc.id} style={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 80, height: 80, backgroundColor: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={acc.img} alt={acc.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#121621', margin: '0 0 2px' }}>{acc.name}</p>
                  <p style={{ fontSize: 13, color: '#9ca4a6', margin: '0 0 12px' }}>Art. {acc.art}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <button type="button" onClick={() => setAccQuantity(acc.id, (accQty[acc.id] ?? 0) - 1)}
                      style={{ width: 28, height: 28, border: '1px solid #e8e8e8', background: 'white', borderRadius: '4px 0 0 4px', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121621' }}>−</button>
                    <span style={{ width: 36, height: 28, border: '1px solid #e8e8e8', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: '#121621' }}>{accQty[acc.id]}</span>
                    <button type="button" onClick={() => setAccQuantity(acc.id, (accQty[acc.id] ?? 0) + 1)}
                      style={{ width: 28, height: 28, border: '1px solid #e8e8e8', background: 'white', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121621' }}>+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#121621' }}>€{(acc.price * (accQty[acc.id] ?? 0)).toFixed(2)}</span>
                  <button type="button" onClick={() => removeAcc(acc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7676', padding: 0 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Accessories section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 20, fontWeight: 600, color: '#121621', margin: 0 }}>Link/2500 Accessories</h2>
              <span style={{ backgroundColor: '#e6f0ef', color: '#277777', fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 9999 }}>For your terminal</span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7676', margin: '0 0 16px' }}>Designed specifically for the Link/2500 — protection, charging, and more.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {ACCESSORIES.map(acc => (
                <div key={acc.id} style={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 120, backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={acc.img} alt={acc.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#121621', margin: 0 }}>{acc.name}</p>
                    <p style={{ fontSize: 11, color: '#9ca4a6', margin: 0 }}>Art. {acc.art}</p>
                    <p style={{ fontSize: 12, color: '#6b7676', margin: '4px 0 12px', lineHeight: '16px', flex: 1 }}>{acc.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#121621' }}>€{acc.price.toFixed(2)}</span>
                      {(accQty[acc.id] ?? 0) === 0 ? (
                        <button type="button" onClick={() => addAcc(acc.id)}
                          style={{ border: '1px solid #e8e8e8', background: 'white', borderRadius: 4, padding: '5px 14px', fontSize: 13, fontWeight: 500, color: '#121621', cursor: 'pointer' }}>Add</button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          <button type="button" onClick={() => setAccQuantity(acc.id, (accQty[acc.id] ?? 0) - 1)}
                            style={{ width: 26, height: 26, border: '1px solid #e8e8e8', background: 'white', borderRadius: '4px 0 0 4px', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121621' }}>−</button>
                          <span style={{ width: 28, height: 26, border: '1px solid #e8e8e8', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#121621' }}>{accQty[acc.id]}</span>
                          <button type="button" onClick={() => setAccQuantity(acc.id, (accQty[acc.id] ?? 0) + 1)}
                            style={{ width: 26, height: 26, border: '1px solid #e8e8e8', background: 'white', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121621' }}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary — sticky */}
        <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 72 }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#121621', margin: 0 }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#6b7676' }}>Link/2500 × {quantity}</span>
                <span style={{ fontSize: 13, color: '#121621' }}>€{terminalSubtotal.toFixed(2)}</span>
              </div>
              {addedAccessories.map(acc => (
                <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#6b7676' }}>{acc.name} × {accQty[acc.id]}</span>
                  <span style={{ fontSize: 13, color: '#121621' }}>€{(acc.price * (accQty[acc.id] ?? 0)).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                <span style={{ fontSize: 13, color: '#6b7676' }}>Subtotal</span>
                <span style={{ fontSize: 13, color: '#121621' }}>€{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#6b7676' }}>VAT (20%)</span>
                <span style={{ fontSize: 13, color: '#121621' }}>€{vat.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#121621' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#121621' }}>€{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              style={{ backgroundColor: '#1a3a3a', border: 'none', borderRadius: 6, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}
            >
              <LockIcon />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Proceed to secure checkout</span>
            </button>

            <button type="button" onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7676', textAlign: 'center', padding: 0 }}>
              Continue shopping
            </button>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#1a1a1a', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#9ca4a6' }}>© 2026 Worldline. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <span key={link} style={{ fontSize: 12, color: '#9ca4a6', cursor: 'pointer' }}>{link}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
