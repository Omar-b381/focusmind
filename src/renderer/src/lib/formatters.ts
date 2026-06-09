import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

/**
 * Format a date in Arabic style
 */
export function formatArabicDate(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  if (isToday(d)) return 'اليوم'
  if (isYesterday(d)) return 'أمس'
  return format(d, 'd MMMM yyyy', { locale: ar })
}

/**
 * Format time in Arabic
 */
export function formatArabicTime(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  return format(d, 'h:mm a', { locale: ar })
}

/**
 * Format relative time in Arabic ("منذ 5 دقائق")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true, locale: ar })
}

/**
 * Format minutes to readable Arabic duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (remaining === 0) {
    return hours === 1 ? 'ساعة واحدة' : `${hours} ساعات`
  }
  return `${hours} ساعة و ${remaining} دقيقة`
}

/**
 * Format timer display (MM:SS)
 */
export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Get greeting based on time of day in Arabic
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'صباح الخير'
  if (hour < 17) return 'مساء الخير'
  if (hour < 21) return 'مساء النور'
  return 'أهلاً'
}

/**
 * Get current date as YYYY-MM-DD
 */
export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get current time as HH:MM
 */
export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm')
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
