import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, m } from 'framer-motion'
import { cn } from '../../utils/cn'

interface ModalProps {
  isOpen:    boolean
  onClose:   () => void
  title?:    string
  children:  ReactNode
  size?:     'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <m.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <m.div
            ref={dialogRef}
            className={cn('relative bg-white w-full shadow-2xl', sizeClasses[size], className)}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-accent">
                <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-accent transition-colors" aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-accent transition-colors z-10"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}
            <div className="p-6">{children}</div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  )
}
