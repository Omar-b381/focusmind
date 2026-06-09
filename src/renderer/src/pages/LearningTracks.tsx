import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, Plus, Sparkles, AlertCircle, Trash2, 
  CheckCircle2, ExternalLink, Compass, Clock, Award,
  Play, Check, PlusCircle
} from 'lucide-react'
import { 
  useTracksQuery, 
  useCreateTrackMutation, 
  useUpdateTrackMutation, 
  useDeleteTrackMutation, 
  useLessonsQuery, 
  useUpdateLessonMutation 
} from '../hooks/useLearningTracks'
import { useAddXPMutation } from '../hooks/useXP'
import { useTasksQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../hooks/useTasks'
import { useAppStore } from '../stores/app.store'
import { useFocusStore } from '../stores/focus.store'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'

export default function LearningTracks() {
  const { data: tracks, isLoading } = useTracksQuery()
  const createTrackMutation = useCreateTrackMutation()
  const deleteTrackMutation = useDeleteTrackMutation()
  
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  
  // New Track form state
  const [newTitle, setNewTitle] = useState('')
  const [newEmoji, setNewEmoji] = useState('📚')
  const [newDesc, setNewDesc] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newWhyStarted, setNewWhyStarted] = useState('')
  const [newCommitment, setNewCommitment] = useState('20 دقيقة يومياً')
  const [newTotalLessons, setNewTotalLessons] = useState(10)

  const handleCreateTrack = () => {
    if (!newTitle.trim()) return
    createTrackMutation.mutate({
      title: newTitle,
      emoji: newEmoji,
      description: newDesc || null,
      source: newSource || null,
      sourceUrl: newSourceUrl || null,
      whyStarted: newWhyStarted || null,
      commitment: newCommitment || null,
      totalLessons: newTotalLessons,
      completedLessons: 0,
      currentLesson: 1,
      status: 'active',
      createdAt: new Date()
    }, {
      onSuccess: () => {
        setCreateModalOpen(false)
        resetForm()
      }
    })
  }

  const resetForm = () => {
    setNewTitle('')
    setNewEmoji('📚')
    setNewDesc('')
    setNewSource('')
    setNewSourceUrl('')
    setNewWhyStarted('')
    setNewCommitment('20 دقيقة يومياً')
    setNewTotalLessons(10)
  }

  const handleDeleteTrack = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('هل أنت متأكد من حذف هذا المسار التعليمي؟')) {
      deleteTrackMutation.mutate(id)
      if (selectedTrackId === id) setSelectedTrackId(null)
    }
  }

  const selectedTrack = tracks?.find(t => t.id === selectedTrackId)

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-cairo">مسارات التعلم 📚</h1>
          <p className="text-gray-400 text-sm mt-1">تغلب على شلل البدء وحافظ على استمرارية كورساتك دون تشتت</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus className="h-4 w-4" />} 
          onClick={() => setCreateModalOpen(true)}
        >
          إنشاء مسار جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tracks List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-200 font-cairo">المسارات الحالية</h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">جاري تحميل المسارات...</div>
          ) : !tracks || tracks.length === 0 ? (
            <Card className="glass p-6 text-center text-gray-400 space-y-2">
              <BookOpen className="h-12 w-12 text-indigo-400/50 mx-auto" />
              <p>لا يوجد أي مسارات تعلم حتى الآن.</p>
              <p className="text-xs">ابدأ بإضافة كورس، كتاب، أو قائمة تشغيل تريد تعلمها خطوة بخطوة.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => {
                const isSelected = track.id === selectedTrackId
                const progressPct = track.totalLessons > 0 
                  ? Math.round((track.completedLessons / track.totalLessons) * 100)
                  : 0

                return (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card 
                      className={`glass p-4 cursor-pointer transition-all duration-200 border ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' 
                          : 'border-dark-border hover:border-gray-700'
                      }`}
                      onClick={() => setSelectedTrackId(track.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 bg-dark-surface rounded-xl border border-dark-border">
                            {track.emoji || '📚'}
                          </span>
                          <div>
                            <h3 className="font-bold text-white font-cairo text-sm line-clamp-1">{track.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{track.source || 'مصدر محلي'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteTrack(track.id, e)}
                          className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs font-medium text-gray-400 font-cairo">
                          <span>التقدم: {track.completedLessons}/{track.totalLessons} درس</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-dark-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detailed View / Lessons */}
        <div className="lg:col-span-2">
          {selectedTrack ? (
            <TrackDetails track={selectedTrack} />
          ) : (
            <Card className="glass p-12 text-center text-gray-400 border-dashed border-dark-border flex flex-col items-center justify-center space-y-3 h-[400px]">
              <Compass className="h-16 w-16 text-indigo-500/40 animate-pulse" />
              <h3 className="text-lg font-bold text-white font-cairo">اختر مساراً تعليمياً لتفاصيله</h3>
              <p className="max-w-md text-sm">بمجرد اختيارك للمسار، ستتمكن من مراجعة الدروس الفردية، وتوثيق أهدافك المحفزة، ومتابعة التقدم خطوة بخطوة.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        title="إنشاء مسار تعلم مضاد للتشتت 🧠"
        size="md"
      >
        <div className="space-y-4 py-2 font-cairo">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-400 mb-1">رمز المسار</label>
              <Input 
                value={newEmoji} 
                onChange={(e) => setNewEmoji(e.target.value)} 
                placeholder="📚" 
                className="text-center text-xl"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-gray-400 mb-1">اسم المسار التعليمي</label>
              <Input 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="مثال: تعلم لغة جافاسكريبت" 
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">الوصف المختصر</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="اكتب فكرة سريعة عن الكورس أو الكتاب..."
              className="w-full bg-dark-surface border border-dark-border rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-tajawal"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">منصة التعلم / المصدر</label>
              <Input 
                value={newSource} 
                onChange={(e) => setNewSource(e.target.value)} 
                placeholder="يوتيوب / يوديمي / كتاب" 
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">رابط المصدر (إن وجد)</label>
              <Input 
                value={newSourceUrl} 
                onChange={(e) => setNewSourceUrl(e.target.value)} 
                placeholder="https://..." 
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Anti-abandonment Fields */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> 
              آليات الـ ADHD لمكافحة هجر الكورسات:
            </h4>
            
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">لماذا أبدأ هذا المسار الآن؟ (أهم دافع عاطفي)</label>
              <textarea
                value={newWhyStarted}
                onChange={(e) => setNewWhyStarted(e.target.value)}
                placeholder="مثال: حابب أتعلم علشان أعمل ألعابي الخاصة وأشعر بالفخر!"
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-tajawal"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">الالتزام اليومي المقترح</label>
                <Input 
                  value={newCommitment} 
                  onChange={(e) => setNewCommitment(e.target.value)} 
                  placeholder="مثال: 15 دقيقة فقط يومياً" 
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">عدد الدروس الكلي</label>
                <Input 
                  type="number"
                  value={newTotalLessons} 
                  onChange={(e) => setNewTotalLessons(parseInt(e.target.value) || 10)} 
                  className="w-full text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-dark-border">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleCreateTrack}>حفظ المسار</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TrackDetails({ track }: { track: any }) {
  const { data: lessons, isLoading } = useLessonsQuery(track.id)
  const { data: tasks = [] } = useTasksQuery()
  
  const updateTrackMutation = useUpdateTrackMutation()
  const updateLessonMutation = useUpdateLessonMutation(track.id)
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()
  const addXPMutation = useAddXPMutation()

  const [bookmark, setBookmark] = useState(track.lastPosition || '')
  const [isSavingBookmark, setSavingBookmark] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleSaveBookmark = () => {
    setSavingBookmark(true)
    updateTrackMutation.mutate({
      id: track.id,
      updates: { lastPosition: bookmark }
    }, {
      onSuccess: () => {
        setSavingBookmark(false)
      }
    })
  }

  const handleCompleteLesson = (lesson: any) => {
    const isDone = lesson.status === 'done'
    const newStatus = isDone ? 'pending' : 'done'

    updateLessonMutation.mutate({
      id: lesson.id,
      updates: { status: newStatus, completedAt: isDone ? null : new Date() }
    }, {
      onSuccess: () => {
        // Update track progress
        const completedCount = isDone ? Math.max(0, track.completedLessons - 1) : track.completedLessons + 1
        const updates: any = { completedLessons: completedCount }
        
        // If we completed a lesson, move to next lesson
        if (!isDone && track.currentLesson === lesson.order && track.currentLesson < track.totalLessons) {
          updates.currentLesson = track.currentLesson + 1
        }
        
        updateTrackMutation.mutate({
          id: track.id,
          updates
        })

        // If completed, credit XP
        if (!isDone) {
          addXPMutation.mutate({
            amount: 15,
            reason: `إكمال درس: ${lesson.title}`,
            refId: lesson.id,
            refType: 'lesson_done'
          })
        }
      }
    })
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    createTaskMutation.mutate({
      title: newTaskTitle.trim(),
      learningTrackId: track.id,
      status: 'inbox',
      energyLevel: 'medium',
      priority: 'medium',
      tags: '[]'
    }, {
      onSuccess: () => {
        setNewTaskTitle('')
      }
    })
  }

  const handleToggleTask = (task: any) => {
    const isDone = task.status === 'done'
    updateTaskMutation.mutate({
      id: task.id,
      updates: {
        status: isDone ? 'inbox' : 'done',
        completedAt: isDone ? null : new Date()
      }
    })
  }

  const handleStartFocusTask = (task: any) => {
    // 1. Select the task in app store
    useAppStore.getState().setSelectedTaskId(task.id)
    // 2. Set the Pomodoro timer details in focus store
    useFocusStore.getState().setSession('focus', 25, task.id, task.projectId, track.id, null)
    // 3. Switch tab to Pomodoro Timer
    useAppStore.getState().setActiveTab('focus')
  }

  const handleStartFocusLesson = (lesson: any) => {
    // 1. Select lesson in focus store (clear taskId)
    useFocusStore.getState().setSession('focus', 25, null, null, track.id, lesson.id)
    // 2. Clear selected task ID in app store
    useAppStore.getState().setSelectedTaskId(null)
    // 3. Switch tab to Pomodoro Timer
    useAppStore.getState().setActiveTab('focus')
  }

  const handleConvertLessonToTask = (lesson: any) => {
    createTaskMutation.mutate({
      title: `تطبيق عملي: ${lesson.title}`,
      learningTrackId: track.id,
      status: 'inbox',
      energyLevel: 'medium',
      priority: 'medium',
      tags: JSON.stringify(['تطبيق_عملي'])
    })
  }

  const trackTasks = tasks.filter(t => t.learningTrackId === track.id)

  return (
    <Card className="glass p-6 space-y-6">
      {/* Track Header Details */}
      <div className="flex justify-between items-start border-b border-dark-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{track.emoji}</span>
            <h2 className="text-2xl font-bold text-white font-cairo">{track.title}</h2>
          </div>
          {track.description && <p className="text-gray-300 text-sm leading-relaxed">{track.description}</p>}
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2 font-cairo">
            <span className="flex items-center gap-1 bg-dark-surface px-3 py-1 rounded-full border border-dark-border">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              الالتزام: {track.commitment || 'غير محدد'}
            </span>
            {track.source && (
              <span className="flex items-center gap-1 bg-dark-surface px-3 py-1 rounded-full border border-dark-border">
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                المصدر: {track.source}
              </span>
            )}
            {track.sourceUrl && (
              <a 
                href={track.sourceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 hover:text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/20 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                رابط الكورس
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Why Started Reminder */}
      {track.whyStarted && (
        <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-cairo font-bold text-xs">
            <AlertCircle className="h-4 w-4" />
            لماذا بدأت هذا المسار؟ (رسالة لنفسك عندما يقل الشغف)
          </div>
          <p className="text-gray-200 text-sm italic pr-6 leading-relaxed">"{track.whyStarted}"</p>
        </div>
      )}

      {/* Bookmark context placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-dark-surface p-4 border border-dark-border space-y-3">
          <div className="flex items-center gap-2 text-white font-cairo text-sm font-bold">
            <Clock className="h-4 w-4 text-indigo-400" />
            أين توقفت آخر مرة؟ (Context Bookmark)
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">اكتب رقم الدقيقة أو اسم الملف لتستأنف العمل بنصف الجهد العقلي.</p>
          <div className="flex gap-2">
            <Input 
              value={bookmark} 
              onChange={(e) => setBookmark(e.target.value)} 
              placeholder="مثال: دقيقة 14:20 من درس الـ flexbox"
              className="w-full text-xs font-tajawal"
            />
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleSaveBookmark}
              isLoading={isSavingBookmark}
            >
              حفظ
            </Button>
          </div>
        </Card>

        {/* Study Stats */}
        <Card className="bg-dark-surface p-4 border border-dark-border flex justify-around items-center">
          <div className="text-center space-y-1">
            <Clock className="h-6 w-6 text-indigo-400 mx-auto" />
            <div className="text-xs text-gray-400 font-cairo">وقت الدراسة الكلي</div>
            <div className="text-lg font-bold text-white font-mono">{track.totalStudyMinutes || 0} د</div>
          </div>
          <div className="h-8 w-[1px] bg-dark-border" />
          <div className="text-center space-y-1">
            <Award className="h-6 w-6 text-indigo-400 mx-auto" />
            <div className="text-xs text-gray-400 font-cairo">نقاط XP المكتسبة</div>
            <div className="text-lg font-bold text-indigo-400 font-mono">+{track.xpEarned || 0} XP</div>
          </div>
        </Card>
      </div>

      {/* Side by side Lessons and Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dark-border">
        {/* Lessons List Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-200 font-cairo">الدروس الحالية 📖</h3>
          
          {isLoading ? (
            <div className="text-center py-4 text-gray-400">جاري تحميل الدروس...</div>
          ) : !lessons || lessons.length === 0 ? (
            <div className="text-center py-6 text-gray-400 border border-dashed border-dark-border rounded-2xl">
              لا توجد دروس مخصصة. سيتم إنشاء الدروس تلقائياً بناءً على عدد دروس المسار.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {lessons.map((lesson) => {
                const isDone = lesson.status === 'done'
                const isCurrent = track.currentLesson === lesson.order

                return (
                  <div 
                    key={lesson.id}
                    className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                      isDone 
                        ? 'bg-emerald-950/10 border-emerald-500/20 text-gray-400' 
                        : isCurrent 
                          ? 'bg-indigo-500/5 border-indigo-500/30 glow-primary' 
                          : 'bg-dark-surface border-dark-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleCompleteLesson(lesson)}
                        className={`p-1.5 rounded-lg border transition ${
                          isDone 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                            : 'bg-dark-bg border-dark-border hover:border-indigo-500 text-gray-600 hover:text-indigo-400'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <div>
                        <h4 className={`text-sm font-semibold font-tajawal ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 font-cairo">
                          <span>الدرس {lesson.order}</span>
                          {lesson.estimatedMinutes && <span>• {lesson.estimatedMinutes} دقيقة مقترحة</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-cairo font-semibold animate-pulse shrink-0">
                          النشط
                        </span>
                      )}
                      
                      {!isDone && (
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Convert to actionable practice task */}
                          <button
                            onClick={() => handleConvertLessonToTask(lesson)}
                            title="حول لتطبيق عملي"
                            className="p-1.5 hover:bg-orange-500/10 rounded-lg text-orange-400 hover:text-orange-300 border border-transparent hover:border-orange-500/20 transition flex items-center justify-center"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                          
                          {/* Start Focus Timer */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartFocusLesson(lesson)}
                            className="h-8 px-2 hover:bg-orange-500/10 text-orange-400 font-cairo text-xs gap-1 border border-transparent hover:border-orange-500/25 shrink-0"
                            icon={<Play className="h-3 w-3 fill-orange-400" />}
                          >
                            بومودورو
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tasks List Section */}
        <div className="space-y-4 flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-200 font-cairo">المهام الدراسية والتطبيق 🎯</h3>
          
          <div className="space-y-2 flex-1 max-h-[240px] overflow-y-auto pr-1">
            {trackTasks.map((task) => {
              const isDone = task.status === 'done'
              
              return (
                <div 
                  key={task.id}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                    isDone 
                      ? 'bg-emerald-950/10 border-emerald-500/20 text-gray-400' 
                      : 'bg-dark-surface border-dark-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleTask(task)}
                      className={`p-1.5 rounded-lg border transition ${
                        isDone 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-dark-bg border-dark-border hover:border-indigo-500 text-gray-600 hover:text-indigo-400'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div>
                      <h4 className={`text-sm font-semibold font-tajawal ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 font-cairo">
                        <span>التركيز: {task.actualMinutes || 0} د / {task.estimatedMinutes || 25} د</span>
                      </div>
                    </div>
                  </div>

                  {!isDone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartFocusTask(task)}
                      className="h-8 px-2 hover:bg-indigo-500/10 text-indigo-400 font-cairo text-xs gap-1 border border-transparent hover:border-indigo-500/25 shrink-0"
                      icon={<Play className="h-3 w-3 fill-indigo-400" />}
                    >
                      بومودورو
                    </Button>
                  )}
                </div>
              )
            })}

            {trackTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-dark-border rounded-2xl font-tajawal leading-relaxed">
                لا توجد مهام دراسية مرتبطة بهذا المسار حالياً.
                <br />
                أضف مهمة تطبيقية (عملي) بالأسفل لتنفيذ ما تتعلمه!
              </div>
            )}
          </div>

          {/* Quick Task Creation Form */}
          <div className="flex gap-2 border-t border-dark-border/40 pt-3 shrink-0">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="إضافة مهمة دراسية جديدة..."
              className="w-full text-xs font-tajawal"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="text-xs h-9 shrink-0 gap-1 font-cairo"
              icon={<PlusCircle className="h-4 w-4 text-indigo-400" />}
            >
              إضافة
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
