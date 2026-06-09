import { InputHTMLAttributes, forwardRef, useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Floating label text */
  label?: string
  /** Error message to display below the input */
  error?: string
  /** Hint text shown below the input when no error */
  hint?: string
  /** Icon rendered at the start (inline-start) of the input */
  startIcon?: React.ReactNode
  /** Icon rendered at the end (inline-end) of the input */
  endIcon?: React.ReactNode
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Full width mode */
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      startIcon,
      endIcon,
      size = 'md',
      fullWidth = true,
      type = 'text',
      id: externalId,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = externalId || generatedId
    const [isFocused, setIsFocused] = useState(false)
    const hasValue = props.value !== undefined && props.value !== ''

    const sizes = {
      sm: 'h-9 text-sm',
      md: 'h-11 text-sm',
      lg: 'h-14 text-base'
    }

    const labelSizes = {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm'
    }

    // Whether the floating label is in its "raised" position
    const isLabelRaised = isFocused || hasValue || !!props.placeholder

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={clsx(
              // Base styles
              'w-full rounded-xl border bg-[#1a1d27] text-white placeholder-gray-500',
              'transition-all duration-200 outline-none',
              'focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0f1117]',
              // Sizes
              sizes[size],
              // Padding: account for icons and floating label
              startIcon ? 'ps-10' : 'ps-4',
              endIcon ? 'pe-10' : 'pe-4',
              label ? 'pt-5 pb-1' : '',
              // Border & focus states
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                : 'border-[#2d3252] focus:border-indigo-500 focus:ring-indigo-500/30',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            {...props}
          />

          {/* Floating label */}
          {label && (
            <motion.label
              htmlFor={inputId}
              initial={false}
              animate={{
                y: isLabelRaised ? (size === 'lg' ? -16 : size === 'md' ? -12 : -8) : 0,
                scale: isLabelRaised ? 0.75 : 1
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 origin-top-start pointer-events-none',
                'transition-colors duration-200',
                startIcon ? 'start-10' : 'start-4',
                labelSizes[size],
                isFocused ? 'text-indigo-400' : error ? 'text-red-400' : 'text-gray-400'
              )}
            >
              {label}
            </motion.label>
          )}

          {/* End icon */}
          {endIcon && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-400">
              {endIcon}
            </div>
          )}
        </div>

        {/* Error / Hint messages */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 text-xs text-red-400 ps-1"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 ps-1"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
