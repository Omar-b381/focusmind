import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Flame, Timer, Trash2, CheckCircle2, Circle, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useSuggestNextTaskQuery,
  useBreakdownTaskMutation
} from '../hooks/useTasks'
import Modal from '../components/ui/Modal'

export default function Tasks() {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskEnergy, setNewTaskEnergy] = useState<'low' | 'medium' | 'high'>('medium')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'inbox' | 'done'>('all')
  const [breakingTaskId, setBreakingTaskId] = useState<number | null>(null)
  const [breakdownSteps, setBreakdownSteps] = useState<{ title: string; done: boolean }[]>([])

  // TanStack Query Hooks
  const { data: tasks = [], isLoading, isError } = useTasksQuery(
    activeFilter !== 'all' ? { status: activeFilter } : undefined
  )
  const { data: suggestedTask, refetch: refetchSuggested } = useSuggestNextTaskQuery()

  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()
  const deleteTaskMutation = useDeleteTaskMutation()
  const breakdownMutation = useBreakdownTaskMutation()

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    createTaskMutation.mutate({
      title: newTaskTitle.trim(),
      energyLevel: newTaskEnergy,
      priority: newTaskPriority,
      status: activeFilter === 'today' ? 'today' : 'inbox',
      estimatedMinutes: newTaskEnergy === 'low' ? 10 : newTaskEnergy === 'medium' ? 25 : 50,
      tags: '[]'
    })
    setNewTaskTitle('')
  }

  const toggleTaskStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'inbox' : 'done'
    updateTaskMutation.mutate({
      id,
      updates: {
        status: nextStatus,
        completedAt: nextStatus === 'done' ? new Date() : null
      }
    })
  }

  const handleDeleteTask = (id: number) => {
    deleteTaskMutation.mutate(id)
  }

  const handleBreakdown = async (id: number) => {
    setBreakingTaskId(id)
    try {
      const result = await breakdownMutation.mutateAsync(id)
      setBreakdownSteps(result.steps)
    } catch (err) {
      console.error(err)
      setBreakingTaskId(null)
    }
  }

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white font-cairo">المهام اليومية</h2>
        <div className="flex gap-2">
          {(['all', 'inbox', 'today', 'done'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-[#1a1d27] border border-[#2d3252]/50 text-gray-400 hover:text-gray-200'
              }`}
            >
              {filter === 'all' && 'الكل'}
              {filter === 'inbox' && 'صندوق الوارد'}
              {filter === 'today' && 'اليوم'}
              {filter === 'done' && 'المنجزة'}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Task Banner (ADHD Smart Suggestion) */}
      {suggestedTask && activeFilter !== 'done' && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/[0.03] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -translate-x-6 -translate-y-6" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 shrink-0 mt-0.5 animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200 font-cairo">توصية الذكاء الاصطناعي لبدء التركيز:</h3>
                <p className="text-xs text-gray-300 mt-1 font-tajawal">{suggestedTask.title}</p>
                <div className="flex gap-2 items-center text-[10px] text-gray-400 mt-2">
                  <span className="flex items-center gap-0.5">
                    <Flame className="h-3 w-3 text-orange-400" />
                    طاقة: {suggestedTask.energyLevel === 'low' ? 'منخفضة' : suggestedTask.energyLevel === 'medium' ? 'متوسطة' : 'عالية'}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Timer className="h-3 w-3 text-indigo-400" />
                    المدة: {suggestedTask.estimatedMinutes} دقيقة
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 self-end md:self-center">
              <Button
                variant="dopamine"
                size="sm"
                onClick={() => toggleTaskStatus(suggestedTask.id, suggestedTask.status)}
              >
                ابدأ أو أنجز الآن ✨
              </Button>
              <button
                onClick={() => refetchSuggested()}
                className="p-2 hover:bg-[#1a1d27] rounded-xl text-gray-400 hover:text-white transition-colors"
                title="اقتراح آخر"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Add Form */}
      <Card className="p-4 border-[#2d3252]/50">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full text-right">
            <Input
              label="أضف مهمة جديدة للتركيز..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {/* Energy Selector */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[10px] text-gray-400 font-semibold mr-1">الطاقة المطلوبة</label>
              <select
                value={newTaskEnergy}
                onChange={(e) => setNewTaskEnergy(e.target.value as any)}
                className="h-11 px-3 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="low">🔋 منخفضة (10 د)</option>
                <option value="medium">⚡ متوسطة (25 د)</option>
                <option value="high">🔥 عالية (50 د)</option>
              </select>
            </div>
            {/* Priority Selector */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[10px] text-gray-400 font-semibold mr-1">الأهمية</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="h-11 px-3 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="low">عادية</option>
                <option value="medium">متوسطة</option>
                <option value="high">مهمة</option>
                <option value="urgent">عاجلة 🚨</option>
              </select>
            </div>
            <Button
              variant="primary"
              onClick={handleAddTask}
              className="h-11 shrink-0"
              isLoading={createTaskMutation.isPending}
              icon={<Plus className="h-5 w-5" />}
            >
              إضافة
            </Button>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
            جاري تحميل المهام...
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-400 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            حدث خطأ أثناء تحميل المهام.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                layout
              >
                <Card className={`p-4 flex items-center justify-between transition-all ${task.status === 'done' ? 'opacity-60 border-emerald-500/20 bg-emerald-500/[0.02]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="text-gray-500 hover:text-indigo-400 transition-colors"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="space-y-0.5">
                      <h4 className={`text-sm font-bold font-tajawal ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <div className="flex gap-2 items-center text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <Flame className="h-3 w-3 text-orange-400" />
                          طاقة: {task.energyLevel === 'low' ? 'منخفضة' : task.energyLevel === 'medium' ? 'متوسطة' : 'عالية'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Timer className="h-3 w-3 text-indigo-400" />
                          المدة: {task.estimatedMinutes} دقيقة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {task.status !== 'done' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded-lg h-8 px-2"
                        onClick={() => handleBreakdown(task.id)}
                        isLoading={breakingTaskId === task.id && breakdownMutation.isPending}
                        icon={<Sparkles className="h-3.5 w-3.5" />}
                      >
                        تفكيك بالذكاء الاصطناعي 🧠
                      </Button>
                    )}
                    <Badge category="priority" value={task.priority} />
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            لا توجد مهام مطابقة للمرشحات الحالية. 🚀
          </div>
        )}
      </div>

      {/* AI Breakdown Steps Modal */}
      <Modal
        isOpen={breakingTaskId !== null && breakdownSteps.length > 0}
        onClose={() => {
          setBreakingTaskId(null)
          setBreakdownSteps([])
        }}
        title="تفكيك المهمة لخطوات دوبامينية متناهية الصغر 🧠"
        size="md"
      >
        <div className="space-y-4 text-right">
          <p className="text-xs text-gray-400 leading-relaxed">
            السر في بدء المهام الصعبة لعقول الـ ADHD هو تفكيكها لخطوات سهلة وجذابة لا يمكن للمخ الهرب منها. إليك خطة التفكيك المقترحة:
          </p>
          <div className="space-y-2">
            {breakdownSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#2d3252]/60 bg-[#1a1d27]/40 text-sm text-gray-200"
              >
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                  {idx + 1}
                </div>
                <div>{step.title}</div>
              </div>
            ))}
          </div>
          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              onClick={() => {
                setBreakingTaskId(null)
                setBreakdownSteps([])
              }}
            >
              جاهز للبدء! 👍
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
