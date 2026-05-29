import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

// direction: 1 = forward (dashboard → onboarding), -1 = backward (onboarding → dashboard)
interface PageTransitionProps {
  children: ReactNode
  direction: number
}

const variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 48 : -48,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? -48 : 48,
    scale: 0.98,
  }),
}

export function PageTransition({ children, direction }: PageTransitionProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'fixed', inset: 0, willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
