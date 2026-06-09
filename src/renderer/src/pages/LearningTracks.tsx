import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  BookOpen, Plus, Sparkles, AlertCircle, Trash2, 
  CheckCircle2, ExternalLink, Compass, Clock, Award,
  Play, Check, PlusCircle, FileText, Link as LinkIcon, Sparkles as BrainIcon
} from 'lucide-react'
import { 
  useTracksQuery, 
  useCreateTrackMutation, 
  useUpdateTrackMutation, 
  useDeleteTrackMutation, 
  useLessonsQuery, 
  useUpdateLessonMutation,
  useDeleteLessonMutation
} from '../hooks/useLearningTracks'
import { useAddXPMutation } from '../hooks/useXP'
import { useTasksQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../hooks/useTasks'
import { 
  useMaterialsQuery, 
  useCreateMaterialMutation, 
  useUpdateMaterialMutation, 
  useDeleteMaterialMutation, 
  useGenerateSummaryMutation 
} from '../hooks/useLearningMaterials'
import ConceptMap3D from '../components/learning/ConceptMap3D'
import ReactMarkdown from 'react-markdown'
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

  const queryClient = useQueryClient()
  const [createMode, setCreateMode] = useState<'manual' | 'youtube'>('manual')
  const [ytUrl, setYtUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const handleImportYoutube = async () => {
    if (!ytUrl.trim()) return
    setIsImporting(true)
    try {
      const result = await window.api.learningTracks.importYoutubePlaylist(
        ytUrl.trim(),
        newWhyStarted,
        newCommitment
      )
      // Invalidate queries to reload track list
      await queryClient.invalidateQueries({ queryKey: ['learning-tracks'] })
      
      // Select the newly imported track
      setSelectedTrackId(result.trackId)
      
      // Close modal and reset fields
      setCreateModalOpen(false)
      resetForm()
      setYtUrl('')
    } catch (err: any) {
      alert(err.message || 'فشل استيراد قائمة التشغيل.')
    } finally {
      setIsImporting(false)
    }
  }

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
      {selectedTrack ? (
        <TrackDetails track={selectedTrack} onBack={() => setSelectedTrackId(null)} />
      ) : (
        <>
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

          {isLoading ? (
            <div className="text-center py-12 text-gray-400 font-tajawal">جاري تحميل المسارات...</div>
          ) : !tracks || tracks.length === 0 ? (
            <Card className="glass p-12 text-center text-gray-400 space-y-4 border-dashed border-dark-border flex flex-col items-center justify-center max-w-xl mx-auto mt-8">
              <BookOpen className="h-16 w-16 text-indigo-500/40 animate-pulse" />
              <h3 className="text-lg font-bold text-white font-cairo">لا توجد مسارات تعلم حتى الآن</h3>
              <p className="text-sm">ابدأ بإضافة كورس، كتاب، أو قائمة تشغيل تريد تعلمها خطوة بخطوة.</p>
              <Button 
                variant="primary" 
                icon={<Plus className="h-4 w-4" />} 
                onClick={() => setCreateModalOpen(true)}
              >
                إنشاء أول مسار
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track) => {
                const progressPct = track.totalLessons > 0 
                  ? Math.round((track.completedLessons / track.totalLessons) * 100)
                  : 0

                return (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                  >
                    <Card 
                      className="glass p-6 cursor-pointer transition-all duration-300 border border-dark-border hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between h-full"
                      onClick={() => setSelectedTrackId(track.id)}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-3xl p-3 bg-dark-surface rounded-2xl border border-dark-border shadow-inner">
                            {track.emoji || '📚'}
                          </span>
                          <button 
                            onClick={(e) => handleDeleteTrack(track.id, e)}
                            className="p-2 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                            title="حذف المسار"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 space-y-2">
                          <h3 className="font-bold text-white font-cairo text-lg hover:text-indigo-400 transition-colors line-clamp-1">{track.title}</h3>
                          <span className="text-xs text-indigo-400 font-medium font-cairo bg-indigo-500/10 px-2.5 py-1 rounded-md inline-block">
                            {track.source || 'مصدر محلي'}
                          </span>
                          {track.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed font-tajawal">
                              {track.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        {/* Stats Row */}
                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-dark-border/50 pt-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            {track.totalStudyMinutes || 0} دقيقة
                          </span>
                          <span className="flex items-center gap-1 font-bold text-indigo-400">
                            <Award className="h-3.5 w-3.5 text-indigo-400" />
                            +{track.xpEarned || 0} XP
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-gray-300 font-cairo">
                            <span>التقدم: {track.completedLessons}/{track.totalLessons} درس</span>
                            <span className="text-indigo-400">{progressPct}%</span>
                          </div>
                          <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden border border-dark-border/30">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        title="إنشاء مسار تعلم مضاد للتشتت 🧠"
        size="md"
      >
        <div className="space-y-4 py-2 font-cairo">
          {isImporting ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <BrainIcon className="absolute inset-3 h-10 w-10 text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white font-cairo">جاري الاتصال والتحليل بالذكاء الاصطناعي... 🧠</h4>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-tajawal">
                  نقوم بسحب عناوين فيديوهات قائمة التشغيل ومددها، وبناء خطة طريق مفككة وهيكلة خريطة مفاهيم ثلاثية الأبعاد تفاعلية تناسب عقلك المشتت. خذ نفساً عميقاً! 🧘
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Selector Tabs */}
              <div className="flex bg-[#141621]/80 p-1.5 rounded-xl border border-dark-border mb-2">
                <button
                  type="button"
                  onClick={() => setCreateMode('manual')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    createMode === 'manual' 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>📚</span>
                  <span>مسار محلي جديد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('youtube')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    createMode === 'youtube' 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>📺</span>
                  <span>استيراد كورس يوتيوب</span>
                </button>
              </div>

              {createMode === 'manual' ? (
                <>
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">رابط قائمة تشغيل يوتيوب (YouTube Playlist Link)</label>
                    <Input 
                      value={ytUrl} 
                      onChange={(e) => setYtUrl(e.target.value)} 
                      placeholder="https://www.youtube.com/playlist?list=PL..." 
                      className="w-full text-xs font-mono ltr text-left"
                    />
                    <span className="text-[10px] text-gray-500 mt-1.5 block leading-relaxed font-tajawal">
                      انسخ رابط قائمة التشغيل من يوتيوب وتأكد أنه يحتوي على الجزء <code className="text-indigo-400 font-mono">list=...</code>
                    </span>
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

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">الالتزام اليومي المقترح</label>
                      <Input 
                        value={newCommitment} 
                        onChange={(e) => setNewCommitment(e.target.value)} 
                        placeholder="مثال: 15 دقيقة فقط يومياً" 
                        className="w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-dark-border">
                    <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>إلغاء</Button>
                    <Button 
                      variant="primary" 
                      onClick={handleImportYoutube}
                      disabled={!ytUrl.trim()}
                    >
                      بدء الاستيراد الذكي ✨
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

function TrackDetails({ track, onBack }: { track: any; onBack: () => void }) {
  const { data: lessons, isLoading } = useLessonsQuery(track.id)
  const { data: tasks = [] } = useTasksQuery()
  
  const updateTrackMutation = useUpdateTrackMutation()
  const updateLessonMutation = useUpdateLessonMutation(track.id)
  const deleteLessonMutation = useDeleteLessonMutation(track.id)
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()
  const addXPMutation = useAddXPMutation()

  // Materials Vault hooks
  const { data: materials = [] } = useMaterialsQuery(track.id)
  const createMaterialMutation = useCreateMaterialMutation()
  const updateMaterialMutation = useUpdateMaterialMutation()
  const deleteMaterialMutation = useDeleteMaterialMutation()
  const generateSummaryMutation = useGenerateSummaryMutation()

  // Materials Vault state
  const [activeSection, setActiveSection] = useState<'lessons_tasks' | 'vault'>('lessons_tasks')
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null)
  const [isAddMaterialOpen, setAddMaterialOpen] = useState(false)

  // Add Material Form state
  const [matTitle, setMatTitle] = useState('')
  const [matType, setMatType] = useState<'text_input' | 'link' | 'pdf'>('text_input')
  const [matContent, setMatContent] = useState('')
  const [matFilePath, setMatFilePath] = useState('')

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
        const updates: any = { 
          completedLessons: completedCount,
          xpEarned: isDone 
            ? Math.max(0, (track.xpEarned || 0) - 15) 
            : (track.xpEarned || 0) + 15
        }
        
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

  const handleDeleteLesson = (lessonId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('هل أنت متأكد من حذف هذا الدرس؟ سيتم إزالته نهائياً مع أي مهام دراسية مرتبطة به.')) {
      deleteLessonMutation.mutate(lessonId)
    }
  }

  const handleAddMaterial = () => {
    if (!matTitle.trim()) return
    createMaterialMutation.mutate({
      title: matTitle,
      fileType: matType,
      content: matType === 'text_input' ? matContent : null,
      filePath: matType === 'pdf' ? matFilePath : matType === 'link' ? matContent : null,
      learningTrackId: track.id,
      status: 'pending'
    }, {
      onSuccess: () => {
        setAddMaterialOpen(false)
        resetMatForm()
      }
    })
  }

  const resetMatForm = () => {
    setMatTitle('')
    setMatType('text_input')
    setMatContent('')
    setMatFilePath('')
  }

  const handleDeleteMaterial = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      deleteMaterialMutation.mutate(id)
      if (selectedMaterialId === id) setSelectedMaterialId(null)
    }
  }

  const trackTasks = tasks.filter(t => t.learningTrackId === track.id)
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId)

  return (
    <Card className="glass p-6 space-y-6">
      {/* Track Header Details */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-dark-border pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-dark-surface rounded-2xl border border-dark-border shadow-inner">
              {track.emoji}
            </span>
            <h2 className="text-2xl font-extrabold text-white font-cairo">{track.title}</h2>
          </div>
          {track.description && <p className="text-gray-300 text-sm leading-relaxed font-tajawal">{track.description}</p>}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2 font-cairo">
            <span className="flex items-center gap-1.5 bg-dark-surface px-3 py-1.5 rounded-xl border border-dark-border">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              الالتزام: {track.commitment || 'غير محدد'}
            </span>
            {track.source && (
              <span className="flex items-center gap-1.5 bg-dark-surface px-3 py-1.5 rounded-xl border border-dark-border">
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                المصدر: {track.source}
              </span>
            )}
            {track.sourceUrl && (
              <a 
                href={track.sourceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 hover:text-indigo-200 px-3 py-1.5 rounded-xl border border-indigo-500/20 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                رابط الكورس
              </a>
            )}
          </div>
        </div>

        {/* Back button */}
        <Button
          variant="secondary"
          onClick={onBack}
          className="h-10 px-4 text-xs font-bold font-cairo gap-1.5 border border-dark-border hover:bg-dark-hover"
        >
          <span>← العودة إلى قائمة المسارات</span>
        </Button>
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

      {/* Bookmark context placeholder & Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-dark-surface/50 p-5 border border-dark-border rounded-2xl space-y-3 shadow-inner">
          <div className="flex items-center gap-2 text-white font-cairo text-sm font-bold">
            <Clock className="h-4 w-4 text-indigo-400" />
            أين توقفت آخر مرة؟ (Context Bookmark)
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-tajawal">اكتب رقم الدقيقة أو اسم الملف لتستأنف العمل بنصف الجهد العقلي.</p>
          <div className="flex gap-2.5">
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
              className="px-4 font-cairo text-xs"
            >
              حفظ
            </Button>
          </div>
        </Card>

        {/* Study Stats */}
        <Card className="bg-dark-surface/50 p-5 border border-dark-border rounded-2xl flex justify-around items-center shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl" />

          <div className="text-center space-y-1 z-10">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl inline-block border border-indigo-500/20 mb-1">
              <Clock className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-xs text-gray-400 font-cairo">وقت الدراسة الكلي</div>
            <div className="text-2xl font-black text-white font-mono">{track.totalStudyMinutes || 0} د</div>
          </div>
          
          <div className="h-12 w-[1px] bg-dark-border/80" />
          
          <div className="text-center space-y-1 z-10">
            <div className="p-2.5 bg-purple-500/10 rounded-xl inline-block border border-purple-500/20 mb-1">
              <Award className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-xs text-gray-400 font-cairo">نقاط XP المكتسبة</div>
            <div className="text-2xl font-black text-indigo-400 font-mono">+{track.xpEarned || 0} XP</div>
          </div>
        </Card>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex bg-[#141621]/80 p-1.5 rounded-xl border border-dark-border max-w-md">
        <button
          onClick={() => setActiveSection('lessons_tasks')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 font-cairo flex items-center justify-center gap-2 ${
            activeSection === 'lessons_tasks' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>📖</span>
          <span>الخطة الدراسية والمهام</span>
        </button>
        <button
          onClick={() => setActiveSection('vault')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 font-cairo flex items-center justify-center gap-2 ${
            activeSection === 'vault' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>📁</span>
          <span>حقيبة الملفات والملخصات</span>
        </button>
      </div>

      {activeSection === 'lessons_tasks' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Lessons List Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-200 font-cairo">الدروس الحالية 📖</h3>
            
            {isLoading ? (
              <div className="text-center py-4 text-gray-400">جاري تحميل الدروس...</div>
            ) : !lessons || lessons.length === 0 ? (
              <div className="text-center py-6 text-gray-400 border border-dashed border-dark-border rounded-2xl">
                لا توجد دروس مخصصة. سيتم إنشاء الدروس تلقائياً بناءً على عدد دروس المسار.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
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

                        {/* Delete Lesson Button */}
                        <button
                          onClick={(e) => handleDeleteLesson(lesson.id, e)}
                          title="حذف الدرس"
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/20 transition flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tasks List Section */}
          <div className="space-y-4 flex flex-col h-full">
            <h3 className="text-sm font-bold text-gray-200 font-cairo">المهام الدراسية والتطبيق 🎯</h3>
            
            <div className="space-y-2 flex-1 max-h-[440px] overflow-y-auto pr-1">
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 items-start">
          {/* Materials List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-gray-300 font-cairo">ملفات المادة ({materials.length})</h4>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-[10px] font-cairo"
                onClick={() => setAddMaterialOpen(true)}
                icon={<Plus className="h-3 w-3 text-indigo-400" />}
              >
                إضافة ملف
              </Button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {materials.map((mat) => {
                const isSelected = mat.id === selectedMaterialId
                const typeIcon = mat.fileType === 'link' ? <LinkIcon className="h-4 w-4 text-indigo-400" /> : <FileText className="h-4 w-4 text-indigo-400" />
                
                const statusConfig = {
                  pending: { label: 'مضاف حديثاً', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
                  reading: { label: 'قيد القراءة 📖', className: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
                  summarized: { label: 'ملخص بالذكاء ✨', className: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
                  read: { label: 'مكتمل ✅', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }
                }
                const statusDetails = statusConfig[mat.status as keyof typeof statusConfig] || statusConfig.pending

                return (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/5 glow-primary'
                        : 'border-dark-border bg-dark-surface hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="p-1.5 bg-[#141621] rounded-lg border border-dark-border">
                        {typeIcon}
                      </span>
                      <div className="truncate text-right">
                        <h5 className="text-xs font-bold text-white truncate font-tajawal">{mat.title}</h5>
                        <span className={`inline-block mt-1 text-[9px] border px-2 py-0.5 rounded-full font-cairo font-bold ${statusDetails.className}`}>
                          {statusDetails.label}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteMaterial(mat.id, e)}
                      className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}

              {materials.length === 0 && (
                <div className="text-center py-10 text-xs text-gray-500 border border-dashed border-dark-border rounded-2xl font-tajawal leading-relaxed">
                  لا توجد ملفات أو مستندات مرفقة حالياً.
                  <br />
                  أضف مقالاً أو نصاً لتقوم بتلخيصه واستعراضه!
                </div>
              )}
            </div>
          </div>

          {/* Active Material Viewer */}
          <div className="lg:col-span-2">
            {selectedMaterial ? (
              <Card className="bg-[#1a1d27] p-5 border border-dark-border space-y-4 text-right">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-dark-border pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white font-cairo">{selectedMaterial.title}</h4>
                    <span className="text-[10px] text-gray-400 font-tajawal mt-0.5 block">
                      نوع الملف: {selectedMaterial.fileType === 'pdf' ? 'كتاب/مستند PDF' : selectedMaterial.fileType === 'link' ? 'رابط خارجي' : 'نص مضاف يدوياً'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateMaterialMutation.mutate({
                        id: selectedMaterial.id,
                        updates: { status: selectedMaterial.status === 'read' ? 'reading' : 'read' }
                      })}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold font-cairo transition ${
                        selectedMaterial.status === 'read'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-dark-bg border-dark-border hover:border-gray-700 text-gray-300'
                      }`}
                    >
                      {selectedMaterial.status === 'read' ? 'تمت قراءته ✅' : 'تعليم كمقروء'}
                    </button>
                    
                    <button
                      onClick={() => updateMaterialMutation.mutate({
                        id: selectedMaterial.id,
                        updates: { status: selectedMaterial.status === 'reading' ? 'pending' : 'reading' }
                      })}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold font-cairo transition ${
                        selectedMaterial.status === 'reading'
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                          : 'bg-dark-bg border-dark-border hover:border-gray-700 text-gray-300'
                      }`}
                    >
                      {selectedMaterial.status === 'reading' ? 'قيد القراءة 📖' : 'قيد القراءة'}
                    </button>
                  </div>
                </div>

                {selectedMaterial.status !== 'summarized' && !selectedMaterial.summary ? (
                  <Card className="glass p-6 text-center space-y-4 border-dashed border-indigo-500/30 flex flex-col items-center">
                    <BrainIcon className="h-9 w-9 text-indigo-400 animate-pulse" />
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-xs font-bold text-white font-cairo">توليد خريطة مفاهيم تفاعلية وملخص ذكي ✨</h4>
                      <p className="text-[10px] text-gray-400 font-tajawal leading-relaxed">
                        سنقوم بتحليل هذا النص بالذكاء الاصطناعي وتفكيكه إلى خريطة مفاهيم ثلاثية الأبعاد تدور في الفضاء لتصفحها والتفاعل معها بسهولة، بالإضافة لملخص كتابي مريح.
                      </p>
                    </div>
                    <Button
                      variant="dopamine"
                      size="sm"
                      onClick={() => generateSummaryMutation.mutate(selectedMaterial.id)}
                      isLoading={generateSummaryMutation.isPending}
                      className="text-xs font-cairo h-10 px-5"
                      icon={<BrainIcon className="h-4 w-4" />}
                    >
                      ابدأ التلخيص الذكي
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-5">
                    {/* 3D Concept Map */}
                    {selectedMaterial.conceptMap && (
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-indigo-300 font-cairo">الخريطة الذهنية التفاعلية ثلاثية الأبعاد 🌌</h5>
                        <ConceptMap3D conceptMap={JSON.parse(selectedMaterial.conceptMap)} />
                      </div>
                    )}

                    {/* AI Written Summary */}
                    {selectedMaterial.summary && (
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-indigo-300 font-cairo">الملخص الكتابي الميسر 📝</h5>
                        <div className="p-3.5 bg-[#141621]/45 border border-[#2d3252]/30 rounded-xl overflow-y-auto max-h-[400px]">
                          <ReactMarkdown className="text-xs leading-relaxed space-y-2 text-gray-300 font-tajawal select-text text-right prose prose-invert">
                            {selectedMaterial.summary}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              <Card className="glass p-12 text-center text-gray-400 border-dashed border-dark-border flex flex-col items-center justify-center space-y-3 h-[300px]">
                <BrainIcon className="h-10 w-10 text-indigo-500/40" />
                <h4 className="text-xs font-bold text-white font-cairo">حقيبة مستندات مسار التعلم 📁</h4>
                <p className="max-w-xs text-[10px] leading-relaxed font-tajawal">
                  اختر مستنداً أو مقالاً من القائمة الجانبية لتصفحه وتلخيصه بالذكاء الاصطناعي، أو أضف محتوى جديداً للبدء.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      <Modal
        isOpen={isAddMaterialOpen}
        onClose={() => {
          setAddMaterialOpen(false)
          resetMatForm()
        }}
        title="إرفاق مستند دراسي جديد 📁"
        size="md"
      >
        <div className="space-y-4 py-2 text-right font-tajawal">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-cairo">عنوان المستند / المادة</label>
            <Input
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              placeholder="مثال: أساسيات الـ Flexbox أو مقال تعلم البرمجة"
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-cairo">نوع المصدر</label>
            <div className="flex gap-2">
              {[
                { type: 'text_input', label: 'كتابة/لصق نص ✍️' },
                { type: 'link', label: 'رابط مقال/فيديو 🔗' },
                { type: 'pdf', label: 'مسار ملف محلي 📄' }
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setMatType(t.type as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    matType === t.type
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-dark-border bg-dark-surface text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {matType === 'text_input' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 font-cairo">الصق المحتوى التعليمي هنا</label>
              <textarea
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
                placeholder="الصق نص الفصل الدراسي، المقال، أو ملاحظاتك هنا..."
                className="w-full bg-dark-surface border border-dark-border rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-tajawal"
                rows={6}
              />
            </div>
          )}

          {matType === 'link' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 font-cairo">رابط المقال أو الفيديو</label>
              <Input
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full text-xs font-mono ltr text-left"
              />
            </div>
          )}

          {matType === 'pdf' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 font-cairo">مسار الملف المحلي (PDF/TXT)</label>
              <Input
                value={matFilePath}
                onChange={(e) => setMatFilePath(e.target.value)}
                placeholder="C:\Users\...\document.pdf"
                className="w-full text-xs font-mono ltr text-left"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-dark-border">
            <Button variant="secondary" onClick={() => {
              setAddMaterialOpen(false)
              resetMatForm()
            }}>
              إلغاء
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddMaterial}
              disabled={!matTitle.trim()}
            >
              حفظ وإرفاق
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}
