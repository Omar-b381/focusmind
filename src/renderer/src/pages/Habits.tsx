import { useState } from 'react'
import { Plus, Flame, Award, Calendar, Check, RefreshCw } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import {
  useHabitsQuery,
  useCreateHabitMutation,
  useToggleHabitMutation,
  useHabitLogsQuery
} from '../hooks/useHabits'

export default function Habits() {
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [newHabitEmoji, setNewHabitEmoji] = useState('✅')
  const [newHabitDopamine, setNewHabitDopamine] = useState(5)

  // TanStack Query Hooks
  const { data: habits = [], isLoading, isError } = useHabitsQuery()
  
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: habitLogs = [] } = useHabitLogsQuery(todayStr, todayStr)

  const createHabitMutation = useCreateHabitMutation()
  const toggleHabitMutation = useToggleHabitMutation()

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return
    createHabitMutation.mutate({
      name: newHabitName.trim(),
      description: newHabitDescription.trim(),
      emoji: newHabitEmoji,
      dopamineBoost: newHabitDopamine,
      frequency: 'daily',
      energyRequired: 'low',
      isActive: true,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0
    })
    setNewHabitName('')
    setNewHabitDescription('')
  }

  const handleToggleHabit = (habitId: number) => {
    const isCompleted = isCompletedToday(habitId)
    toggleHabitMutation.mutate({
      habitId,
      date: todayStr,
      completed: !isCompleted
    })
  }

  const isCompletedToday = (habitId: number) => {
    return habitLogs.some((l) => l.habitId === habitId && l.completed)
  }

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white font-cairo">بناء العادات</h2>
      </div>

      {/* Quick Add Habit */}
      <Card className="p-4 border-[#2d3252]/50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Input
                label="اسم العادة الجديدة..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
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
                <label className="text-[10px] text-gray-400 mr-1">الدوبامين</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newHabitDopamine}
                  onChange={(e) => setNewHabitDopamine(Number(e.target.value))}
                  className="h-11 w-20 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-xs outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Input
                label="وصف العادة الجديدة..."
                value={newHabitDescription}
                onChange={(e) => setNewHabitDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAddHabit}
              className="h-11 shrink-0 w-full md:w-auto"
              isLoading={createHabitMutation.isPending}
              icon={<Plus className="h-5 w-5" />}
            >
              إنشاء عادة
            </Button>
          </div>
        </div>
      </Card>

      {/* Habits List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          جاري تحميل العادات...
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-400 text-sm">
          حدث خطأ أثناء تحميل قائمة العادات.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const completed = isCompletedToday(habit.id)
            return (
              <Card
                key={habit.id}
                className={`p-5 flex flex-col justify-between border transition-all ${
                  completed
                    ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                    : 'border-[#2d3252]/50 bg-[#1a1d27]'
                }`}
              >
                <div className="flex gap-4 items-start">
                  {/* Checkmark Button */}
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all ${
                      completed
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'border-[#2d3252] text-gray-500 hover:border-gray-400 hover:bg-[#21253a]'
                    }`}
                  >
                    {completed ? <Check className="h-5 w-5 stroke-[3]" /> : <span className="text-xl">{habit.emoji}</span>}
                  </button>
                  
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-white font-cairo">{habit.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold font-tajawal">
                        +{habit.dopamineBoost} نقاط
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
                    <span className="font-extrabold text-white">{habit.currentStreak || 0} يوم</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Award className="h-4 w-4 text-indigo-400" />
                    <span>الأطول:</span>
                    <span className="font-semibold text-white">{habit.longestStreak || 0} يوم</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>الإجمالي:</span>
                    <span className="font-semibold text-white">{habit.totalCompletions || 0} مرة</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
