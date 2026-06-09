import { useAppStore, ActiveTab } from '../../stores/app.store'
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen, 
  BookOpen,
  Timer, 
  CalendarRange, 
  Sparkles, 
  Award,
  Bot, 
  BarChart3, 
  Settings,
  Brain,
  Layers,
  GraduationCap,
  Network
} from 'lucide-react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'
import XPBar from '../gamification/XPBar'
import { useUserProfileQuery } from '../../hooks/useXP'

interface SidebarItem {
  id: ActiveTab
  label: string
  icon: React.ComponentType<any>
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'tasks', label: 'المهام اليومية', icon: CheckSquare },
  { id: 'projects', label: 'المشاريع', icon: FolderOpen },
  { id: 'learning', label: 'مسارات التعلم', icon: BookOpen },
  { id: 'flashcards', label: 'بطاقات التكرار 🃏', icon: Layers },
  { id: 'feynman', label: 'تقنية فاينمان 🎓', icon: GraduationCap },
  { id: 'knowledgeMap', label: 'خريطة المعرفة 🗺️', icon: Network },
  { id: 'focus', label: 'جلسة تركيز', icon: Timer },
  { id: 'habits', label: 'بناء العادات', icon: CalendarRange },
  { id: 'dopamine', label: 'قائمة الدوبامين', icon: Sparkles },
  { id: 'achievements', label: 'الأوسمة والـ XP', icon: Award },
  { id: 'coach', label: 'المرشد الذكي', icon: Bot },
  { id: 'analytics', label: 'الإحصائيات', icon: BarChart3 },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
]

export default function Sidebar() {
  const { activeTab, setActiveTab } = useAppStore()
  const { data: profile } = useUserProfileQuery()

  const userName = profile?.name || 'عمر'
  const userAvatar = profile?.avatar || '🧠'

  return (
    <aside className="w-64 h-screen bg-[#1a1d27]/90 border-l border-[#2d3252] flex flex-col justify-between shrink-0 glass z-10">
      <div className="flex flex-col h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#2d3252]/50 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center glow-primary">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide text-white font-cairo leading-none">FocusMind</h1>
            <span className="text-[10px] text-indigo-400 font-medium">لعقول الـ ADHD</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  'w-full relative flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none',
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#21253a]/50'
                )}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-indigo-500/20 border-r-2 border-indigo-500 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={clsx(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  isActive ? 'text-indigo-400' : 'text-gray-400'
                )} />
                <span className="font-tajawal text-right relative z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* User profile / Bottom bar with XP */}
      <div className="p-4 border-t border-[#2d3252]/50 bg-[#131620]/40 space-y-4 shrink-0">
        <XPBar />
        <div className="flex items-center gap-3">
          <Avatar name={userName} emoji={userAvatar} size="md" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white font-tajawal truncate">{userName}</p>
            <p className="text-xs text-indigo-400 font-tajawal leading-none">مستكشف التركيز</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
