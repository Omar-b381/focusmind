import { useState } from 'react'
import { Plus, Flame, Award, Calendar, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

interface MockHabit {
  id: number
  name: string
  emoji: string
  description?: string
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  dopamineBoost: number
  completedToday: boolean
}

export default function Habits() {
  const [habits, setHabits] = useState<MockHabit[]>([
    { id: 1, name: 'شرب 2 لتر ماء', emoji: '💧', description: 'ترطيب الجسم طوال اليوم لتجنب الصداع وتشتت الانتباه', currentStreak: 5, longestStreak: 12, totalCompletions: 34, dopamineBoost: 5, completedToday: true },
    { id: 2, name: 'مشي خفيف 10 دقائق', emoji: '🚶', description: 'تنشيط الدورة الدموية ومستويات الدوبامين قبل الشغل', currentStreak: 2, longestStreak: 8, totalCompletions: 15, dopamineBoost: 10, completedToday: false },
    { id: 3, name: 'قراءة 5 صفحات كتاب', emoji: '📖', description: 'تنمية العقل وبناء عادة القراءة المنتظمة', currentStreak: 0, longestStreak: 4, totalCompletions: 5, dopamineBoost: 8, completedToday: false },
  ])

  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitEmoji, setNewHabitEmoji] = useState('✅')
  const [newHabitDopamine, setNewHabitDopamine] = useState(5)

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return
    const habit: MockHabit = {
      id: Date.now(),
      name: newHabitName.trim(),
      emoji: newHabitEmoji,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      dopamineBoost: newHabitDopamine,
      completedToday: false
    }
    setHabits([...habits, habit])
    setNewHabitName('')
  }

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          const completed = !h.completedToday
          return {
            ...h,
            completedToday: completed,
            currentStreak: completed ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            totalCompletions: completed ? h.totalCompletions + 1 : Math.max(0, h.totalCompletions - 1),
          }
        }
        return h
      })
    )
  }

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white font-cairo">بناء العادات</h2>
      </div>

      {/* Quick Add Habit */}
      <Card className="p-4 border-[#2d3252]/50">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input
              label="اسم العادة الجديدة..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 mr-1">الأيقونة</label>
              <input
                type="text"
                value={newHabitEmoji}
                onChange={(e) => setNewHabitEmoji(e.target.value)}
                className="h-11 w-14 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-lg outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 mr-1">نقاط الدوبامين</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newHabitDopamine}
                onChange={(e) => setNewHabitDopamine(Number(e.target.value))}
                className="h-11 w-20 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-xs outline-none"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAddHabit}
              className="h-11 shrink-0"
              icon={<Plus className="h-5 w-5" />}
            >
              إنشاء عادة
            </Button>
          </div>
        </div>
      </Card>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <Card
            key={habit.id}
            className={`p-5 flex flex-col justify-between border ${
              habit.completedToday
                ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                : 'border-[#2d3252]/50 bg-[#1a1d27]'
            }`}
          >
            <div className="flex gap-4 items-start">
              {/* Checkmark Button */}
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all ${
                  habit.completedToday
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'border-[#2d3252] text-gray-500 hover:border-gray-400'
                }`}
              >
                {habit.completedToday ? <Check className="h-5 w-5 stroke-[3]" /> : <span className="text-xl">{habit.emoji}</span>}
              </button>
              
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-white font-cairo">{habit.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold font-tajawal">
                    +{habit.dopamineBoost} دوبامين
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {habit.description || 'لا يوجد وصف لهذه العادة.'}
                </p>
              </div>
            </div>

            {/* Streak metrics */}
            <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#2d3252]/50 text-xs text-gray-400">
              <div className="flex gap-1 items-center">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>الستريك الحالي:</span>
                <span className="font-extrabold text-white">{habit.currentStreak} يوم</span>
              </div>
              <div className="flex gap-1 items-center">
                <Award className="h-4 w-4 text-indigo-400" />
                <span>الأطول:</span>
                <span className="font-semibold text-white">{habit.longestStreak} يوم</span>
              </div>
              <div className="flex gap-1 items-center">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>الإجمالي:</span>
                <span className="font-semibold text-white">{habit.totalCompletions} مرة</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
