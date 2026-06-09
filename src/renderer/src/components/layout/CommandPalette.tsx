import { useEffect, useState, useRef } from 'react'
import { Search, Terminal, ArrowLeftRight, PlusCircle, Brain, Sparkles, CheckSquare, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, ActiveTab } from '../../stores/app.store'
import { useCreateTaskMutation } from '../../hooks/useTasks'
import { useCreateBrainDumpMutation } from '../../hooks/useBrainDumps'

export default function CommandPalette() {
  const [isOpen, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { setActiveTab } = useAppStore()
  const createTaskMutation = useCreateTaskMutation()
  const createBrainDumpMutation = useCreateBrainDumpMutation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
    }
  }, [isOpen])

  const actions = [
    { type: 'nav', id: 'dashboard', title: 'الذهاب إلى لوحة التحكم', icon: Terminal, tab: 'dashboard' as ActiveTab },
    { type: 'nav', id: 'tasks', title: 'الذهاب إلى قائمة المهام', icon: CheckSquare, tab: 'tasks' as ActiveTab },
    { type: 'nav', id: 'focus', title: 'الذهاب إلى وضع التركيز', icon: Sparkles, tab: 'focus' as ActiveTab },
    { type: 'nav', id: 'habits', title: 'الذهاب إلى بناء العادات', icon: ArrowLeftRight, tab: 'habits' as ActiveTab },
    { type: 'nav', id: 'dopamine', title: 'الذهاب لقائمة الدوبامين', icon: PlusCircle, tab: 'dopamine' as ActiveTab },
    { type: 'nav', id: 'coach', title: 'الذهاب للمرشد الذكي', icon: Brain, tab: 'coach' as ActiveTab },
    { type: 'nav', id: 'settings', title: 'الذهاب للإعدادات', icon: Settings, tab: 'settings' as ActiveTab }
  ]

  const filtered = actions.filter((act) => act.title.includes(query) || act.id.includes(query))

  const handleAction = (act: any) => {
    if (act.type === 'nav') {
      setActiveTab(act.tab)
    }
    setOpen(false)
  }

  const handleCustomSubmit = () => {
    if (!query.trim()) return

    if (query.startsWith('+ ')) {
      // Create task quick action: "+ task title"
      createTaskMutation.mutate({
        title: query.replace('+ ', '').trim(),
        energyLevel: 'medium',
        priority: 'medium',
        status: 'inbox',
        estimatedMinutes: 25,
        tags: '[]'
      })
    } else if (query.startsWith('? ')) {
      // Create brain dump quick action: "? dump content"
      createBrainDumpMutation.mutate(query.replace('? ', '').trim())
    } else {
      // Default fallback: create task
      createTaskMutation.mutate({
        title: query.trim(),
        energyLevel: 'medium',
        priority: 'medium',
        status: 'inbox',
        estimatedMinutes: 25,
        tags: '[]'
      })
    }

    setOpen(false)
    setQuery('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 font-tajawal">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-lg bg-[#1a1d27] border border-[#2d3252] rounded-2xl shadow-2xl overflow-hidden z-10 text-right"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-[#2d3252]/60 flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                placeholder="ابحث، تنقل، أو اكتب (+ إضافة مهمة / ? تفريغ عقل)..."
                className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500 border-none ring-0 focus:ring-0"
              />
            </div>

            {/* Actions list */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filtered.map((act) => {
                const Icon = act.icon
                return (
                  <button
                    key={act.id}
                    onClick={() => handleAction(act)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#21253a] text-gray-300 hover:text-white transition-colors text-right"
                  >
                    <Icon className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold">{act.title}</span>
                  </button>
                )
              })}

              {query.trim() && (
                <button
                  onClick={handleCustomSubmit}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-indigo-500/10 text-indigo-400 hover:text-white transition-colors text-right"
                >
                  <span className="text-xs font-semibold">
                    {query.startsWith('+ ') ? 'إضافة مهمة سريعة' : query.startsWith('? ') ? 'تفريغ عقل سريع' : 'إضافة كالمهمة الأولى'}
                  </span>
                  <span className="text-[10px] bg-[#21253a] border border-[#2d3252] px-2 py-0.5 rounded text-gray-400 font-bold font-mono">
                    Enter
                  </span>
                </button>
              )}
            </div>

            {/* Helper Footer */}
            <div className="bg-[#141621] p-3 text-[10px] text-gray-500 border-t border-[#2d3252]/50 flex justify-between items-center px-4">
              <span>استخدم الأسهم للتنقل و <kbd className="bg-[#1a1d27] px-1 py-0.5 rounded border border-[#2d3252] font-mono">Enter</kbd> للاختيار</span>
              <span>اضغط <kbd className="bg-[#1a1d27] px-1 py-0.5 rounded border border-[#2d3252] font-mono">Esc</kbd> للخروج</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
