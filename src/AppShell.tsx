import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SideNavigation } from './SideNavigation'

interface AppShellProps {
  children: ReactNode
}

// ─── Shared toolbar icons ─────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="#121621" strokeWidth={1.5} />
      <path d="M16.5 16.5L21 21" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightSmIcon({ color = '#121621' }: { color?: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="#121621" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Route → breadcrumb label ─────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  '/sales':        'Sales',
  '/terminals':    'Terminals',
  '/payments':     'Payments',
  '/catalogue':    'Product catalogue',
  '/business':     'My business',
  '/card-issuing': 'Card issuing',
  '/cash-advance': 'Cash advance',
  '/settings':     'Settings',
  '/notifications':'Notifications',
  '/help':         'Help',
  '/ai':           'AI assistant',
}

// ─── Shared toolbar ───────────────────────────────────────────────────────────

function SharedToolbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const subLabel = ROUTE_LABELS[location.pathname]

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#ffffff', borderBottom: '1px solid #e6ebeb', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 40 }}>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: subLabel ? 'pointer' : 'default', padding: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: subLabel ? '#121621' : '#6b7676', whiteSpace: 'nowrap' }}
        >
          Home
        </button>
        {subLabel && (
          <>
            <ChevronRightSmIcon color="#6b7676" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#6b7676', whiteSpace: 'nowrap' }}>
              {subLabel}
            </span>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, minHeight: 40, flexShrink: 0 }}>
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 2 }}>
          <SearchIcon />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', padding: '0 2px' }}>Search</span>
        </button>
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 2, height: 32 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, lineHeight: '22px', color: '#121621', padding: '0 2px' }}>beantastic coffee</span>
          <ChevronDownIcon />
        </button>
        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: '#1f5c5c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '16px', color: 'white' }}>JA</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const isBasket = location.pathname === '/basket'
  const isOnboarding = location.pathname.startsWith('/onboarding')
  const isCheckout = location.pathname.startsWith('/checkout')
  const showSidebar = !isBasket && !isOnboarding && !isCheckout

  if (isBasket) {
    return <>{children}</>
  }

  return (
    <div
      className="brand-bg"
      style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch' }}
    >
      {/* Sidebar — visible on all app pages except onboarding and checkout */}
      <AnimatePresence initial={false}>
        {showSidebar && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden', flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}
          >
            <SideNavigation />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right panel — layout-animated so it morphs as sidebar appears/disappears */}
      <motion.div
        layout
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: '1 0 0',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 12,
          paddingBottom: 12,
          paddingRight: 12,
          paddingLeft: showSidebar ? 0 : 12,
          minWidth: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Card */}
        <motion.div
          layout
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            border: '1px solid #e6ebeb',
            borderRadius: 8,
            boxShadow: '0px 0px 38px 0px rgba(0,0,0,0.16)',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Shared toolbar — consistent across all app pages, not animated */}
          {showSidebar && <SharedToolbar />}

          {/* Content — cross-fades between routes (keyed on top-level segment only) */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={'/' + location.pathname.split('/')[1]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
