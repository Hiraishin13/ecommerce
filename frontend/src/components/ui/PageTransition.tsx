import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className }: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
