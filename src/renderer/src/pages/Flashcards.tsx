import { useState } from 'react'
import { Layers, Plus, Clock, Award } from 'lucide-react'
import { useDecksQuery, useCreateDeckMutation } from '../hooks/useFlashcards'
import { useReviewStore } from '../stores/review.store'
import { useAppStore } from '../stores/app.store'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'

export default function Flashcards() {
  const { data: decks, isLoading } = useDecksQuery()
  const createDeckMutation = useCreateDeckMutation()
  const { startSession } = useReviewStore()
  const { setActiveTab } = useAppStore()
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckEmoji, setNewDeckEmoji] = useState('🃏')
  const [newDeckDesc, setNewDeckDesc] = useState('')

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return
    createDeckMutation.mutate({
      name: newDeckName,
      emoji: newDeckEmoji,
      description: newDeckDesc || null,
      targetRetention: 0.90,
      createdAt: new Date()
    }, {
      onSuccess: () => {
        setCreateModalOpen(false)
        setNewDeckName('')
        setNewDeckEmoji('🃏')
        setNewDeckDesc('')
      }
    })
  }

  const handleStartReview = async (deckId: number) => {
    try {
      const dueCards = await window.api.flashcards.getDueCards(deckId)
      // If no due cards are scheduled, offer reviewing all cards or learning new cards
      const allCards = dueCards.length > 0 ? dueCards : await window.api.flashcards.getCards(deckId)
      
      if (allCards.length === 0) {
        alert('لا توجد بطاقات في هذه المجموعة حالياً. يمكنك إضافة بطاقات من خلال تفاصيل الوحدة في مسارات التعلم.')
        return
      }

      startSession(deckId, allCards)
      setActiveTab('flashcard-review')
    } catch (err: any) {
      alert(err.message || 'فشل تحميل البطاقات للمراجعة.')
    }
  }

  // Calculate totals
  const totalCardsCount = decks?.reduce((acc, d) => acc + (d.totalCards || 0), 0) || 0
  const totalDueCount = decks?.reduce((acc, d) => acc + (d.dueToday || 0), 0) || 0

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-cairo">بطاقات التكرار والـ FSRS 🃏</h1>
          <p className="text-gray-400 text-sm mt-1">تثبيت المعلومات في الذاكرة طويلة المدى بأحدث خوارزميات التكرار المتباعد</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus className="h-4 w-4" />} 
          onClick={() => setCreateModalOpen(true)}
        >
          إنشاء مجموعة بطاقات
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass p-5 border border-dark-border flex items-center gap-4">
          <span className="text-3xl p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-inner">
            <Layers className="h-6 w-6" />
          </span>
          <div>
            <span className="text-xs text-gray-400 block font-tajawal leading-none">إجمالي البطاقات</span>
            <span className="text-2xl font-black text-white font-cairo block mt-2">{totalCardsCount} بطاقة</span>
          </div>
        </Card>
        <Card className="glass p-5 border border-dark-border flex items-center gap-4">
          <span className="text-3xl p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20 shadow-inner">
            <Clock className="h-6 w-6 animate-pulse" />
          </span>
          <div>
            <span className="text-xs text-gray-400 block font-tajawal leading-none">مستحق المراجعة اليوم</span>
            <span className="text-2xl font-black text-orange-400 font-cairo block mt-2">{totalDueCount} بطاقات</span>
          </div>
        </Card>
        <Card className="glass p-5 border border-dark-border flex items-center gap-4">
          <span className="text-3xl p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-inner">
            <Award className="h-6 w-6" />
          </span>
          <div>
            <span className="text-xs text-gray-400 block font-tajawal leading-none">البطاقات المتقنة</span>
            <span className="text-2xl font-black text-emerald-400 font-cairo block mt-2">
              {decks?.reduce((acc, d) => acc + (d.masteredCards || 0), 0) || 0} بطاقة
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decks Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white font-cairo">مجموعات البطاقات</h2>
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">جاري تحميل المجموعات...</div>
          ) : !decks || decks.length === 0 ? (
            <Card className="glass p-12 text-center text-gray-500 border border-dashed border-dark-border">
              <Layers className="h-12 w-12 text-indigo-500/30 mx-auto mb-3" />
              <p className="text-sm font-tajawal">لا توجد مجموعات بطاقات حتى الآن. يتم إنشاء المجموعات تلقائياً عند توليد مسارات التعلم بالـ AI.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks.map((deck) => (
                <Card 
                  key={deck.id}
                  className="glass p-5 border border-dark-border flex flex-col justify-between hover:border-indigo-500/50 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-2xl p-2.5 bg-dark-surface rounded-xl border border-dark-border">
                        {deck.emoji || '🃏'}
                      </span>
                      {deck.dueToday > 0 ? (
                        <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-cairo animate-pulse">
                          {deck.dueToday} مستحقة
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 bg-dark-surface border border-dark-border px-2 py-0.5 rounded-full font-cairo">
                          مكتملة
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white font-cairo leading-snug line-clamp-1">{deck.name}</h3>
                      <p className="text-xs text-gray-400 font-tajawal mt-1 line-clamp-2">{deck.description || 'لا يوجد وصف لهذه المجموعة'}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#2d3252]/40 flex justify-between items-center">
                    <div className="text-[10px] text-gray-400 font-tajawal space-x-2">
                      <span>الكل: {deck.totalCards}</span>
                      <span className="border-r border-gray-700 h-2 inline-block mx-1" />
                      <span>متقن: {deck.masteredCards}</span>
                    </div>
                    <Button 
                      variant={deck.dueToday > 0 ? 'dopamine' : 'secondary'}
                      size="sm"
                      className="h-8 text-xs font-cairo"
                      onClick={() => handleStartReview(deck.id)}
                    >
                      {deck.dueToday > 0 ? 'ابدأ المراجعة 🃏' : 'استعراض البطاقات 🔍'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Forgetting Curve Chart Visual */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-white font-cairo">منحنى النسيان الذكي FSRS 🌌</h2>
          <Card className="glass p-5 border border-dark-border space-y-4">
            <div className="text-xs text-gray-400 font-tajawal leading-relaxed">
              يوضح المنحنى تراجع احتمالية تذكر المفاهيم بمرور الوقت. محرك **FSRS-7** يقوم بجدولة مراجعتك عند نقطة **90%** تماماً لضمان أفضل حفظ بأقل مجهود.
            </div>

            {/* SVG Interactive Forgetting Curve representation */}
            <div className="w-full bg-[#131620]/80 p-3 rounded-xl border border-[#2d3252]/30">
              <svg viewBox="0 0 300 150" className="w-full overflow-visible">
                {/* Grid Lines */}
                <line x1="30" y1="20" x2="280" y2="20" stroke="#2d3252" strokeWidth="1" strokeDasharray="3" />
                <line x1="30" y1="70" x2="280" y2="70" stroke="#2d3252" strokeWidth="1" strokeDasharray="3" />
                <line x1="30" y1="120" x2="280" y2="120" stroke="#2d3252" strokeWidth="1" />
                <line x1="30" y1="20" x2="30" y2="120" stroke="#2d3252" strokeWidth="1" />

                {/* Y Axis Labels */}
                <text x="5" y="24" fill="#64748b" className="text-[9px] font-mono">100%</text>
                <text x="10" y="74" fill="#64748b" className="text-[9px] font-mono">50%</text>
                <text x="15" y="124" fill="#64748b" className="text-[9px] font-mono">0%</text>

                {/* X Axis Labels */}
                <text x="30" y="138" fill="#64748b" className="text-[8px] font-tajawal">اليوم 1</text>
                <text x="150" y="138" fill="#64748b" className="text-[8px] font-tajawal">اليوم 15</text>
                <text x="260" y="138" fill="#64748b" className="text-[8px] font-tajawal">اليوم 30</text>

                {/* The Forgetting Curve Path */}
                {/* Curve: starts at 100% (y=20), decays logarithmically to 30% (y=100) */}
                <path 
                  d="M 30,20 Q 90,80 150,95 T 280,105" 
                  fill="none" 
                  stroke="url(#gradient-curve)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Spaced Repetition Review Points */}
                {/* Review 1 at Day 3 */}
                <circle cx="50" cy="40" r="4.5" fill="#f97316" className="animate-ping" />
                <circle cx="50" cy="40" r="3.5" fill="#f97316" />
                
                {/* Review 2 at Day 10 */}
                <circle cx="100" cy="78" r="3.5" fill="#6366f1" />

                {/* Review 3 at Day 25 */}
                <circle cx="210" cy="99" r="3.5" fill="#10b981" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient-curve" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Explanation of items */}
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-tajawal">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                <span>مراجعة FSRS مستحقة ⚠️</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                <span>مراجعة مؤمنة 🔒</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>ثبات تام ✅</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Deck Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="إنشاء مجموعة بطاقات مخصصة"
        size="md"
      >
        <div className="space-y-4 font-tajawal">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <Input 
                label="اسم المجموعة" 
                placeholder="مثال: مفردات اللغة الإنجليزية" 
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
              />
            </div>
            <div>
              <Input 
                label="رمز (Emoji)" 
                placeholder="🃏" 
                value={newDeckEmoji}
                onChange={(e) => setNewDeckEmoji(e.target.value)}
              />
            </div>
          </div>
          <Input 
            label="الوصف" 
            placeholder="محتوى أو موضوع هذه المجموعة من البطاقات" 
            value={newDeckDesc}
            onChange={(e) => setNewDeckDesc(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleCreateDeck}>إنشاء المجموعة</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
