import { useXPStore } from '../../stores/xp.store'
import { Award } from 'lucide-react'

export default function XPBar() {
  const { totalXP, level } = useXPStore()
  
  // Calculate progress matching the Level * 100 cumulative XP progression
  const xpForPrevLevels = (level - 1) * level * 50
  const xpForLevel = level * 100
  const currentXPInLevel = Math.max(0, totalXP - xpForPrevLevels)
  const percent = Math.min(100, Math.max(0, Math.round((currentXPInLevel / xpForLevel) * 100)))

  return (
    <div className="space-y-2 font-cairo">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 text-gray-200">
          <Award className="h-4 w-4 text-indigo-400" />
          <span className="font-bold">المستوى {level}</span>
        </div>
        <span className="text-gray-400 font-mono text-[10px]">
          {currentXPInLevel} / {xpForLevel} XP
        </span>
      </div>

      <div className="relative w-full h-2.5 bg-dark-bg border border-dark-border rounded-full overflow-hidden">
        {/* Glowing track */}
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-500 rounded-full" 
          style={{ width: `${percent}%` }}
        />
        {/* Subtle glass overlay reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>

      <div className="flex justify-between text-[9px] text-gray-500 font-mono">
        <span>{xpForPrevLevels} XP</span>
        <span>{percent}%</span>
        <span>{xpForPrevLevels + xpForLevel} XP</span>
      </div>
    </div>
  )
}
