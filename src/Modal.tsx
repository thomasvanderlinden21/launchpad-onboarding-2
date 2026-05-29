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

interface ModalActionsProps {
  onCancel?: () => void
  onConfirm?: () => void
  cancelLabel?: string
  confirmLabel?: string
}

function ModalActions({
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
}: ModalActionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: '16px 24px',
        borderTop: '1px solid #e6ebeb',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        style={{
          flex: '1 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 40,
          padding: '8px',
          backgroundColor: '#e6ebeb',
          border: '1px solid #b4b7bc',
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: 500,
          lineHeight: '22px',
          color: '#121621',
        }}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        style={{
          flex: '1 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 40,
          padding: '8px',
          backgroundColor: '#277777',
          border: '1px solid #277777',
          borderRadius: 4,
          boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: 500,
          lineHeight: '22px',
          color: '#ffffff',
        }}
      >
        {confirmLabel}
      </button>
    </div>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  onCancel?: () => void
  onConfirm?: () => void
  cancelLabel?: string
  confirmLabel?: string
  showActions?: boolean
}

export function Modal({
  open,
  onClose,
  title = 'Modal title',
  children,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  showActions = true,
}: ModalProps) {
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
        /* Overlay — also acts as the centering container */
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          {/* Modal panel */}
          <motion.div
            key="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 408,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              border: '1px solid #e6ebeb',
              borderRadius: 8,
              boxShadow: '0px 14px 28px 0px rgba(0,0,0,0.16)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
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
                id="modal-title"
                style={{
                  flex: '1 0 0',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: '24px',
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

            {/* Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 24px',
                flexShrink: 0,
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

            {/* Actions */}
            {showActions && (
              <ModalActions
                onCancel={onCancel ?? onClose}
                onConfirm={onConfirm ?? onClose}
                cancelLabel={cancelLabel}
                confirmLabel={confirmLabel}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
