import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SideNavigation } from './SideNavigation'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/sales'

  return (
    <div
      className="brand-bg"
      style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch' }}
    >
      {/* Sidebar — slides in when on dashboard, out on onboarding */}
      <AnimatePresence initial={false}>
        {isDashboard && (
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
          paddingLeft: isDashboard ? 0 : 12,
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
            position: 'relative',
            backgroundColor: '#ffffff',
            border: '1px solid #e6ebeb',
            borderRadius: 8,
            boxShadow: '0px 0px 38px 0px rgba(0,0,0,0.16)',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Content — cross-fades between routes */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
