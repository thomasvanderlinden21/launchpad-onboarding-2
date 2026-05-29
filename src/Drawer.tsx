import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function CloseIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="#121621"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
}

export function Drawer({ open, onClose, title = 'Modal title', children }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.42)',
              zIndex: 70,
            }}
            aria-hidden="true"
          />

          {/* Drawer panel — inset 12px from viewport edges to sit within the card boundary */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.9 }}
            style={{
              position: 'fixed',
              top: 12,
              right: 12,
              bottom: 12,
              width: 380,
              zIndex: 80,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              border: '1px solid #e6ebeb',
              borderRadius: 8,
              boxShadow: '0px 14px 28px 0px rgba(0,0,0,0.16)',
              overflow: 'hidden',
            }}
          >
            {/* Header — Figma: p-24, gap-16 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 24,
                flexShrink: 0,
              }}
            >
              <p
                id="drawer-title"
                style={{
                  flex: '1 0 0',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: '24px',
                  letterSpacing: 0,
                  color: '#121621',
                  margin: 0,
                }}
              >
                {title}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: 'none',
                  background: 'none',
                  borderRadius: 2,
                  cursor: 'pointer',
                  padding: 0,
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content area — Figma: px-24 py-16, flex-1, scrollable */}
            <div
              style={{
                flex: '1 0 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '16px 24px',
                overflowY: 'auto',
                minHeight: 0,
              }}
            >
              {children ?? (
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: '#121621',
                    margin: 0,
                  }}
                >
                  Content here
                </p>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
