import { useState, useMemo } from 'react'
import { 
  useJournalEntriesQuery, 
  useCreateJournalEntryMutation, 
  useDeleteJournalEntryMutation, 
  useAnalyzeJournalEntryMutation 
} from '../hooks/useJournal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { 
  Sparkles, Calendar, BookOpen, Trash2, Smile, 
  ShieldAlert, Heart
} from 'lucide-react'

const EMOTION_WHEEL = {
  joy: { color: 'border-yellow-400 text-yellow-400 bg-yellow-400/5', secondary: ['سكينة', 'بهجة', 'سرور'], arabic: 'فرح 💛' },
  trust: { color: 'border-emerald-400 text-emerald-400 bg-emerald-400/5', secondary: ['قبول', 'ثقة', 'إعجاب'], arabic: 'ثقة 💚' },
  fear: { color: 'border-sky-400 text-sky-400 bg-sky-400/5', secondary: ['قلق', 'خوف', 'رعب'], arabic: 'خوف 💙' },
  surprise: { color: 'border-purple-400 text-purple-400 bg-purple-400/5', secondary: ['تشتت', 'دهشة', 'ذهول'], arabic: 'مفاجأة 💜' },
  sadness: { color: 'border-blue-400 text-blue-400 bg-blue-400/5', secondary: ['شجن', 'حزن', 'أسى'], arabic: 'حزن 💙' },
  disgust: { color: 'border-teal-400 text-teal-400 bg-teal-400/5', secondary: ['ضجر', 'اشمئزاز', 'مقت'], arabic: 'اشمئزاز 💚' },
  anger: { color: 'border-rose-500 text-rose-500 bg-rose-500/5', secondary: ['انزعاج', 'غضب', 'غيظ'], arabic: 'غضب ❤️' },
  anticipation: { color: 'border-orange-400 text-orange-400 bg-orange-400/5', secondary: ['اهتمام', 'ترقب', 'حذر'], arabic: 'ترقّب 🧡' }
}

const JOURNAL_TYPES = [
  { id: 'free', name: 'كتابة حرة', emoji: '📝', durationMin: 5, prompts: ['ما الذي يجول في خاطرك الآن؟ اكتب دون قيود.'] },
  { id: 'morning', name: 'صفحات الصباح', emoji: '🌅', durationMin: 5, prompts: ['كيف تشعر بجسدك وطاقتك الآن؟', 'ما الشيء الوحيد الذي لو أنجزته اليوم ستشعر بالرضا؟'] },
  { id: 'evening', name: 'مراجعة المساء', emoji: '🌙', durationMin: 7, prompts: ['ما الذي أنجزته اليوم مهما كان صغيراً؟', 'ما العقبة التي واجهتها وكيف تعاملت معها؟'] },
  { id: 'shame_breaker', name: 'قاطع العار 💙', emoji: '🛡️', durationMin: 3, prompts: ['اكتب الفشل المزعوم دون أن تحكم على نفسك.', 'ما المشاعر الجسدية المرافقة؟ اكتبها هنا.', 'لو صديقك حدث له هذا، ماذا ستقول له؟'] },
  { id: 'decision', name: 'تفكير القرار', emoji: '🔮', durationMin: 10, prompts: ['ما القرار الصعب الذي تفكر فيه؟', 'ما هي أفضل وأسوأ السيناريوهات المتوقعة؟'] }
]

