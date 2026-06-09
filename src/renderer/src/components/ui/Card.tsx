import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'default' | 'elevated' | 'interactive'
  /** Disable hover animation */
  disableHover?: boolean
  /** Optional padding override */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      disableHover = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-[#21253a]/80 border border-[#2d3252] backdrop-blur-sm',
      elevated:
        'bg-[#21253a] border border-[#2d3252] shadow-xl shadow-black/20 backdrop-blur-md',
      interactive:
        'bg-[#21253a]/80 border border-[#2d3252] backdrop-blur-sm cursor-pointer hover:border-indigo-500/40'
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7'
    }

    // Interactive cards get more pronounced hover effect
    const hoverAnimation =
      !disableHover && variant === 'interactive'
        ? { y: -2, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)' }
        : !disableHover
          ? { y: -1, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }
          : {}

    return (
      <motion.div
        ref={ref as React.Ref<HTMLDivElement>}
        whileHover={hoverAnimation}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={clsx('rounded-2xl', variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components for structured card layout
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={clsx('text-lg font-semibold text-white', className)}
      {...props}
    >
      {children}
    </h3>
  )
)
CardTitle.displayName = 'CardTitle'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('text-gray-300', className)} {...props}>
      {children}
    </div>
  )
)
CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex items-center gap-3 mt-4 pt-4 border-t border-[#2d3252]', className)}
      {...props}
    >
      {children}
    </div>
  )
)
CardFooter.displayName = 'CardFooter'

export { CardHeader, CardTitle, CardContent, CardFooter }
export default Card
