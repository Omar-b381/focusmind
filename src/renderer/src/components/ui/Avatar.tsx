import { HTMLAttributes, forwardRef, useMemo } from 'react'
import { clsx } from 'clsx'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Display name (used to derive initials) */
  name?: string
  /** Emoji to display instead of initials */
  emoji?: string
  /** Image URL for photo avatar */
  src?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

// Gradient pairs that work well on dark backgrounds
const gradients = [
  'from-indigo-500 to-purple-500',
  'from-orange-500 to-amber-400',
  'from-emerald-500 to-teal-400',
  'from-pink-500 to-rose-400',
  'from-cyan-500 to-blue-400',
  'from-violet-500 to-fuchsia-400',
  'from-lime-500 to-green-400',
  'from-red-500 to-orange-400'
]

/** Deterministically pick a gradient based on a name string */
function getGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

/** Extract up to 2 initials from a name (supports Arabic & Latin) */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    // For single word, take first 2 characters (handles Arabic well)
    return parts[0].slice(0, 2)
  }
  // First char of first and last word
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name = '', emoji, src, size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-lg'
    }

    const gradient = useMemo(() => getGradient(name || 'default'), [name])
    const initials = useMemo(() => (name ? getInitials(name) : ''), [name])

    // If image is provided, render image avatar
    if (src) {
      return (
        <div
          ref={ref}
          className={clsx(
            'rounded-full overflow-hidden shrink-0 ring-2 ring-[#2d3252]',
            sizes[size],
            className
          )}
          {...props}
        >
          <img
            src={src}
            alt={name || 'avatar'}
            className="h-full w-full object-cover"
          />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-full shrink-0 flex items-center justify-center',
          'bg-gradient-to-br font-medium text-white',
          'ring-2 ring-[#2d3252] select-none',
          gradient,
          sizes[size],
          className
        )}
        title={name || undefined}
        {...props}
      >
        {emoji ? (
          <span role="img" aria-label={name || 'emoji'}>
            {emoji}
          </span>
        ) : (
          <span>{initials}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
export default Avatar
