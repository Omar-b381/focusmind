import { useState } from 'react'
import { useFocusStore, TimerType } from '../stores/focus.store'
import { useAppStore } from '../stores/app.store'
import { formatTimer } from '../lib/formatters'
import { Play, Pause, Square, Sparkles, Coffee, BatteryCharging, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { CircularProgress } from '../components/ui/Progress'
import { useTasksQuery, useTaskQuery } from '../hooks/useTasks'
import Modal from '../components/ui/Modal'

export default function FocusMode() {
  const { status, elapsed, duration, type, start, pause, reset, setSession, addMinutes, taskId: storeTaskId } = useFocusStore()
  const { selectedTaskId, setSelectedTaskId } = useAppStore()

  // Use the ID from store or falls back to global selectedTaskId
  const activeTaskId = storeTaskId || selectedTaskId
  const { data: activeTask } = useTaskQuery(activeTaskId as number)
  const { data: tasks = [] } = useTasksQuery()

  // Modal selector state
  const [isSelectorOpen, setSelectorOpen] = useState(false)

  const timeRemaining = duration - elapsed
  const progressPercent = Math.min(100, Math.round((elapsed / duration) * 100))

  // Map timer types to details
  const sessionConfigs = [
    { type: 'focus' as TimerType, label: 'جلسة تركيز', icon: Sparkles, color: 'text-indigo-400', duration: 25 },
    { type: 'short_break' as TimerType, label: 'استراحة قصيرة', icon: Coffee, color: 'text-emerald-400', duration: 5 },
    { type: 'long_break' as TimerType, label: 'استراحة طويلة', icon: BatteryCharging, color: 'text-orange-400', duration: 15 }
  ]

  // Format timer status message
  const statusMessages = {
    idle: 'جاهز لبدء جلسة جديدة؟',
    running: 'أنت تبلي بلاءً حسناً، ركز الآن! 🚀',
    paused: 'المؤقت موقوف مؤقتاً.',
    finished: 'أحسنت! وقت المكافأة والدوبامين! 🎉'
  }

  const handleSelectTask = (id: number) => {
    setSelectedTaskId(id)
    setSession(type, duration / 60, id, tasks.find((t) => t.id === id)?.projectId)
    setSelectorOpen(false)
  }

  const handleClearTask = () => {
    setSelectedTaskId(null)
    setSession(type, duration / 60, null, null)
    setSelectorOpen(false)
  }

  const activeIncompleteTasks = tasks.filter((t) => t.status !== 'done')

  return (
    <div className="space-y-6 font-tajawal text-right flex flex-col items-center">
      {/* Session Type Selectors */}
      <div className="flex gap-2 p-1.5 bg-[#1a1d27] border border-[#2d3252]/50 rounded-2xl w-full max-w-md">
        {sessionConfigs.map((config) => {
          const Icon = config.icon
          const isActive = type === config.type
          return (
            <button
              key={config.type}
              onClick={() => setSession(config.type, config.duration, activeTaskId, activeTask?.projectId)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
        {/* Left Side: Session details & Task Picker */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-cairo">مهمة الجلسة الحالية</h3>
            <p className="text-xs text-gray-400">تحديد مهمة للتركيز عليها يساعدك على تتبع إنجازك.</p>
            
            {activeTask ? (
              <div className="p-3.5 bg-[#141621] border border-[#2d3252] rounded-xl flex items-center justify-between gap-2">
                <span className="text-xs text-white font-medium truncate">{activeTask.title}</span>
                <span className="text-[10px] text-indigo-400 font-bold shrink-0">نشط 🎯</span>
              </div>
            ) : (
              <div className="p-3.5 bg-[#141621] border border-[#2d3252]/40 border-dashed rounded-xl text-center text-xs text-gray-400 font-tajawal">
                لا توجد مهمة محددة لهذه الجلسة
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-tajawal"
                onClick={() => setSelectorOpen(true)}
              >
                {activeTask ? 'تغيير المهمة' : 'اختر مهمة للتركيز'}
              </Button>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-white font-cairo">نصيحة تركيز ذكية</h3>
            <div className="text-xs text-indigo-300 leading-relaxed space-y-2">
              <p>📍 ضع هاتفك بعيداً عن نظرك تماماً.</p>
              <p>📍 جهز كوب ماء بجانبك قبل البدء.</p>
              <p>📍 إذا خطرت ببالك أي فكرة عشوائية، أفرغها في نافذة &quot;تفريغ العقل&quot; فوراً لمتابعة التركيز.</p>
            </div>
          </Card>
        </div>

        {/* Right Side (Large 2 cols): Circular Timer */}
        <Card className="lg:col-span-2 p-8 flex flex-col items-center justify-center gap-6 border-indigo-500/10 min-h-[420px]">
          <div className="relative h-64 w-64 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <CircularProgress
              value={progressPercent}
              size={240}
              strokeWidth={12}
              color={type === 'focus' ? 'primary' : type === 'short_break' ? 'success' : 'dopamine'}
            />
            {/* Timer Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-3xl font-mono text-white font-bold tracking-wider ltr">
                {formatTimer(timeRemaining)}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-cairo">
                {status === 'running' ? 'جارٍ التركيز' : status === 'paused' ? 'موقوف' : 'مستعد'}
              </span>
            </div>
          </div>

          {/* Feedback message */}
          <p className="text-sm font-medium text-indigo-300/90 text-center font-tajawal min-h-[20px]">
            {statusMessages[status]}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center">
            <Button
              variant="secondary"
              onClick={() => addMinutes(5)}
              className="text-xs h-10 px-4 font-tajawal"
            >
              + 5 دقائق
            </Button>

            {status === 'running' ? (
              <Button
                variant="danger"
                onClick={pause}
                icon={<Pause className="h-4.5 w-4.5" />}
                className="h-12 px-6"
              >
                إيقاف مؤقت
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={start}
                icon={<Play className="h-4.5 w-4.5" />}
                className="h-12 px-6"
              >
                بدء الجلسة
              </Button>
            )}

            {(status === 'running' || status === 'paused') && (
              <Button
                variant="secondary"
                onClick={reset}
                icon={<Square className="h-4 w-4" />}
                className="h-12 w-12 rounded-xl flex items-center justify-center p-0"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Task Selector Modal */}
      <Modal
        isOpen={isSelectorOpen}
        onClose={() => setSelectorOpen(false)}
        title="اختر مهمة للتركيز عليها 🎯"
        size="md"
      >
        <div className="space-y-4 text-right font-tajawal">
          <p className="text-xs text-gray-400">
            اختر مهمة واحدة لتربطها بجلسة التركيز الحالية لتوثيقها في إحصائياتك:
          </p>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {activeIncompleteTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-right ${
                  activeTaskId === task.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-[#2d3252]/50 bg-[#1a1d27]/40 text-gray-300 hover:border-[#2d3252] hover:bg-[#1a1d27]/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{task.title}</span>
                </div>
                {activeTaskId === task.id && <Check className="h-4 w-4 text-indigo-400" />}
              </button>
            ))}

            {activeIncompleteTasks.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-500">
                لا توجد مهام نشطة حالياً. أضف مهاماً أولاً!
              </div>
            )}
          </div>
          <div className="pt-2 flex justify-between gap-2 border-t border-[#2d3252]/40">
            <Button variant="ghost" onClick={handleClearTask} className="text-xs">
              بدون مهمة
            </Button>
            <Button variant="secondary" onClick={() => setSelectorOpen(false)} className="text-xs">
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
