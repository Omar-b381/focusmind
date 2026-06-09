import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import Button from './Button'

interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  /** Emoji displayed prominently */
  emoji?: string
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Action button label */
  actionLabel?: string
  /** Action button click handler */
  onAction?: () => void
  /** Action button variant */
  actionVariant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dopamine'
  /** Action button icon */
  actionIcon?: React.ReactNode
  /** Compact mode for use inside cards/panels */
  compact?: boolean
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      emoji = '📭',
      title,
      description,
      actionLabel,
      onAction,
      actionVariant = 'primary',
      actionIcon,
      compact = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref as React.Ref<HTMLDivElement>}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={clsx(
          'flex flex-col items-center justify-center text-center',
          compact ? 'py-8 px-4' : 'py-16 px-8',
          className
        )}
        {...props}
      >
        {/* Emoji with subtle floating animation */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={clsx(
            'flex items-center justify-center rounded-2xl bg-[#21253a]/60 mb-5',
            compact ? 'h-16 w-16 text-3xl' : 'h-20 w-20 text-4xl'
          )}
          role="img"
          aria-label={title}
        >
          {emoji}
        </motion.div>

        {/* Title */}
        <h3
          className={clsx(
            'font-semibold text-white mb-2',
            compact ? 'text-base' : 'text-lg'
          )}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={clsx(
              'text-gray-400 max-w-sm',
              compact ? 'text-xs mb-4' : 'text-sm mb-6'
            )}
          >
            {description}
          </p>
        )}

        {/* Action button */}
        {actionLabel && onAction && (
          <Button
            variant={actionVariant}
            size={compact ? 'sm' : 'md'}
            icon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}

        {/* Optional extra content */}
        {children}
      </motion.div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

// ─── Pre-built Arabic Empty States ──────────────────────────────────────────

/** Convenience wrapper for common empty states with Arabic text */
const emptyStatePresets = {
  noTasks: {
    emoji: '✨',
    title: 'لا توجد مهام بعد',
    description: 'أضف أول مهمة لك وابدأ بتنظيم يومك'
  },
  noProjects: {
    emoji: '📁',
    title: 'لا توجد مشاريع',
    description: 'أنشئ مشروعاً جديداً لتجميع مهامك المترابطة'
  },
  noResults: {
    emoji: '🔍',
    title: 'لا توجد نتائج',
    description: 'جرّب تغيير كلمات البحث أو تعديل الفلاتر'
  },
  noNotes: {
    emoji: '📝',
    title: 'لا توجد ملاحظات',
    description: 'دوّن أفكارك حتى لا تضيع منك'
  },
  allDone: {
    emoji: '🎉',
    title: 'أحسنت! أنجزت كل شيء',
    description: 'استرح قليلاً، أنت تستحق ذلك'
  },
  focusEmpty: {
    emoji: '🧘',
    title: 'لا توجد جلسات تركيز',
    description: 'ابدأ جلسة تركيز لتعزيز إنتاجيتك'
  }
} as const

export { emptyStatePresets }
export default EmptyState
