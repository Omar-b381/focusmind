import { useState } from 'react'
import { useFocusStore, TimerType } from '../stores/focus.store'
import { useAppStore } from '../stores/app.store'
import { formatTimer } from '../lib/formatters'
import { Play, Pause, Square, Sparkles, Coffee, BatteryCharging, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { CircularProgress } from '../components/ui/Progress'
import { useTasksQuery, useTaskQuery, useUpdateTaskMutation } from '../hooks/useTasks'
import { useTracksQuery, useLessonsQuery, useUpdateLessonMutation } from '../hooks/useLearningTracks'
import { useAddXPMutation } from '../hooks/useXP'
import Modal from '../components/ui/Modal'

export default function FocusMode() {
  const { 
    status, 
    elapsed, 
    duration, 
    type, 
    start, 
    pause, 
    reset, 
    setSession, 
    addMinutes, 
    taskId: storeTaskId,
    learningTrackId: storeLearningTrackId,
    lessonId: storeLessonId
  } = useFocusStore()
  const { selectedTaskId, setSelectedTaskId } = useAppStore()

  // Use the ID from store or falls back to global selectedTaskId
  const activeTaskId = storeTaskId || selectedTaskId
  const { data: activeTask } = useTaskQuery(activeTaskId as number)
  const { data: tasks = [] } = useTasksQuery()
  const { data: tracks = [] } = useTracksQuery()

  const activeTrack = tracks.find((t) => t.id === activeTask?.learningTrackId)

  // Fetch lessons for the store's track if lessonId is active
  const { data: activeTrackLessons = [] } = useLessonsQuery(storeLearningTrackId as number)
  const activeLesson = storeLessonId ? activeTrackLessons.find((l) => l.id === storeLessonId) : null
  const activeTrackForLesson = storeLearningTrackId ? tracks.find((t) => t.id === storeLearningTrackId) : null

  // Modal selector state
  const [isSelectorOpen, setSelectorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'lessons'>('tasks')
  const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null)

  const updateLessonMutation = useUpdateLessonMutation(storeLearningTrackId as number)
  const updateTaskMutation = useUpdateTaskMutation()
  const addXPMutation = useAddXPMutation()

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
    const task = tasks.find((t) => t.id === id)
    setSession(type, duration / 60, id, task?.projectId, task?.learningTrackId, null)
    setSelectorOpen(false)
  }

  const handleSelectLesson = (lessonId: number, trackId: number) => {
    setSelectedTaskId(null)
    setSession(type, duration / 60, null, null, trackId, lessonId)
    setSelectorOpen(false)
  }

  const handleClearTask = () => {
    setSelectedTaskId(null)
    setSession(type, duration / 60, null, null, null, null)
    setSelectorOpen(false)
  }

  const handleMarkActiveLessonCompleted = () => {
    if (!storeLessonId || !storeLearningTrackId) return
    updateLessonMutation.mutate({
      id: storeLessonId,
      updates: { status: 'done', completedAt: new Date() }
    }, {
      onSuccess: () => {
        addXPMutation.mutate({
          amount: 15,
          reason: `إكمال درس: ${activeLesson?.title || 'الدرس'}`,
          refId: storeLessonId,
          refType: 'lesson_done'
        })
        reset()
      }
    })
  }

  const handleMarkActiveTaskCompleted = () => {
    const activeId = storeTaskId || selectedTaskId
    if (!activeId) return
    updateTaskMutation.mutate({
      id: activeId,
      updates: { status: 'done', completedAt: new Date() }
    }, {
      onSuccess: () => {
        reset()
      }
    })
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
              onClick={() => setSession(config.type, config.duration, activeTaskId, activeTask?.projectId, activeTask?.learningTrackId, storeLessonId)}
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
        {/* Left Side: Session details & Target Picker */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-cairo">هدف الجلسة الحالية</h3>
            <p className="text-xs text-gray-400">تحديد مهمة أو درس للتركيز عليه يساعدك على تتبع إنجازك.</p>
            
            {activeTask ? (
              <div className="p-3.5 bg-[#141621] border border-[#2d3252] rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white font-medium truncate">{activeTask.title}</span>
                  <span className="text-[10px] text-indigo-400 font-bold shrink-0">نشط 🎯</span>
                </div>
                {activeTrack && (
                  <div className="flex items-center gap-1.5 text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg w-fit font-cairo">
                    <span>{activeTrack.emoji}</span>
                    <span>{activeTrack.title}</span>
                  </div>
                )}
              </div>
            ) : activeLesson ? (
              <div className="p-3.5 bg-[#141621] border border-[#2d3252] rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white font-medium truncate">{activeLesson.title}</span>
                  <span className="text-[10px] text-orange-400 font-bold shrink-0">درس نشط 📖</span>
                </div>
                {activeTrackForLesson && (
                  <div className="flex items-center gap-1.5 text-[10px] bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-0.5 rounded-lg w-fit font-cairo">
                    <span>{activeTrackForLesson.emoji}</span>
                    <span>{activeTrackForLesson.title}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-[#141621] border border-[#2d3252]/40 border-dashed rounded-xl text-center text-xs text-gray-400 font-tajawal">
                لا توجد مهمة أو درس محدد لهذه الجلسة
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-tajawal"
                onClick={() => setSelectorOpen(true)}
              >
                {activeTask || activeLesson ? 'تغيير الهدف' : 'اختر هدفاً للتركيز'}
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
              showLabel={false}
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

          {/* Active Target Completion Panel */}
          {status === 'finished' && storeLessonId && activeLesson && activeLesson.status !== 'done' && (
            <div className="w-full max-w-md p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-3 animate-fade-in text-center">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-400 font-cairo">تم إنهاء جلسة الدراسة بنجاح! 🎓</h4>
                <p className="text-xs text-gray-300">هل أكملت الدرس بالكامل وتريد تسجيل تقدمك؟</p>
              </div>
              <div className="flex gap-2 w-full justify-center">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 text-xs font-cairo"
                  onClick={handleMarkActiveLessonCompleted}
                  isLoading={updateLessonMutation.isPending}
                  icon={<Check className="h-4 w-4" />}
                >
                  نعم، تم إكمال الدرس (+15 XP)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs font-tajawal"
                  onClick={() => reset()}
                >
                  تخطي الآن
                </Button>
              </div>
            </div>
          )}

          {status === 'finished' && activeTask && activeTask.status !== 'done' && (
            <div className="w-full max-w-md p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex flex-col items-center gap-3 animate-fade-in text-center">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-indigo-400 font-cairo">تم إنهاء جلسة التركيز بنجاح! 🎯</h4>
                <p className="text-xs text-gray-300">هل أنجزت هذه المهمة بالكامل وتريد تعليمها كمكتملة؟</p>
              </div>
              <div className="flex gap-2 w-full justify-center">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 text-xs font-cairo"
                  onClick={handleMarkActiveTaskCompleted}
                  isLoading={updateTaskMutation.isPending}
                  icon={<Check className="h-4 w-4" />}
                >
                  نعم، المهمة مكتملة
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs font-tajawal"
                  onClick={() => reset()}
                >
                  تخطي الآن
                </Button>
              </div>
            </div>
          )}

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

      {/* Target Selector Modal */}
      <Modal
        isOpen={isSelectorOpen}
        onClose={() => setSelectorOpen(false)}
        title="اختر هدفاً للتركيز عليه 🎯"
        size="md"
      >
        <div className="space-y-4 text-right font-tajawal">
          {/* Tab Headers */}
          <div className="flex border-b border-dark-border gap-2">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 pb-2 text-sm font-bold border-b-2 text-center transition-all ${
                activeTab === 'tasks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400'
              }`}
            >
              المهام النشطة 🎯
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 pb-2 text-sm font-bold border-b-2 text-center transition-all ${
                activeTab === 'lessons' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400'
              }`}
            >
              مسارات الدراسة والدروس 📖
            </button>
          </div>

          {activeTab === 'tasks' ? (
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
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {tracks.map((track) => (
                <div key={track.id} className="border border-[#2d3252]/40 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedTrackId(expandedTrackId === track.id ? null : track.id)}
                    className="w-full flex items-center justify-between p-3 bg-[#1a1d27]/40 hover:bg-[#1a1d27]/70 text-right transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{track.emoji || '📚'}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">{track.title}</span>
                        <span className="text-[10px] text-gray-400 block font-cairo">التقدم: {track.completedLessons}/{track.totalLessons} درس</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-indigo-400 font-bold shrink-0">
                      {expandedTrackId === track.id ? 'إغلاق الدروس' : 'عرض الدروس ▾'}
                    </span>
                  </button>
                  {expandedTrackId === track.id && (
                    <TrackLessonsList
                      trackId={track.id}
                      activeLessonId={storeLessonId}
                      onSelectLesson={(lessonId) => handleSelectLesson(lessonId, track.id)}
                    />
                  )}
                </div>
              ))}

              {tracks.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-500">
                  لا توجد مسارات دراسة مضافة حالياً.
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-between gap-2 border-t border-[#2d3252]/40">
            <Button variant="ghost" onClick={handleClearTask} className="text-xs">
              بدون هدف
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

function TrackLessonsList({ 
  trackId, 
  activeLessonId, 
  onSelectLesson 
}: { 
  trackId: number
  activeLessonId: number | null
  onSelectLesson: (lessonId: number) => void 
}) {
  const { data: lessons = [], isLoading } = useLessonsQuery(trackId)
  
  if (isLoading) {
    return <div className="text-center py-3 text-xs text-gray-500">جاري تحميل الدروس...</div>
  }

  const pendingLessons = lessons.filter(l => l.status !== 'done')

  return (
    <div className="pl-3 pr-3 py-2 bg-[#141621]/60 border-t border-[#2d3252]/30 space-y-1">
      {pendingLessons.map((lesson) => (
        <button
          key={lesson.id}
          onClick={() => onSelectLesson(lesson.id)}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-right ${
            activeLessonId === lesson.id
              ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
              : 'border-transparent bg-transparent text-gray-300 hover:bg-[#1a1d27]/70 hover:text-gray-200'
          }`}
        >
          <span className="text-xs font-tajawal">الدرس {lesson.order}: {lesson.title}</span>
          {activeLessonId === lesson.id && (
            <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-bold font-cairo">
              نشط
            </span>
          )}
        </button>
      ))}
      {pendingLessons.length === 0 && (
        <div className="text-center py-2 text-xs text-emerald-400 font-bold font-cairo">
          كل دروس هذا المسار مكتملة! 🎉
        </div>
      )}
    </div>
  )
}
