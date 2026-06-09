import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

// Energy level mapping
type EnergyLevel = 'low' | 'medium' | 'high'

// Priority mapping
type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low'

// Status mapping
type StatusType = 'inbox' | 'today' | 'in_progress' | 'done' | 'parked'

interface BadgeBaseProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md'
  /** Show a dot indicator before the text */
  dot?: boolean
}

interface EnergyBadgeProps extends BadgeBaseProps {
  category: 'energy'
  value: EnergyLevel
}

interface PriorityBadgeProps extends BadgeBaseProps {
  category: 'priority'
  value: PriorityLevel
}

interface StatusBadgeProps extends BadgeBaseProps {
  category: 'status'
  value: StatusType
}

interface CustomBadgeProps extends BadgeBaseProps {
  category: 'custom'
  value: string
  colorClass?: string
}

type BadgeProps = EnergyBadgeProps | PriorityBadgeProps | StatusBadgeProps | CustomBadgeProps

// Color mappings for each category
const energyColors: Record<EnergyLevel, string> = {
  low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
}

const priorityColors: Record<PriorityLevel, string> = {
  urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  low: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

const statusColors: Record<StatusType, string> = {
  inbox: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  today: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  parked: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
}

// Arabic display labels
const energyLabels: Record<EnergyLevel, string> = {
  low: 'طاقة منخفضة',
  medium: 'طاقة متوسطة',
  high: 'طاقة عالية'
}

const priorityLabels: Record<PriorityLevel, string> = {
  urgent: 'عاجل',
  high: 'أولوية عالية',
  medium: 'أولوية متوسطة',
  low: 'أولوية منخفضة'
}

const statusLabels: Record<StatusType, string> = {
  inbox: 'الوارد',
  today: 'اليوم',
  in_progress: 'قيد التنفيذ',
  done: 'مكتمل',
  parked: 'مؤجل'
}

// Dot colors (solid, without opacity)
const energyDotColors: Record<EnergyLevel, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-400'
}

const priorityDotColors: Record<PriorityLevel, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-slate-400'
}

const statusDotColors: Record<StatusType, string> = {
  inbox: 'bg-gray-400',
  today: 'bg-indigo-400',
  in_progress: 'bg-blue-400',
  done: 'bg-emerald-400',
  parked: 'bg-amber-400'
}

function getColorClass(props: BadgeProps): string {
  switch (props.category) {
    case 'energy':
      return energyColors[props.value]
    case 'priority':
      return priorityColors[props.value]
    case 'status':
      return statusColors[props.value]
    case 'custom':
      return props.colorClass || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

function getDotColor(props: BadgeProps): string {
  switch (props.category) {
    case 'energy':
      return energyDotColors[props.value]
    case 'priority':
      return priorityDotColors[props.value]
    case 'status':
      return statusDotColors[props.value]
    case 'custom':
      return 'bg-gray-400'
  }
}

function getLabel(props: BadgeProps): string {
  switch (props.category) {
    case 'energy':
      return energyLabels[props.value]
    case 'priority':
      return priorityLabels[props.value]
    case 'status':
      return statusLabels[props.value]
    case 'custom':
      return props.value
  }
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
  const { className, size = 'sm', dot = false, children, ...rest } = props

  // Remove custom props before spreading to DOM
  const domProps = { ...rest } as Record<string, unknown>
  delete domProps.category
  delete domProps.value
  if ('colorClass' in domProps) delete domProps.colorClass

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  }

  const colorClass = getColorClass(props)
  const label = children || getLabel(props)

  return (
    <span
      ref={ref}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        sizes[size],
        colorClass,
        className
      )}
      {...(domProps as HTMLAttributes<HTMLSpanElement>)}
    >
      {dot && (
        <span
          className={clsx('h-1.5 w-1.5 rounded-full shrink-0', getDotColor(props))}
        />
      )}
      {label}
    </span>
  )
})

Badge.displayName = 'Badge'
export default Badge
export type { BadgeProps, EnergyLevel, PriorityLevel, StatusType }
