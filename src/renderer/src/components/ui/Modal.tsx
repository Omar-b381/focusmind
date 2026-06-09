import { HTMLAttributes, forwardRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Callback fired when the modal should close */
  onClose: () => void
  /** Modal title (rendered in header) */
  title?: React.ReactNode
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdrop?: boolean
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean
  /** Hide the close button */
  hideCloseButton?: boolean
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      closeOnBackdrop = true,
      closeOnEscape = true,
      hideCloseButton = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    }

    // Handle Escape key
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
          onClose()
        }
      },
      [onClose, closeOnEscape]
    )

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown)
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'
      }
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }, [isOpen, handleKeyDown])

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeOnBackdrop ? onClose : undefined}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <motion.div
              ref={ref as React.Ref<HTMLDivElement>}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={clsx(
                'relative w-full mx-4',
                'bg-[#1a1d27] border border-[#2d3252] rounded-2xl shadow-2xl shadow-black/40',
                'max-h-[85vh] flex flex-col',
                sizes[size],
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-label={typeof title === 'string' ? title : undefined}
              {...props}
            >
              {/* Header */}
              {(title || !hideCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d3252] shrink-0">
                  {title && (
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                  )}
                  {!hideCloseButton && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className={clsx(
                        'flex items-center justify-center h-8 w-8 rounded-lg',
                        'text-gray-400 hover:text-white hover:bg-[#21253a]',
                        'transition-colors duration-150',
                        !title && 'ms-auto'
                      )}
                      aria-label="إغلاق"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }
)

Modal.displayName = 'Modal'

// Convenience sub-component for modal footer with action buttons
interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2d3252] shrink-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ModalFooter.displayName = 'ModalFooter'

export { ModalFooter }
export default Modal
