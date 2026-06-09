import { useNotificationsStore } from '../../stores/notifications.store'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react'
import { clsx } from 'clsx'

export default function ToastContainer() {
  const { notifications, dismissNotification } = useNotificationsStore()

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-indigo-400 shrink-0" />,
    dopamine: <Sparkles className="h-5 w-5 text-orange-400 shrink-0 animate-bounce" />,
  }

  const borderColors = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    info: 'border-indigo-500/30',
    dopamine: 'border-orange-500/30 glow-dopamine',
  }

  return (
    <div className="fixed bottom-6 start-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            layout
            className={clsx(
              'pointer-events-auto w-full glass rounded-xl border p-4 flex gap-3 items-start justify-between shadow-xl',
              borderColors[toast.type]
            )}
          >
            <div className="flex gap-3 items-start">
              {icons[toast.type]}
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm font-bold text-white font-cairo">{toast.title}</h4>
                {toast.message && (
                  <p className="text-xs text-gray-400 font-tajawal">{toast.message}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => dismissNotification(toast.id)}
              className="p-1 hover:bg-[#2d3252] rounded text-gray-500 hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
