import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Flame, Timer, Trash2, CheckCircle2, Circle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'

interface MockTask {
  id: number
  title: string
  description?: string
  energyLevel: 'low' | 'medium' | 'high'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'inbox' | 'today' | 'in_progress' | 'done' | 'parked'
  estimatedMinutes: number
}

export default function Tasks() {
  const [tasks, setTasks] = useState<MockTask[]>([
    { id: 1, title: 'تجهيز عرض التصميم لعميل FocusMind', energyLevel: 'high', priority: 'high', status: 'today', estimatedMinutes: 25 },
    { id: 2, title: 'الرد على الإيميلات المعلقة', energyLevel: 'low', priority: 'low', status: 'inbox', estimatedMinutes: 10 },
    { id: 3, title: 'كتابة التقرير الأسبوعي للمبيعات', energyLevel: 'medium', priority: 'medium', status: 'inbox', estimatedMinutes: 30 },
    { id: 4, title: 'تمارين تمدد رياضية خفيفة', energyLevel: 'low', priority: 'low', status: 'done', estimatedMinutes: 5 },
  ])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskEnergy, setNewTaskEnergy] = useState<'low' | 'medium' | 'high'>('medium')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'inbox' | 'done'>('all')

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    const task: MockTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      energyLevel: newTaskEnergy,
      priority: newTaskPriority,
      status: 'inbox',
      estimatedMinutes: newTaskEnergy === 'low' ? 10 : newTaskEnergy === 'medium' ? 25 : 50,
    }
    setTasks([task, ...tasks])
    setNewTaskTitle('')
  }

  const toggleTaskStatus = (id: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'done' ? 'inbox' : 'done'
          return { ...t, status: nextStatus }
        }
        return t
      })
    )
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'today') return t.status === 'today'
    if (activeFilter === 'inbox') return t.status === 'inbox'
    if (activeFilter === 'done') return t.status === 'done'
    return true
  })

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

      {/* Quick Add Form */}
      <Card className="p-4 border-[#2d3252]/50">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
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
              icon={<Plus className="h-5 w-5" />}
            >
              إضافة
            </Button>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
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
                    onClick={() => toggleTaskStatus(task.id)}
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
                  <Badge category="priority" value={task.priority} />
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            لا توجد مهام مطابقة للمرشحات الحالية. 🚀
          </div>
        )}
      </div>
    </div>
  )
}
