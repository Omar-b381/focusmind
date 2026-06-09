import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

type ProgressColor = 'primary' | 'dopamine' | 'success'

// ─── Linear Progress Bar ─────────────────────────────────────────────────────

interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress value from 0 to 100 */
  value: number
  /** Color theme */
  color?: ProgressColor
  /** Height of the bar */
  size?: 'sm' | 'md' | 'lg'
  /** Show percentage label */
  showLabel?: boolean
  /** Animate the progress change */
  animated?: boolean
}

const colorMap: Record<ProgressColor, { bar: string; glow: string }> = {
  primary: {
    bar: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
    glow: 'shadow-indigo-500/30'
  },
  dopamine: {
    bar: 'bg-gradient-to-r from-orange-500 to-amber-400',
    glow: 'shadow-orange-500/30'
  },
  success: {
    bar: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    glow: 'shadow-emerald-500/30'
  }
}

const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  (
    {
      value,
      color = 'primary',
      size = 'md',
      showLabel = false,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value))
    const colors = colorMap[color]

    const sizes = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4'
    }

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">التقدم</span>
            <span className="text-xs font-medium text-gray-300">{Math.round(clampedValue)}%</span>
          </div>
        )}
        <div
          className={clsx(
            'w-full rounded-full bg-[#21253a] overflow-hidden',
            sizes[size]
          )}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            initial={animated ? { width: 0 } : false}
            animate={{ width: `${clampedValue}%` }}
            transition={animated ? { duration: 0.6, ease: 'easeOut' } : { duration: 0 }}
            className={clsx(
              'h-full rounded-full shadow-lg',
              colors.bar,
              colors.glow
            )}
          />
        </div>
      </div>
    )
  }
)

LinearProgress.displayName = 'LinearProgress'

// ─── Circular Progress Ring ──────────────────────────────────────────────────

interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress value from 0 to 100 */
  value: number
  /** Color theme */
  color?: ProgressColor
  /** Diameter in pixels */
  size?: number
  /** Stroke width in pixels */
  strokeWidth?: number
  /** Show percentage in center */
  showLabel?: boolean
  /** Custom center content (overrides label) */
  centerContent?: React.ReactNode
  /** Animate the progress change */
  animated?: boolean
}

const circularColorMap: Record<ProgressColor, string> = {
  primary: '#6366f1',
  dopamine: '#f97316',
  success: '#10b981'
}

const circularGlowMap: Record<ProgressColor, string> = {
  primary: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))',
  dopamine: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.4))',
  success: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))'
}

const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      color = 'primary',
      size = 120,
      strokeWidth = 8,
      showLabel = true,
      centerContent,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference

    return (
      <div
        ref={ref}
        className={clsx('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          style={{ filter: circularGlowMap[color] }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#21253a"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={circularColorMap[color]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset }}
            transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {centerContent || (showLabel && (
            <span className="text-white font-semibold" style={{ fontSize: size * 0.2 }}>
              {Math.round(clampedValue)}%
            </span>
          ))}
        </div>
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'

export { LinearProgress, CircularProgress }
export type { LinearProgressProps, CircularProgressProps, ProgressColor }

// Default export is LinearProgress for simple import
export default LinearProgress
