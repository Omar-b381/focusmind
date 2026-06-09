import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Send, AlertTriangle, AlertCircle, RefreshCw, Layers } from 'lucide-react'
import { usePathsQuery } from '../hooks/useLearningPaths'
import { useEvaluateFeynmanSessionMutation, useFeynmanSessionsQuery } from '../hooks/useFeynman'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ReactMarkdown from 'react-markdown'
import { useAppStore } from '../stores/app.store'

export default function Feynman() {
  const { data: paths } = usePathsQuery()
  const { data: sessions, isLoading: isHistoryLoading } = useFeynmanSessionsQuery()
  const evaluateMutation = useEvaluateFeynmanSessionMutation()
  const { setActiveTab } = useAppStore()

  const [concept, setConcept] = useState('')
  const [explanation, setExplanation] = useState('')
  const [audience, setAudience] = useState('طفل بعمر 10 سنوات')
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null)
  
  const [evaluatedSession, setEvaluatedSession] = useState<any | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isGeneratingGapsCards, setIsGeneratingGapsCards] = useState(false)

  // Timer state
  const [startTime] = useState(Date.now())

  const handleEvaluate = () => {
    if (!concept.trim() || !explanation.trim()) return
    const durationMs = Date.now() - startTime
    
    evaluateMutation.mutate({
      concept: concept.trim(),
      explanation: explanation.trim(),
      targetAudience: audience,
      pathId: selectedPathId || undefined,
      durationMs
    }, {
      onSuccess: (data) => {
        setEvaluatedSession(data)
      }
    })
  }

  // Parse JSON safe
  const parseJsonSafe = (str: string | null) => {
    if (!str) return []
    try {
      return JSON.parse(str)
    } catch {
      return []
    }
  }

  // Generate cards from the gaps identified by the AI
  const handleGenerateCardsFromGaps = async () => {
    if (!evaluatedSession?.aiGaps) return
    setIsGeneratingGapsCards(true)
    try {
      // 1. Create a custom deck for this concept gaps
      const newDeck = await window.api.flashcards.createDeck({
        name: `ثغرات: ${evaluatedSession.concept}`,
        emoji: '💡',
        description: `بطاقات مولدة تلقائياً لتغطية الثغرات المكتشفة في فهم مفهوم: ${evaluatedSession.concept}`,
        targetRetention: 0.90,
        pathId: evaluatedSession.pathId || null,
        createdAt: new Date()
      })

      // 2. Generate flashcards from the gaps text
      const gaps = parseJsonSafe(evaluatedSession.aiGaps)
      const promptContent = `الفجوات العلمية المكتشفة:\n${gaps.map((g: string) => `- ${g}`).join('\n')}\nالرجاء توليد بطاقات دراسية لتغطية هذه الثغرات بالتحديد.`
      
      await window.api.flashcards.generateCardsForModule(newDeck.id, 0, promptContent)
      
      alert('تم إنشاء مجموعة بطاقات لتغطية الثغرات المكتشفة بنجاح! تم نقلك لقسم المراجعة.')
      setActiveTab('flashcards')
    } catch (err: any) {
      alert(err.message || 'فشل توليد البطاقات من الثغرات.')
    } finally {
      setIsGeneratingGapsCards(false)
    }
  }

  const handleReset = () => {
    setConcept('')
    setExplanation('')
    setEvaluatedSession(null)
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-cairo">تقنية فاينمان للتعلم العلمي 🎓</h1>
          <p className="text-gray-400 text-sm mt-1">تأكد من فهمك الحقيقي للمفاهيم عبر شرحها بأسلوب بسيط وتقييمها بالذكاء الاصطناعي</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'شرح مفهوم جديد' : 'سجل الجلسات السابقة 📂'}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showHistory ? (
          // HISTORY TAB
          <motion.div
            key="history-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-white font-cairo">الجلسات السابقة</h2>
            {isHistoryLoading ? (
              <div className="text-center py-12 text-gray-400">جاري تحميل السجل...</div>
            ) : !sessions || sessions.length === 0 ? (
              <Card className="glass p-12 text-center text-gray-500 border border-dashed border-dark-border">
                <Award className="h-12 w-12 text-indigo-500/30 mx-auto mb-3" />
                <p className="text-sm font-tajawal">لا توجد جلسات سابقة. ابدأ بشرح أول مفهوم الآن!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.map((sess) => (
                  <Card key={sess.id} className="glass p-4 border border-dark-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-cairo text-sm">{sess.concept}</span>
                        <span className="text-[10px] text-gray-400">لـ: {sess.targetAudience}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-tajawal line-clamp-1">{sess.explanation}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-tajawal">التقييم</span>
                        <span className="text-sm font-extrabold text-indigo-400 font-cairo">{sess.aiScore}/100</span>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="h-8 text-xs font-cairo"
                        onClick={() => {
                          setEvaluatedSession(sess)
                          setShowHistory(false)
                        }}
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        ) : evaluatedSession ? (
          // EVALUATION RESULT
          <motion.div
            key="result-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <Card className="glass p-6 border border-dark-border space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#2d3252]/40 pb-4 gap-4">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-cairo bg-indigo-500/10 px-2.5 py-1 rounded-md">
                    مراجعة تقييم المفهوم
                  </span>
                  <h2 className="text-2xl font-black text-white font-cairo mt-2">{evaluatedSession.concept}</h2>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-[#141724] px-5 py-3 rounded-2xl border border-dark-border text-center">
                    <span className="text-xs text-gray-400 block font-tajawal">الدرجة الإجمالية</span>
                    <span className="text-2xl font-black text-indigo-400 mt-1 block font-cairo">{evaluatedSession.aiScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Core Axes Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'الدقة العلمية', val: evaluatedSession.aiScoreAccuracy, color: 'bg-indigo-500' },
                  { label: 'الوضوح والتبسيط', val: evaluatedSession.aiScoreClarity, color: 'bg-emerald-500' },
                  { label: 'عمق الفهم', val: evaluatedSession.aiScoreDepth, color: 'bg-blue-500' },
                  { label: 'جودة الأمثلة', val: evaluatedSession.aiScoreAnalogy, color: 'bg-amber-500' },
                ].map((axis, i) => (
                  <div key={i} className="bg-[#131620]/40 p-3.5 rounded-xl border border-dark-border/40 space-y-2">
                    <span className="text-xs text-gray-400 font-tajawal">{axis.label}</span>
                    <div className="flex justify-between items-center text-sm font-bold text-white font-cairo">
                      <span>{axis.val || 0}%</span>
                    </div>
                    <div className="w-full bg-[#131620] h-1.5 rounded-full overflow-hidden">
                      <div className={`${axis.color} h-full rounded-full`} style={{ width: `${axis.val || 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Content */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-indigo-300 font-cairo">ملاحظات وتقييم المرشد الذكي 📝</h3>
                <div className="p-4 bg-[#141621]/45 border border-dark-border rounded-xl text-xs leading-relaxed text-gray-300 font-tajawal select-text text-right prose prose-invert">
                  <ReactMarkdown>{evaluatedSession.aiFeedback || 'لا يوجد تقييم نصي متاح حالياً.'}</ReactMarkdown>
                </div>
              </div>

              {/* Knowledge Gaps */}
              {evaluatedSession.aiGaps && parseJsonSafe(evaluatedSession.aiGaps).length > 0 && (
                <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-orange-400">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    <h4 className="text-xs font-bold font-cairo">الفجوات العلمية المكتشفة في شرحك ⚠️</h4>
                  </div>
                  <ul className="text-xs text-gray-300 list-disc pr-5 space-y-1.5 font-tajawal select-text">
                    {parseJsonSafe(evaluatedSession.aiGaps).map((gap: string, idx: number) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                  
                  <div className="pt-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="text-xs font-cairo h-9 border-orange-500/20 hover:bg-orange-500/10 text-orange-300"
                      icon={<Layers className="h-3.5 w-3.5" />}
                      onClick={handleGenerateCardsFromGaps}
                      isLoading={isGeneratingGapsCards}
                    >
                      توليد بطاقات دراسية لتغطية الثغرات 🃏
                    </Button>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {evaluatedSession.aiNextSteps && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <AlertCircle className="h-4.5 w-4.5" />
                    <h4 className="text-xs font-bold font-cairo">الخطوات التالية المقترحة 🧭</h4>
                  </div>
                  <p className="text-xs text-gray-300 font-tajawal leading-relaxed select-text">{evaluatedSession.aiNextSteps}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d3252]/40">
                <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={handleReset}>
                  شرح مفهوم آخر
                </Button>
                <Button variant="primary" onClick={handleReset}>
                  حسناً، فهمت
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          // EXPLANATION WRITER FORM
          <motion.div
            key="form-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card className="glass p-6 border border-dark-border space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-medium font-cairo">المفهوم أو الفكرة التي تدرسها</label>
                    <input 
                      className="w-full mt-1.5 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-sm h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="مثال: خوارزمية التشفير RSA، التمثيل الضوئي للنبات"
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium font-cairo">الفئة المستهدفة بالشرح (الجمهور)</label>
                    <select 
                      className="w-full mt-1.5 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-sm h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    >
                      <option value="طفل بعمر 10 سنوات">طفل بعمر 10 سنوات (شديد التبسيط)</option>
                      <option value="شخص مبتدئ تماماً">شخص مبتدئ تماماً (بدون مصطلحات صعبة)</option>
                      <option value="زميل دراسة / عمل">زميل دراسة / عمل (مستوى متوسط)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-medium font-cairo">اربط بمسار تعلم (اختياري)</label>
                  <select 
                    className="w-full mt-1.5 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-sm h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={selectedPathId || ''}
                    onChange={(e) => setSelectedPathId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">لا يوجد ارتباط مباشر</option>
                    {paths?.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-400 font-medium font-cairo">اكتب شرحك بأسلوبك وبأبسط شكل ممكن</label>
                    <span className="text-[10px] text-gray-500">{explanation.split(/\s+/).filter(Boolean).length} كلمة</span>
                  </div>
                  <textarea 
                    className="w-full mt-1.5 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-white text-xs p-4 min-h-[200px] focus:outline-none focus:ring-1 focus:ring-indigo-500 select-text font-tajawal text-right leading-relaxed"
                    placeholder="ابدأ الشرح هنا. تذكر: استخدم التشبيهات والأمثلة العملية، وابتعد تماماً عن المصطلحات المعقدة التي تحتاج لحفظ مسبق..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#2d3252]/40">
                <div className="text-xs text-orange-300 font-tajawal bg-orange-500/10 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 border border-orange-500/20">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>الشرح الجيد يزيد XP بمقدار 30+ نقطة! 🎉</span>
                </div>
                
                <Button 
                  variant="primary" 
                  className="h-11 px-6 glow-primary font-cairo text-xs" 
                  icon={<Send className="h-4 w-4" />}
                  isLoading={evaluateMutation.isPending}
                  onClick={handleEvaluate}
                >
                  أرسل الشرح للتقييم الذكي
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
