import { HTMLAttributes, forwardRef, useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

type TooltipPosition = 'top' | 'bottom' | 'start' | 'end'

interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver'> {
  /** Tooltip content text */
  content: React.ReactNode
  /** Preferred position (auto-adjusts if not enough space) */
  position?: TooltipPosition
  /** Delay before showing tooltip (ms) */
  delay?: number
  /** Whether the tooltip is disabled */
  disabled?: boolean
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      position = 'top',
      delay = 400,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const triggerRef = useRef<HTMLDivElement | null>(null)

    const showTooltip = useCallback(() => {
      if (disabled) return
      timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
    }, [delay, disabled])

    const hideTooltip = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setIsVisible(false)
    }, [])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, [])

    // Position styles using logical properties where possible
    const positionStyles: Record<TooltipPosition, string> = {
      top: 'bottom-full start-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full start-1/2 -translate-x-1/2 mt-2',
      start: 'end-full top-1/2 -translate-y-1/2 me-2',
      end: 'start-full top-1/2 -translate-y-1/2 ms-2'
    }

    // Animation direction based on position
    const animationVariants = {
      top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
      bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
      start: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
      end: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } }
    }

    const variants = animationVariants[position]

    return (
      <div
        ref={(node) => {
          triggerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        className={clsx('relative inline-flex', className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        {...props}
      >
        {children}
        <AnimatePresence>
          {isVisible && content && (
            <motion.div
              initial={variants.initial}
              animate={variants.animate}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={clsx(
                'absolute z-50 pointer-events-none',
                'px-3 py-1.5 rounded-lg',
                'bg-[#21253a] border border-[#2d3252] shadow-lg shadow-black/30',
                'text-xs text-gray-200 whitespace-nowrap',
                positionStyles[position]
              )}
              role="tooltip"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Tooltip.displayName = 'Tooltip'
export default Tooltip
