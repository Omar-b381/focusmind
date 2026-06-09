import { motion } from 'framer-motion'
import { useAppStore } from '../stores/app.store'
import { Sparkles, CheckCircle, Flame, Timer, RefreshCw } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useSuggestNextTaskQuery, useTasksQuery } from '../hooks/useTasks'
import { useAnalyticsQuery } from '../hooks/useAnalytics'
import { useHabitsQuery, useHabitLogsQuery, useToggleHabitMutation } from '../hooks/useHabits'

export default function Dashboard() {
  const { setActiveTab } = useAppStore()

  // TanStack Query Hooks
  const { data: suggestedTask, isLoading: isTaskLoading } = useSuggestNextTaskQuery()
  const { data: stats } = useAnalyticsQuery('week')
  
  const { data: habits = [], isLoading: isHabitsLoading } = useHabitsQuery()
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: habitLogs = [] } = useHabitLogsQuery(todayStr, todayStr)
  const toggleHabitMutation = useToggleHabitMutation()

  const isCompletedToday = (habitId: number) => {
    return habitLogs.some((l) => l.habitId === habitId && l.completed)
  }

  const handleToggleHabit = (habitId: number) => {
    const isCompleted = isCompletedToday(habitId)
    toggleHabitMutation.mutate({
      habitId,
      date: todayStr,
      completed: !isCompleted
    })
  }

  // Fallback "One Thing" if no specific recommended task is returned
  const { data: tasks = [] } = useTasksQuery()
  const highestPriorityTask = tasks.find(t => t.status !== 'done')

  const currentFocusTask = suggestedTask || highestPriorityTask

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 font-tajawal text-right"
    >
      {/* AI Coach Welcome / Tip */}
      <motion.div variants={itemVariants}>
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 glass overflow-hidden flex items-start gap-4">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 glow-primary">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-base font-bold text-white font-cairo">المرشد الذكي</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              &quot;أهلاً بك يا عمر. تذكر، عقل الـ ADHD ليس معيباً، هو فقط يعمل بطريقة مختلفة. اليوم سنركز على إنجاز مهمة واحدة رئيسية، ولا داعي للقلق بشأن المهام الأخرى.&quot;
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: One Thing & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: One Thing Rule */}
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col">
          <Card variant="elevated" className="flex-1 border-indigo-500/30 p-6 flex flex-col justify-between min-h-[300px]">
            {isTaskLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : currentFocusTask ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-indigo-400 font-semibold tracking-wider font-cairo">قاعدة المهمة الواحدة (One Thing)</span>
                  <Badge category="priority" value={currentFocusTask.priority} />
                </div>
                <h2 className="text-xl font-extrabold text-white font-cairo mb-3">
                  {currentFocusTask.title}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  {currentFocusTask.description || 'هذه هي المهمة الأكثر أهمية اليوم. ركز عليها أولاً لرفع مستويات الدوبامين والشعور بالإنجاز المبكر.'}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-indigo-400 font-semibold tracking-wider font-cairo">قاعدة المهمة الواحدة (One Thing)</span>
                </div>
                <h2 className="text-xl font-extrabold text-white font-cairo mb-3">
                  لا توجد مهام نشطة حالياً
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  رائع! عقلك صافٍ ومستعد. قم بإضافة مهمة جديدة لتبدأ إنجازاتك اليوم.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => setActiveTab('focus')}
                disabled={!currentFocusTask}
                icon={<Timer className="h-4.5 w-4.5" />}
              >
                بدء التركيز ⏱️
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('tasks')}
              >
                تصفح باقي المهام
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Right Col: Stats & Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Energy Widget */}
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-cairo">طاقتك اليوم</h4>
                <p className="text-xs text-gray-400">متوسطة — مناسب للمهام المتوسطة</p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-orange-400 font-cairo">3 / 5</span>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <Timer className="h-5 w-5 text-indigo-400" />
              <span className="text-xs text-gray-400 font-tajawal">وقت التركيز</span>
              <span className="text-lg font-bold text-white font-cairo">
                {stats?.focusMinutes || 0} دقيقة
              </span>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-gray-400 font-tajawal">المهام المنجزة</span>
              <span className="text-lg font-bold text-white font-cairo">
                {stats?.tasksCompleted || 0} مهام
              </span>
            </Card>
          </div>

          {/* Dopamine Boost Card */}
          <Card className="p-4 border-orange-500/20 bg-gradient-to-tr from-orange-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-cairo">تحتاج دفعة دوبامين؟</h4>
                <p className="text-xs text-gray-400">ابدأ بنشاط 2 دقيقة لتنشيط ذهنك</p>
              </div>
            </div>
            <Button
              variant="dopamine"
              size="sm"
              onClick={() => setActiveTab('dopamine')}
              className="px-3 py-1.5 text-xs h-8"
            >
              دوبامين ⚡
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Today's Habits Section */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-base font-bold text-white font-cairo">عادات اليوم السريعة</h3>
        {isHabitsLoading ? (
          <div className="text-center py-6">
            <RefreshCw className="h-5 w-5 animate-spin text-indigo-500 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {habits.slice(0, 3).map((habit) => {
              const completed = isCompletedToday(habit.id)
              return (
                <Card
                  key={habit.id}
                  className={`p-4 flex items-center justify-between transition-all border ${
                    completed
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-[#2d3252]/50'
                  }`}
                >
                  <span className="text-sm font-medium text-white">
                    {habit.emoji} {habit.name}
                  </span>
                  {completed ? (
                    <span className="text-xs text-emerald-400 font-medium font-tajawal">مكتملة ✅</span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 py-0 px-3 text-xs"
                      onClick={() => handleToggleHabit(habit.id)}
                      isLoading={toggleHabitMutation.isPending}
                    >
                      تحديد كمكتمل
                    </Button>
                  )}
                </Card>
              )
            })}
            
            {habits.length === 0 && (
              <div className="col-span-3 text-center py-6 text-xs text-gray-500">
                لا توجد عادات مضافة بعد. أضف بعض العادات لتتبعها هنا!
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
