import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Lock, Filter } from 'lucide-react'
import { useAchievementsQuery } from '../hooks/useAchievements'
import Card from '../components/ui/Card'

type CategoryFilter = 'all' | 'focus' | 'tasks' | 'habits' | 'consistency' | 'courage' | 'learning'

export default function Achievements() {
  const { data: achievements, isLoading } = useAchievementsQuery()
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')

  const categories: { key: CategoryFilter; name: string }[] = [
    { key: 'all', name: 'الكل' },
    { key: 'focus', name: 'التركيز ⏱️' },
    { key: 'tasks', name: 'المهام ✅' },
    { key: 'habits', name: 'العادات 🌿' },
    { key: 'learning', name: 'التعلم 📚' },
    { key: 'consistency', name: 'الالتزام 🔥' },
    { key: 'courage', name: 'الشجاعة ⚔️' }
  ]

  const totalCount = achievements?.length || 0
  const unlockedCount = achievements?.filter(a => a.isUnlocked).length || 0
  const unlockedPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  const filteredAchievements = achievements?.filter(a => {
    if (activeCategory === 'all') return true
    return a.category === activeCategory
  })

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-600/20 to-amber-500/20 border-yellow-500 text-yellow-400 shadow-yellow-500/10 shadow-md'
      case 'epic':
        return 'from-purple-600/20 to-indigo-500/20 border-purple-500 text-purple-400 shadow-purple-500/10'
      case 'rare':
        return 'from-blue-600/20 to-cyan-500/20 border-blue-500 text-blue-400 shadow-blue-500/10'
      default:
        return 'from-gray-800/40 to-dark-surface border-dark-border text-gray-400'
    }
  }

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'أسطوري 👑'
      case 'epic': return 'ملحمي 🌟'
      case 'rare': return 'نادر 💎'
      default: return 'شائع 🌱'
    }
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto font-cairo">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">أوسمة الإنجازات والـ XP 🏆</h1>
          <p className="text-gray-400 text-sm mt-1">احصل على مكافآت ونقاط XP لدوبامين طبيعي مستدام مع كل إنجاز</p>
        </div>

        {/* Global Progress Indicator */}
        <Card className="glass px-6 py-4 flex items-center gap-4 border-indigo-500/20 max-w-sm w-full md:w-auto">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/25">
            <Award className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="space-y-1 w-full">
            <div className="flex justify-between text-xs font-bold text-gray-200">
              <span>نسبة الأوسمة المفتوحة</span>
              <span className="text-indigo-400">{unlockedCount} / {totalCount} ({unlockedPct}%)</span>
            </div>
            <div className="w-32 md:w-48 h-2 bg-dark-surface rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${unlockedPct}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-dark-border pb-4">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeCategory === cat.key
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'bg-dark-surface border border-dark-border text-gray-400 hover:bg-dark-hover hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">جاري تحميل الأوسمة والإنجازات...</div>
      ) : !filteredAchievements || filteredAchievements.length === 0 ? (
        <Card className="glass p-12 text-center text-gray-400 border-dashed border-dark-border flex flex-col items-center justify-center space-y-3 h-[250px]">
          <Filter className="h-12 w-12 text-indigo-500/40" />
          <h3 className="text-lg font-bold text-white">لا توجد أوسمة بهذه الفئة</h3>
          <p className="text-sm">حاول التبديل إلى فئة أخرى لرؤية الأوسمة المتاحة.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((ach) => {
            const isSecret = ach.isHidden && !ach.isUnlocked
            const styleClass = getRarityStyle(ach.rarity)

            return (
              <motion.div
                key={ach.key}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card 
                  className={`relative p-5 overflow-hidden bg-gradient-to-br border ${styleClass} ${
                    ach.isUnlocked ? 'opacity-100' : 'opacity-60 bg-dark-bg/40'
                  }`}
                >
                  {/* Lock Indicator */}
                  {!ach.isUnlocked && (
                    <div className="absolute top-3 left-3 p-1.5 bg-dark-bg/60 border border-dark-border rounded-lg text-gray-500">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Rarity Tag */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-dark-bg/60 border border-dark-border font-mono">
                      {getRarityLabel(ach.rarity)}
                    </span>
                  </div>

                  <div className="flex gap-4 items-start mt-2">
                    <div className={`text-4xl p-3 rounded-2xl bg-dark-surface border border-dark-border shadow-inner ${
                      ach.isUnlocked ? 'animate-bounce-sm' : ''
                    }`}>
                      {isSecret ? '❓' : ach.emoji}
                    </div>

                    <div className="space-y-1 pr-1">
                      <h3 className="font-extrabold text-white text-base">
                        {isSecret ? 'وسام سري غامض' : (ach.nameAr || ach.name)}
                      </h3>
                      
                      <p className="text-xs text-gray-300 leading-relaxed font-tajawal">
                        {isSecret 
                          ? 'سيتم الكشف عن تفاصيل هذا الوسام والشروط بمجرد فتحه من خلال أداء مهامك اليومية.' 
                          : ach.descriptionAr}
                      </p>

                      <div className="flex items-center gap-2 pt-2 text-xs font-bold">
                        <span className="text-indigo-400 font-mono">+{ach.xpReward} XP</span>
                        {ach.isUnlocked && ach.unlockedAt && (
                          <span className="text-gray-500 font-normal">
                            فتح في {new Date(ach.unlockedAt).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Easter Egg Overlay background glow for unlocked legendaries */}
                  {ach.isUnlocked && ach.rarity === 'legendary' && (
                    <div className="absolute inset-0 bg-yellow-500/5 -z-10 mix-blend-overlay animate-pulse-soft pointer-events-none" />
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