export default function Journal() {
  const [selectedType, setSelectedType] = useState('free')
  const [content, setContent] = useState('')
  const [primaryEmotion, setPrimaryEmotion] = useState('anticipation')
  const [secondaryEmotion, setSecondaryEmotion] = useState('اهتمام')
  const [intensity] = useState(3)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [moodLevel, setMoodLevel] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)
  const [activePromptIndex, setActivePromptIndex] = useState(0)

  // Queries & Mutations
  const { data: entries = [], isLoading: isEntriesLoading } = useJournalEntriesQuery()
  const createEntryMutation = useCreateJournalEntryMutation()
  const deleteEntryMutation = useDeleteJournalEntryMutation()
  const analyzeMutation = useAnalyzeJournalEntryMutation()

  const currentTypeData = useMemo(() => {
    return JOURNAL_TYPES.find(t => t.id === selectedType) || JOURNAL_TYPES[0]
  }, [selectedType])

  const handleSelectType = (id: string) => {
    setSelectedType(id)
    setActivePromptIndex(0)
    setContent('')
  }

  const handleNextPrompt = () => {
    if (activePromptIndex < currentTypeData.prompts.length - 1) {
      setActivePromptIndex(prev => prev + 1)
      setContent(prev => prev + '\n\n')
    }
  }

  const handleAnalyze = async () => {
    if (!content.trim()) return
    await analyzeMutation.mutateAsync({ content, type: currentTypeData.name })
  }

  const handleSave = async () => {
    if (!content.trim()) return
    
    // Automatically perform analysis if not done yet
    let aiData = analyzeMutation.data
    if (!aiData) {
      aiData = await analyzeMutation.mutateAsync({ content, type: currentTypeData.name })
    }

    await createEntryMutation.mutateAsync({
      date: new Date().toISOString().split('T')[0],
      type: selectedType as 'morning' | 'evening' | 'shame_breaker' | 'decision' | 'free',
      content,
      prompt: currentTypeData.prompts[activePromptIndex] || null,
      primaryEmotion,
      secondaryEmotion,
      emotionIntensity: intensity,
      emotionColor: '#6366f1',
      energyAtWrite: energyLevel,
      moodAtWrite: moodLevel,
      sleepLastNight: sleepHours,
      aiInsights: aiData?.insights || null,
      aiDetectedPatterns: '[]',
      aiShameLevel: aiData?.shameLevel || 1,
      aiActionSuggested: aiData?.actionSuggested || null,
      xpEarned: selectedType === 'shame_breaker' ? 15 : 10,
      wordCount: content.trim().split(/\s+/).length
    })

    setContent('')
    analyzeMutation.reset()
    alert('تم حفظ اليوميات بنجاح وحصلت على نقاط XP! 🎉')
  }

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الإدخال؟')) {
      await deleteEntryMutation.mutateAsync(id)
    }
  }

  return (
    <div className="h-full flex flex-col font-tajawal text-gray-200">
      {/* Top Header */}
      <div className="flex justify-between items-center p-6 border-b border-[#2d3252]/80 bg-[#131620] shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-cairo text-white flex items-center gap-2">
            <span>📓 اليوميات وتنظيم العواطف</span>
            <span className="text-xs font-normal text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Emotional Co-regulation
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">علاج دوامة لوم الذات (Shame Spiral) وبناء الوعي الذاتي لعقول ADHD</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Write entry */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Templates Grid */}
          <div className="grid grid-cols-5 gap-3">
            {JOURNAL_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => handleSelectType(type.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  selectedType === type.id
                    ? type.id === 'shame_breaker'
                      ? 'bg-rose-500/10 border-rose-500 shadow-md text-white shadow-rose-500/5'
                      : 'bg-indigo-600/10 border-indigo-500 shadow-md text-white shadow-indigo-500/5'
                    : 'bg-[#1c2030]/60 border-[#2d3252]/40 text-gray-400 hover:bg-[#21253a]'
                }`}
              >
                <span className="text-2xl mb-1.5">{type.emoji}</span>
                <span className="text-xs font-bold font-cairo">{type.name}</span>
                <span className="text-[10px] text-gray-500 mt-1">{type.durationMin} دقائق</span>
              </button>
            ))}
          </div>

          {/* Shame Breaker Alert Warning */}
          {selectedType === 'shame_breaker' && (
            <Card className="border-rose-500/30 bg-rose-500/5 p-4 flex gap-3 items-start">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white font-cairo">قاطع دوامة العار (Shame-Breaker)</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  عندما تشعر بالإحباط، الجمود، أو فوات المواعيد، يتسلل العار ليعطل دماغك. اكتب كل شيء هنا، وسوف نساعدك على تحويل هذا اللوم إلى فهم علمي وخطوات صغيرة دون لوم أو إصدار أحكام.
                </p>
              </div>
            </Card>
          )}

          {/* Prompt Question */}
          <div className="bg-[#131620]/70 border border-[#2d3252]/50 rounded-2xl p-4 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">سؤال موجه ({activePromptIndex + 1}/{currentTypeData.prompts.length})</span>
              <p className="text-sm font-bold text-white leading-normal">
                {currentTypeData.prompts[activePromptIndex]}
              </p>
            </div>
            {currentTypeData.prompts.length > 1 && activePromptIndex < currentTypeData.prompts.length - 1 && (
              <Button size="sm" variant="ghost" className="text-indigo-400" onClick={handleNextPrompt}>
                السؤال التالي
              </Button>
            )}
          </div>

          {/* Text Input area */}
          <textarea
            placeholder="اكتب ما يدور في ذهنك هنا... أفكار، مخاوف، عقبات..."
            className="w-full h-64 bg-[#151924]/60 border border-[#2d3252]/60 rounded-2xl p-5 font-tajawal text-sm leading-relaxed text-gray-200 focus:outline-none focus:border-indigo-500 scrollbar-thin resize-none"
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          {/* Interactive Emotion Wheel (Plutchik Grid) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5">
              <Smile className="h-4 w-4 text-indigo-400" />
              <span>ما هي العاطفة المهيمنة عليك الآن؟ (عجلة عواطف Plutchik)</span>
            </h4>
            <div className="grid grid-cols-4 gap-2.5">
              {Object.entries(EMOTION_WHEEL).map(([key, data]) => (
                <div
                  key={key}
                  onClick={() => {
                    setPrimaryEmotion(key)
                    setSecondaryEmotion(data.secondary[0])
                  }}
                  className={`p-3 rounded-xl border cursor-pointer text-right transition-all flex flex-col justify-between ${
                    primaryEmotion === key
                      ? `${data.color} border-current ring-1 ring-current`
                      : 'bg-[#1c2030]/40 border-[#2d3252]/30 hover:bg-[#21253a]/60 text-gray-400'
                  }`}
                >
                  <span className="text-xs font-bold font-cairo">{data.arabic}</span>
                  <div className="flex gap-1 overflow-x-auto mt-2 scrollbar-none">
                    {data.secondary.map(sec => (
                      <span
                        key={sec}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPrimaryEmotion(key)
                          setSecondaryEmotion(sec)
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          secondaryEmotion === sec
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#151924]/60 text-gray-400 hover:text-white'
                        }`}
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment metrics: Energy, Mood, Sleep */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#131620]/60 p-4 border border-[#2d3252]/40 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-gray-400 block">مستوى طاقتك الحالية: {energyLevel}/5</label>
              <input 
                type="range" min="1" max="5" 
                className="w-full h-1.5 bg-[#252a40] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                value={energyLevel}
                onChange={e => setEnergyLevel(Number(e.target.value))}
              />
            </div>
            <div className="bg-[#131620]/60 p-4 border border-[#2d3252]/40 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-gray-400 block">مستوى مزاجك العام: {moodLevel}/5</label>
              <input 
                type="range" min="1" max="5" 
                className="w-full h-1.5 bg-[#252a40] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                value={moodLevel}
                onChange={e => setMoodLevel(Number(e.target.value))}
              />
            </div>
            <div className="bg-[#131620]/60 p-4 border border-[#2d3252]/40 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-gray-400 block">ساعات نوم الليلة الماضية: {sleepHours} ساعة</label>
              <input 
                type="range" min="3" max="11" step="0.5" 
                className="w-full h-1.5 bg-[#252a40] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                value={sleepHours}
                onChange={e => setSleepHours(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              isLoading={analyzeMutation.isPending} 
              icon={<Sparkles className="h-4 w-4 text-orange-400" />}
              onClick={handleAnalyze}
            >
              استشارة المحلل العاطفي الذكي ✨
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!content.trim()}>
              حفظ الإدخال للحصاد اليومي
            </Button>
          </div>

          {/* AI coach panel results inside the editor page if available */}
          {analyzeMutation.data && (
            <Card className="border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <h4 className="text-sm font-bold text-white font-cairo">تحليل المحلل العاطفي الذكي (ADHD Coach)</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">الرؤية السلوكية المكتشفة</span>
                  <p className="text-xs text-gray-300 leading-normal">{analyzeMutation.data.insights}</p>
                </div>
                <div className="space-y-1 bg-[#131620]/40 p-3 rounded-xl border border-[#2d3252]/40">
                  <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    مستوى العار: {analyzeMutation.data.shameLevel}/5
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block mt-2">خطوة مصغرة مقترحة (دقيقتين فقط)</span>
                  <p className="text-xs text-indigo-300 leading-normal font-semibold mt-1">
                    🎯 {analyzeMutation.data.actionSuggested}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right pane: Journal history log */}
        <div className="w-80 border-l border-[#2d3252]/60 bg-[#151924]/80 flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2d3252]/40 bg-[#131620]/50 shrink-0">
            <h4 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>تاريخ المذكرات واليوميات ({entries.length})</span>
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {isEntriesLoading ? (
              <div className="text-center py-8 text-gray-500">جاري تحميل سجل اليوميات...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">لم تكتب أي يوميات بعد. ابدأ الآن!</div>
            ) : (
              [...entries].reverse().map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#2d3252]/40 bg-[#1c2030]/40 space-y-2 relative group"
                >
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute left-2 top-2 p-1 text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">
                      {item.type === 'shame_breaker' ? 'قاطع العار' : item.type === 'morning' ? 'صباحية' : item.type === 'evening' ? 'مسائية' : 'حرة'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-normal line-clamp-3 whitespace-pre-line">
                    {item.content}
                  </p>
                  {item.primaryEmotion && (
                    <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-[#2d3252]/20">
                      <Heart className="h-3 w-3 text-rose-400" />
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        عاطفة: {item.primaryEmotion} {item.secondaryEmotion ? `(${item.secondaryEmotion})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
