import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Plus, Sparkles, AlertCircle, Trash2, 
  ExternalLink, Clock, Award,
  Play, Check, FileText, Sparkles as BrainIcon,
  ChevronLeft, BookOpenCheck, BrainCircuit, HelpCircle
} from 'lucide-react'
import { 
  usePathsQuery, 
  useCreatePathMutation, 
  useDeletePathMutation, 
  useModulesQuery, 
  useUpdateModuleMutation,
  useGeneratePathMutation,
  useImportYoutubePlaylistMutation
} from '../hooks/useLearningPaths'
import { 
  useMaterialsQuery, 
  useCreateMaterialMutation, 
  useDeleteMaterialMutation, 
  useGenerateSummaryMutation 
} from '../hooks/useLearningMaterials'
import { useGenerateCardsMutation } from '../hooks/useFlashcards'
import ConceptMap3D from '../components/learning/ConceptMap3D'
import ReactMarkdown from 'react-markdown'
import { useAppStore } from '../stores/app.store'
import { useFocusStore } from '../stores/focus.store'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'

export default function LearningPaths() {
  const { data: paths, isLoading } = usePathsQuery()
  const createPathMutation = useCreatePathMutation()
  const deletePathMutation = useDeletePathMutation()
  
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [createMode, setCreateMode] = useState<'manual' | 'youtube' | 'ai'>('ai')

  // New Path form state
  const [newTitle, setNewTitle] = useState('')
  const [newEmoji, setNewEmoji] = useState('📚')
  const [newDesc, setNewDesc] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [newWhyStarted, setNewWhyStarted] = useState('')
  const [newCommitment, setNewCommitment] = useState('20 دقيقة يومياً')
  const [newGoal, setNewGoal] = useState('')

  // AI path generation form state
  const [aiTopic, setAiTopic] = useState('')
  const [aiGoal, setAiGoal] = useState('')
  const [aiLevel, setAiLevel] = useState('beginner')
  const [aiMinutes, setAiMinutes] = useState(20)
  const [aiStyle, setAiStyle] = useState('mixed')

  // YouTube import state
  const [ytUrl, setYtUrl] = useState('')

  const generatePathMutation = useGeneratePathMutation()
  const importYoutubePlaylistMutation = useImportYoutubePlaylistMutation()

  const handleCreatePath = () => {
    if (!newTitle.trim()) return
    createPathMutation.mutate({
      title: newTitle,
      emoji: newEmoji,
      description: newDesc || null,
      goal: newGoal || null,
      source: newSource || 'custom',
      sourceUrl: newSourceUrl || null,
      whyStarted: newWhyStarted || null,
      commitment: newCommitment || null,
      isAiGenerated: false,
      difficulty: 'beginner',
      learningStyle: 'mixed',
      totalModules: 0,
      completedModules: 0,
      status: 'active',
      createdAt: new Date()
    }, {
      onSuccess: () => {
        setCreateModalOpen(false)
        resetForm()
      }
    })
  }

  const handleGenerateAIPath = () => {
    if (!aiTopic.trim()) return
    generatePathMutation.mutate({
      topic: aiTopic,
      goal: aiGoal,
      level: aiLevel,
      minutesPerDay: aiMinutes,
      style: aiStyle
    }, {
      onSuccess: () => {
        setCreateModalOpen(false)
        resetAIForm()
      }
    })
  }

  const handleImportYoutube = () => {
    if (!ytUrl.trim()) return
    importYoutubePlaylistMutation.mutate({
      url: ytUrl,
      whyStarted: newWhyStarted,
      commitment: newCommitment
    }, {
      onSuccess: () => {
        setCreateModalOpen(false)
        setYtUrl('')
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
    setNewGoal('')
  }

  const resetAIForm = () => {
    setAiTopic('')
    setAiGoal('')
    setAiLevel('beginner')
    setAiMinutes(20)
    setAiStyle('mixed')
  }

  const handleDeletePath = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('هل أنت متأكد من حذف هذا المسار التعليمي؟ سيتم حذف جميع البطاقات والوحدات التابعة له.')) {
      deletePathMutation.mutate(id)
      if (selectedPathId === id) setSelectedPathId(null)
    }
  }

  const selectedPath = paths?.find(p => p.id === selectedPathId)

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {selectedPath ? (
        <PathDetails path={selectedPath} onBack={() => setSelectedPathId(null)} />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white font-cairo">مسارات التعلم الذكية 🧠</h1>
              <p className="text-gray-400 text-sm mt-1">نظام تعلم ذكي لعقول ADHD مبني على التكرار المتباعد وتقنية فاينمان</p>
            </div>
            <Button 
              variant="primary" 
              icon={<Plus className="h-4 w-4" />} 
              onClick={() => setCreateModalOpen(true)}
            >
              إضافة مسار تعلم
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400 font-tajawal">جاري تحميل مساراتك...</div>
          ) : !paths || paths.length === 0 ? (
            <Card className="glass p-12 text-center text-gray-400 space-y-4 border-dashed border-dark-border flex flex-col items-center justify-center max-w-xl mx-auto mt-8">
              <BookOpen className="h-16 w-16 text-indigo-500/40 animate-pulse" />
              <h3 className="text-lg font-bold text-white font-cairo">لا توجد مسارات تعلم حتى الآن</h3>
              <p className="text-sm">ابدأ بإنشاء مسار تعلم مخصص بالذكاء الاصطناعي أو استورد قائمة يوتيوب كاملة</p>
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
              {paths.map((path) => {
                const progressPct = path.totalModules > 0 
                  ? Math.round((path.completedModules / path.totalModules) * 100)
                  : 0

                return (
                  <motion.div
                    key={path.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                  >
                    <Card 
                      className="glass p-6 cursor-pointer transition-all duration-300 border border-dark-border hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between h-full"
                      onClick={() => setSelectedPathId(path.id)}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-3xl p-3 bg-dark-surface rounded-2xl border border-dark-border shadow-inner">
                            {path.emoji || '📚'}
                          </span>
                          <button 
                            onClick={(e) => handleDeletePath(path.id, e)}
                            className="p-2 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                            title="حذف المسار"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 space-y-2">
                          <h3 className="font-bold text-white font-cairo text-lg hover:text-indigo-400 transition-colors line-clamp-1">{path.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] text-indigo-400 font-medium font-cairo bg-indigo-500/10 px-2 py-0.5 rounded-md inline-block">
                              {path.source === 'ai_generated' ? 'توليد ذكي 🤖' : path.source === 'youtube' ? 'يوتيوب 📺' : 'مسار محلي'}
                            </span>
                            {path.abandonmentRisk > 0.5 && (
                              <span className="text-[10px] text-orange-400 font-medium font-cairo bg-orange-500/10 px-2 py-0.5 rounded-md inline-block">
                                خطر الهجر مرتفع ⚠️
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-tajawal line-clamp-2 mt-2">{path.description || 'لا يوجد وصف متاح لهذا المسار'}</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#2d3252]/30 space-y-2">
                        <div className="flex justify-between text-xs font-medium font-tajawal">
                          <span className="text-indigo-300">نسبة الاحتفاظ: {Math.round(path.retentionScore)}%</span>
                          <span className="text-gray-400">{progressPct}% من الوحدات</span>
                        </div>
                        <div className="w-full bg-[#131620] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
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

          {/* Create Path Modal */}
          <Modal 
            isOpen={isCreateModalOpen} 
            onClose={() => setCreateModalOpen(false)} 
            title="إضافة مسار تعلم جديد"
            size="lg"
          >
            <div className="space-y-5">
              {/* Mode Switcher */}
              <div className="flex border-b border-dark-border pb-2 gap-4">
                <button 
                  className={`pb-2 font-cairo text-sm ${createMode === 'ai' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                  onClick={() => setCreateMode('ai')}
                >
                  توليد بالذكاء الاصطناعي 🤖
                </button>
                <button 
                  className={`pb-2 font-cairo text-sm ${createMode === 'youtube' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                  onClick={() => setCreateMode('youtube')}
                >
                  استيراد يوتيوب 📺
                </button>
                <button 
                  className={`pb-2 font-cairo text-sm ${createMode === 'manual' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                  onClick={() => setCreateMode('manual')}
                >
                  إنشاء يدوي ✍️
                </button>
              </div>

              {createMode === 'ai' && (
                <div className="space-y-4 font-tajawal">
                  <Input 
                    label="ماذا تريد أن تتعلم؟ (موضوع دقيق)" 
                    placeholder="مثال: التعلم الآلي بلغة بايثون، أساسيات التصميم الرقمي" 
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                  <Input 
                    label="ما هو هدفك من تعلم هذا؟" 
                    placeholder="مثال: أريد برمجة مشروعي الخاص، أريد وظيفة جديدة" 
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 font-medium font-cairo">المستوى الحالي</label>
                      <select 
                        className="w-full mt-1 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-sm h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={aiLevel}
                        onChange={(e) => setAiLevel(e.target.value)}
                      >
                        <option value="beginner">مبتدئ</option>
                        <option value="intermediate">متوسط</option>
                        <option value="advanced">متقدم</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium font-cairo">وقتك اليومي (دقيقة)</label>
                      <input 
                        type="number"
                        className="w-full mt-1 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-sm h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={aiMinutes}
                        onChange={(e) => setAiMinutes(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium font-cairo">أسلوب التعلم المفضل</label>
                    <select 
                      className="w-full mt-1 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-sm h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                    >
                      <option value="mixed">مختلط (فيديوهات ومقالات وعملي)</option>
                      <option value="visual">بصري (فيديوهات وشروحات)</option>
                      <option value="reading">قرائي (مقالات وكتب)</option>
                      <option value="kinesthetic">عملي (مشاريع وتطبيق)</option>
                    </select>
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full h-12 mt-4" 
                    isLoading={generatePathMutation.isPending}
                    onClick={handleGenerateAIPath}
                  >
                    🚀 توليد مسار التعلم الذكي الآن
                  </Button>
                </div>
              )}

              {createMode === 'youtube' && (
                <div className="space-y-4 font-tajawal">
                  <Input 
                    label="رابط قائمة تشغيل يوتيوب (YouTube Playlist URL)" 
                    placeholder="ضع رابط الـ Playlist هنا..." 
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                  />
                  <Input 
                    label="لماذا تريد البدء في هذا الكورس؟ (لإعادتك للمسار عند التكاسل)" 
                    placeholder="مثال: هذا الكورس مهم جداً لمشروعي القادم" 
                    value={newWhyStarted}
                    onChange={(e) => setNewWhyStarted(e.target.value)}
                  />
                  <Input 
                    label="الالتزام اليومي المقترح" 
                    placeholder="مثال: 20 دقيقة يومياً، درس واحد يومياً" 
                    value={newCommitment}
                    onChange={(e) => setNewCommitment(e.target.value)}
                  />
                  <Button 
                    variant="primary" 
                    className="w-full h-12 mt-4" 
                    isLoading={importYoutubePlaylistMutation.isPending}
                    onClick={handleImportYoutube}
                  >
                    📺 استيراد الكورس وجدولة الدروس
                  </Button>
                </div>
              )}

              {createMode === 'manual' && (
                <div className="space-y-4 font-tajawal max-h-[450px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                      <Input 
                        label="عنوان المسار" 
                        placeholder="ماذا تريد أن تتعلم؟" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input 
                        label="أيقونة (Emoji)" 
                        placeholder="📚" 
                        value={newEmoji}
                        onChange={(e) => setNewEmoji(e.target.value)}
                      />
                    </div>
                  </div>
                  <Input 
                    label="وصف المسار" 
                    placeholder="وصف مختصر لمحتوى وهدف المسار" 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                  <Input 
                    label="الهدف الرئيسي من هذا المسار" 
                    placeholder="الهدف من هذا المسار (XP مضاعف)" 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="مصدر المسار" 
                      placeholder="مثال: يوتيوب، يوديمي، كتاب" 
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                    />
                    <Input 
                      label="رابط المصدر (إن وجد)" 
                      placeholder="https://..." 
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                    />
                  </div>
                  <Input 
                    label="لماذا تريد البدء في هذا المسار؟ (دوافع ADHD)" 
                    placeholder="أنا أتعلم هذا لكي..." 
                    value={newWhyStarted}
                    onChange={(e) => setNewWhyStarted(e.target.value)}
                  />
                  <Input 
                    label="الالتزام اليومي المقترح" 
                    placeholder="20 دقيقة يومياً" 
                    value={newCommitment}
                    onChange={(e) => setNewCommitment(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>إلغاء</Button>
                    <Button variant="primary" onClick={handleCreatePath}>إنشاء المسار</Button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        </>
      )}
    </div>
  )
}

/* ==========================================
   PATH DETAILS SUB-COMPONENT
   ========================================== */
function PathDetails({ path, onBack }: { path: any; onBack: () => void }) {
  const { data: modules, isLoading: isModulesLoading } = useModulesQuery(path.id)
  const updateModuleMutation = useUpdateModuleMutation(path.id)
  
  const generateCardsMutation = useGenerateCardsMutation(path.flashcardDeckId || 0, 0)
  const { setActiveTab } = useAppStore()
  const setSession = useFocusStore((state) => state.setSession)

  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'materials'>('modules')
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  
  // Materials vault states
  const { data: materials } = useMaterialsQuery(path.id)
  const createMaterialMutation = useCreateMaterialMutation()
  const deleteMaterialMutation = useDeleteMaterialMutation()
  const generateSummaryMutation = useGenerateSummaryMutation()

  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null)
  const [isUploadOpen, setUploadOpen] = useState(false)
  
  // Material input state
  const [matTitle, setMatTitle] = useState('')
  const [matContent, setMatContent] = useState('')
  const [matUrl, setMatUrl] = useState('')
  const [matType, setMatType] = useState<'pdf' | 'txt' | 'markdown' | 'link' | 'text_input'>('text_input')

  // Microlearning chunks states
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(0)
  const [generatingCardsMap, setGeneratingCardsMap] = useState<Record<number, boolean>>({})

  const selectedModule = modules?.find(m => m.id === selectedModuleId)

  // Start Pomodoro Focus Session for Module
  const handleStartPomodoro = (mod: any) => {
    // 1. Create a task for this module if needed, or link to Pomodoro
    setSession('focus', mod.estimatedMinutes, null, null, path.id, mod.id)
    
    // 2. Set tab to Focus
    setActiveTab('focus')
  }

  // Handle auto generation of flashcards
  const handleGenerateCards = (mod: any) => {
    if (!path.flashcardDeckId) {
      alert('لا توجد مجموعة بطاقات مرتبطة بهذا المسار حالياً.')
      return
    }
    setGeneratingCardsMap(prev => ({ ...prev, [mod.id]: true }))
    generateCardsMutation.mutate({
      content: mod.content || JSON.stringify(mod.keyPoints)
    }, {
      onSuccess: () => {
        // Update module autoGeneratedCards field
        updateModuleMutation.mutate({
          id: mod.id,
          updates: { autoGeneratedCards: true, cardCount: 5 }
        })
        setGeneratingCardsMap(prev => ({ ...prev, [mod.id]: false }))
      },
      onError: () => {
        setGeneratingCardsMap(prev => ({ ...prev, [mod.id]: false }))
      }
    })
  }

  const handleUploadMaterial = () => {
    if (!matTitle.trim()) return
    createMaterialMutation.mutate({
      title: matTitle,
      content: matContent || null,
      filePath: matUrl || null,
      fileType: matType,
      learningTrackId: path.id, // Using trackId mappings for compatibility
      status: 'pending',
      createdAt: new Date()
    }, {
      onSuccess: () => {
        setUploadOpen(false)
        setMatTitle('')
        setMatContent('')
        setMatUrl('')
      }
    })
  }

  const handleDeleteMaterial = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('هل تريد حذف هذا المستند؟')) {
      deleteMaterialMutation.mutate(id)
      if (selectedMaterialId === id) setSelectedMaterialId(null)
    }
  }

  const handleToggleModuleDone = (mod: any) => {
    const isDone = mod.status === 'done'
    updateModuleMutation.mutate({
      id: mod.id,
      updates: {
        status: isDone ? 'pending' : 'done',
        completedAt: isDone ? null : new Date()
      }
    })
  }

  // Calculate completed stats
  const completedCount = modules?.filter(m => m.status === 'done').length || 0
  const totalCount = modules?.length || 0
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const selectedMaterial = materials?.find(m => m.id === selectedMaterialId)

  // Parse JSON for microchunks or keyPoints
  const parseJsonSafe = (str: string | null) => {
    if (!str) return []
    try {
      return JSON.parse(str)
    } catch {
      return []
    }
  }

  // For anti-abandonment ADHD reminder
  const currentStreak = path.currentStreakDays || 0

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-cairo text-sm focus:outline-none"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
          العودة للمسارات
        </button>

        <div className="flex gap-2">
          {path.flashcardDeckId && (
            <Button 
              variant="secondary"
              size="sm"
              icon={<Award className="h-4 w-4" />}
              onClick={() => setActiveTab('flashcards')}
            >
              مراجعة البطاقات 🃏
            </Button>
          )}
          <Button 
            variant="secondary"
            size="sm"
            icon={<BrainCircuit className="h-4 w-4" />}
            onClick={() => setActiveTab('knowledgeMap')}
          >
            خريطة المعرفة 🗺️
          </Button>
        </div>
      </div>

      {/* Path Title Card */}
      <Card className="glass p-6 border border-dark-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-4 items-center">
            <span className="text-4xl p-4 bg-dark-surface rounded-2xl border border-dark-border shadow-inner shrink-0">
              {path.emoji || '📚'}
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-white font-cairo leading-none">{path.title}</h2>
              <p className="text-sm text-gray-400 font-tajawal mt-2 max-w-xl">{path.description}</p>
              {path.whyStarted && (
                <div className="mt-3 text-xs text-orange-300 font-tajawal bg-orange-500/10 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 border border-orange-500/20">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span><strong>دافعك الأولي:</strong> "{path.whyStarted}"</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 text-center shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-r border-[#2d3252]/40 pt-4 md:pt-0 md:pr-6">
            <div className="px-3">
              <span className="text-xs text-gray-400 font-tajawal block leading-none">مستوى الحفظ</span>
              <span className="text-xl font-black text-indigo-400 font-cairo block mt-2">{Math.round(path.retentionScore)}%</span>
            </div>
            <div className="px-3 border-r border-[#2d3252]/20">
              <span className="text-xs text-gray-400 font-tajawal block leading-none">دراسة تراكمية</span>
              <span className="text-xl font-black text-indigo-400 font-cairo block mt-2">{path.totalStudyMinutes} د</span>
            </div>
            <div className="px-3 border-r border-[#2d3252]/20">
              <span className="text-xs text-gray-400 font-tajawal block leading-none">سلسلة التعلم</span>
              <span className="text-xl font-black text-orange-400 font-cairo block mt-2">{currentStreak} أيام 🔥</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>التقدم الإجمالي ({completedCount} من {totalCount} وحدات)</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-[#131620] h-2.5 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-lg glow-primary"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Tabs Switcher */}
      <div className="flex border-b border-dark-border gap-4 pb-2">
        <button 
          className={`pb-2 font-cairo text-sm ${activeSubTab === 'modules' ? 'text-indigo-400 border-b-2 border-indigo-400 font-bold' : 'text-gray-400'}`}
          onClick={() => setActiveSubTab('modules')}
        >
          وحدات التعلم والدروس ({totalCount})
        </button>
        <button 
          className={`pb-2 font-cairo text-sm ${activeSubTab === 'materials' ? 'text-indigo-400 border-b-2 border-indigo-400 font-bold' : 'text-gray-400'}`}
          onClick={() => setActiveSubTab('materials')}
        >
          حافظة المستندات والتلخيص 📁 ({materials?.length || 0})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'modules' ? (
          <motion.div 
            key="modules-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Modules List */}
            <div className="lg:col-span-2 space-y-3">
              {isModulesLoading ? (
                <div className="text-center py-12 text-gray-400">جاري تحميل الوحدات...</div>
              ) : !modules || modules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">لا توجد دروس أو وحدات مدرجة في هذا المسار.</div>
              ) : (
                modules.map((mod) => {
                  const isSelected = selectedModuleId === mod.id
                  const isDone = mod.status === 'done'

                  return (
                    <Card 
                      key={mod.id}
                      className={`glass p-4 border transition-all cursor-pointer ${isSelected ? 'border-indigo-500' : isDone ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-dark-border'}`}
                      onClick={() => setSelectedModuleId(mod.id)}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleModuleDone(mod)
                            }}
                            className={`h-6 w-6 rounded-full flex items-center justify-center border transition-colors focus:outline-none ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-500 hover:border-indigo-400'}`}
                          >
                            {isDone && <Check className="h-3.5 w-3.5" />}
                          </button>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400 font-cairo">الوحدة {mod.order}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-cairo ${mod.type === 'feynman' ? 'bg-amber-500/10 text-amber-400' : mod.type === 'quiz' ? 'bg-rose-500/10 text-rose-400' : mod.type === 'project' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                {mod.type === 'feynman' ? 'فاينمان 🎓' : mod.type === 'quiz' ? 'اختبار 📝' : mod.type === 'project' ? 'مشروع 🛠️' : 'درس 📖'}
                              </span>
                            </div>
                            <h3 className={`font-bold text-sm font-cairo mt-1 ${isDone ? 'text-gray-400 line-through' : 'text-white'}`}>{mod.title}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mod.estimatedMinutes} د
                          </span>
                          <Button 
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            icon={<Play className="h-3 w-3" />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartPomodoro(mod)
                            }}
                          >
                            ابدأ
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Selected Module Detail Panel */}
            <div className="lg:col-span-1">
              {selectedModule ? (
                <Card className="glass p-5 border border-dark-border space-y-4 sticky top-6">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-cairo bg-indigo-500/10 px-2 py-1 rounded-md">
                      تفاصيل الوحدة {selectedModule.order}
                    </span>
                    <h3 className="text-lg font-bold text-white font-cairo mt-2">{selectedModule.title}</h3>
                  </div>

                  {/* Microchunks / Microlearning Chunks */}
                  {selectedModule.content ? (
                    <div className="space-y-3 border-t border-[#2d3252]/40 pt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-indigo-300 font-cairo">التعلم المصغر (Microchunks) 📖</h4>
                        <span className="text-[10px] text-gray-400">{activeChunkIndex + 1} من {parseJsonSafe(selectedModule.content).length}</span>
                      </div>

                      {/* Microchunk Display */}
                      <div className="p-4 bg-[#141724] border border-[#2d3252]/50 rounded-xl min-h-[120px] flex flex-col justify-between">
                        <p className="text-xs text-gray-200 leading-relaxed font-tajawal select-text">
                          {parseJsonSafe(selectedModule.content)[activeChunkIndex] || 'لا يوجد محتوى في هذه القطعة.'}
                        </p>
                        
                        <div className="flex justify-between mt-4">
                          <button 
                            disabled={activeChunkIndex === 0}
                            onClick={() => setActiveChunkIndex(prev => prev - 1)}
                            className="text-[10px] text-indigo-400 disabled:opacity-30 font-bold"
                          >
                            السابق
                          </button>
                          <button 
                            disabled={activeChunkIndex === parseJsonSafe(selectedModule.content).length - 1}
                            onClick={() => setActiveChunkIndex(prev => prev + 1)}
                            className="text-[10px] text-indigo-400 disabled:opacity-30 font-bold"
                          >
                            التالي
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : selectedModule.keyPoints ? (
                    <div className="space-y-2 border-t border-[#2d3252]/40 pt-4">
                      <h4 className="text-xs font-bold text-indigo-300 font-cairo">النقاط الرئيسية 📝</h4>
                      <ul className="space-y-1.5 text-xs text-gray-300 pr-4 list-disc font-tajawal select-text">
                        {parseJsonSafe(selectedModule.keyPoints).map((pt: string, idx: number) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Scientific actions */}
                  <div className="space-y-2 border-t border-[#2d3252]/40 pt-4">
                    <h4 className="text-xs font-bold text-indigo-300 font-cairo">المحرك العلمي للـ ADHD ⚡</h4>
                    
                    {/* Feynman Technique */}
                    {selectedModule.type === 'feynman' && (
                      <Button 
                        variant="secondary"
                        className="w-full text-xs justify-start h-10 border-[#2d3252]"
                        icon={<Award className="h-4 w-4 text-amber-400" />}
                        onClick={() => setActiveTab('feynman')}
                      >
                        ابدأ شرح فاينمان 🎓
                      </Button>
                    )}

                    {/* FSRS Flashcards Generation */}
                    {!selectedModule.autoGeneratedCards ? (
                      <Button 
                        variant="secondary"
                        className="w-full text-xs justify-start h-10 border-[#2d3252]"
                        icon={<Sparkles className="h-4 w-4 text-indigo-400" />}
                        isLoading={generatingCardsMap[selectedModule.id]}
                        onClick={() => handleGenerateCards(selectedModule)}
                      >
                        توليد بطاقات مراجعة 🃏
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary"
                        className="w-full text-xs justify-start h-10 border-[#2d3252]"
                        icon={<BookOpenCheck className="h-4 w-4 text-emerald-400" />}
                        onClick={() => setActiveTab('flashcards')}
                      >
                        مراجعة البطاقات ({selectedModule.cardCount}) 🃏
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="text-center p-6 text-gray-500 border border-dashed border-[#2d3252] rounded-2xl">
                  <HelpCircle className="h-10 w-10 text-gray-600 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-tajawal">اختر وحدة من القائمة لعرض تفاصيلها وخيارات التعلم العلمي المتاحة لها.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="materials-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Uploaded materials list */}
            <div className="lg:col-span-1 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">الملفات والمستندات العلمية</span>
                <Button 
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs px-2.5"
                  icon={<Plus className="h-3 w-3" />}
                  onClick={() => setUploadOpen(true)}
                >
                  رفع مستند
                </Button>
              </div>

              {!materials || materials.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-[#2d3252] rounded-2xl">لا توجد مستندات علمية حالياً.</div>
              ) : (
                materials.map((mat) => (
                  <Card 
                    key={mat.id}
                    className={`glass p-4 border transition-all cursor-pointer flex justify-between items-start gap-4 ${selectedMaterialId === mat.id ? 'border-indigo-500' : 'border-dark-border hover:border-indigo-500/30'}`}
                    onClick={() => setSelectedMaterialId(mat.id)}
                  >
                    <div className="flex gap-2.5">
                      <FileText className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-white font-cairo line-clamp-1">{mat.title}</h4>
                        <span className="text-[10px] text-gray-400 font-tajawal mt-1 block">
                          {mat.fileType === 'pdf' ? 'ملف PDF' : mat.fileType === 'link' ? 'رابط خارجي' : 'مستند نصي'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteMaterial(mat.id, e)}
                      className="p-1 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Card>
                ))
              )}
            </div>

            {/* Document summaries / Interactive 3D concept maps */}
            <div className="lg:col-span-2">
              {selectedMaterial ? (
                <Card className="glass p-5 border border-dark-border space-y-4">
                  <div className="flex justify-between items-center border-b border-[#2d3252]/40 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white font-cairo">{selectedMaterial.title}</h3>
                      <span className="text-[10px] text-indigo-400 font-tajawal">الحالة: {selectedMaterial.status === 'summarized' ? 'تم التلخيص بنجاح' : 'معلق'}</span>
                    </div>
                    {selectedMaterial.filePath && (
                      <a 
                        href={selectedMaterial.filePath} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-tajawal"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        عرض المصدر
                      </a>
                    )}
                  </div>

                  {selectedMaterial.status !== 'summarized' ? (
                    <Card className="p-8 text-center bg-[#131620]/30 border border-dashed border-[#2d3252]/50 space-y-4 flex flex-col items-center justify-center">
                      <BrainIcon className="h-12 w-12 text-indigo-500/40 animate-pulse" />
                      <h4 className="text-xs font-bold text-white font-cairo">لم يتم التلخيص الذكي للمستند بعد</h4>
                      <p className="text-[11px] text-gray-400 max-w-sm">حوّل النصوص المعقدة إلى خريطة ذهنية ثلاثية الأبعاد وملخص نقاط ADHD الميسر بنقرة واحدة.</p>
                      <Button 
                        variant="primary"
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
                <div className="text-center p-12 text-gray-500 border border-dashed border-[#2d3252] rounded-2xl">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs font-tajawal">اختر مستنداً من القائمة الجانبية لعرض الخريطة الذهنية التفاعلية أو الملخص.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        title="إضافة مستند إلى الحافظة"
        size="md"
      >
        <div className="space-y-4 font-tajawal">
          <Input 
            label="اسم المستند" 
            placeholder="مثال: ورقة بحثية في التسويق" 
            value={matTitle}
            onChange={(e) => setMatTitle(e.target.value)}
          />
          <div>
            <label className="text-xs text-gray-400 font-medium font-cairo">نوع المستند</label>
            <select 
              className="w-full mt-1 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-sm h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={matType}
              onChange={(e) => setMatType(e.target.value as any)}
            >
              <option value="text_input">كتابة نص مباشر</option>
              <option value="pdf">رابط ملف PDF</option>
              <option value="link">رابط موقع خارجي</option>
            </select>
          </div>

          {matType === 'text_input' ? (
            <div>
              <label className="text-xs text-gray-400 font-medium font-cairo">محتوى النص</label>
              <textarea 
                className="w-full mt-1 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-xs p-3 min-h-[150px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="اكتب أو الصق محتوى الدرس هنا لتلخيصه وتوليد خريطته الذهنية..."
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
              />
            </div>
          ) : (
            <Input 
              label="الرابط المباشر (URL)" 
              placeholder="https://..." 
              value={matUrl}
              onChange={(e) => setMatUrl(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleUploadMaterial}>إضافة المستند</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
