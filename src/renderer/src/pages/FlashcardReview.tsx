import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, HelpCircle, Flame } from 'lucide-react'
import { useReviewStore } from '../stores/review.store'
import { useAppStore } from '../stores/app.store'
import { useReviewCardMutation } from '../hooks/useFlashcards'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ReactMarkdown from 'react-markdown'

export default function FlashcardReview() {
  const { 
    deckId, 
    cards, 
    currentIndex, 
    showAnswer, 
    isFinished, 
    xpEarned, 
    setShowAnswer, 
    rateCardInSession, 
    nextCard, 
    endSession 
  } = useReviewStore()
  
  const { setActiveTab } = useAppStore()
  const reviewCardMutation = useReviewCardMutation(deckId || 0)

  if (!deckId || cards.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-gray-400 font-tajawal">
        <p>لا توجد جلسة مراجعة نشطة حالياً.</p>
        <Button 
          variant="primary" 
          className="mt-4"
          onClick={() => setActiveTab('flashcards')}
        >
          العودة للبطاقات
        </Button>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  // FSRS ratings
  const ratings = [
    { label: '😵 نسيت', value: 1, color: 'bg-red-500 hover:bg-red-600 focus:ring-red-500', xp: '+0 XP' },
    { label: '😓 صعب', value: 2, color: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500', xp: '+2 XP' },
    { label: '🙂 مقبول', value: 3, color: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500', xp: '+5 XP' },
    { label: '😊 سهل', value: 4, color: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500', xp: '+7 XP' },
  ]

  const handleRateCard = (ratingValue: number) => {
    reviewCardMutation.mutate({
      cardId: currentCard.id,
      rating: ratingValue
    }, {
      onSuccess: (res: any) => {
        const xp = res?.xpAwarded || 0
        rateCardInSession(xp)
        nextCard()
      },
      onError: () => {
        // Fallback progress if backend has an issue
        nextCard()
      }
    })
  }

  // Check if review was delayed (e.g. reviewed after next interval date)
  const isDelayed = currentCard.lastReviewDate 
    ? (Date.now() - new Date(currentCard.dueDate || '').getTime()) > 7 * 24 * 60 * 60 * 1000
    : false

  if (isFinished) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6 font-tajawal">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl space-y-4 flex flex-col items-center shadow-lg shadow-emerald-500/5"
        >
          <CheckCircle2 className="h-16 w-16 text-emerald-400" />
          <h2 className="text-2xl font-black text-white font-cairo">أحسنت العمل يا بطل! 🎉</h2>
          <p className="text-sm text-gray-300">لقد أكملت مراجعة جميع بطاقات اليوم بنجاح وواجهت منحنى النسيان.</p>
          
          <div className="flex gap-4 pt-2">
            <div className="bg-[#141724] px-5 py-3 rounded-2xl border border-dark-border">
              <span className="text-xs text-gray-400 block">إجمالي الـ XP المكتسب</span>
              <span className="text-xl font-bold text-indigo-400 mt-1 block font-cairo">+{xpEarned} XP</span>
            </div>
            <div className="bg-[#141724] px-5 py-3 rounded-2xl border border-dark-border">
              <span className="text-xs text-gray-400 block">البطاقات المراجعة</span>
              <span className="text-xl font-bold text-indigo-400 mt-1 block font-cairo">{cards.length} بطاقات</span>
            </div>
          </div>
        </motion.div>

        <Button 
          variant="primary" 
          className="w-full h-12"
          onClick={() => {
            endSession()
            setActiveTab('flashcards')
          }}
        >
          العودة لوحة تحكم البطاقات
        </Button>
      </div>
    )
  }

  const progressPct = Math.round(((currentIndex) / cards.length) * 100)

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto max-w-2xl mx-auto flex flex-col justify-between">
      {/* Session Progress Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-tajawal text-gray-400">
          <button 
            onClick={() => {
              endSession()
              setActiveTab('flashcards')
            }}
            className="flex items-center gap-1 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
            إنهاء الجلسة
          </button>
          <span>البطاقة {currentIndex + 1} من {cards.length} ({progressPct}% مكتمل)</span>
        </div>
        <div className="w-full bg-[#131620] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Delayed Review Alert Banner */}
      {isDelayed && (
        <Card className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-tajawal rounded-xl flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400 shrink-0 animate-bounce" />
          <span>مستحق منذ أكثر من 7 أيام: إجابة صحيحة = **XP مضاعف 3 مرات! 💎**</span>
        </Card>
      )}

      {/* The Flashcard */}
      <div className="my-auto py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (showAnswer ? '-back' : '-front')}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`min-h-[250px] p-8 glass rounded-3xl border border-dark-border shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden`}
          >
            {/* Card Content Front */}
            {!showAnswer ? (
              <>
                <span className="text-[10px] text-indigo-400 font-bold tracking-wider font-cairo bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  سؤال / مفهوم
                </span>
                
                <div className="w-full my-auto text-lg md:text-xl font-bold text-white font-cairo select-text leading-relaxed prose prose-invert">
                  <ReactMarkdown>{currentCard.front}</ReactMarkdown>
                </div>

                {currentCard.hint && (
                  <div className="text-xs text-gray-500 font-tajawal flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" />
                    تلميح: {currentCard.hint}
                  </div>
                )}
              </>
            ) : (
              // Card Content Back
              <>
                <span className="text-[10px] text-emerald-400 font-bold tracking-wider font-cairo bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  الجواب / الشرح
                </span>

                <div className="w-full my-auto text-sm md:text-base text-gray-200 font-tajawal select-text leading-relaxed text-right prose prose-invert max-h-[160px] overflow-y-auto pr-1">
                  <ReactMarkdown>{currentCard.back}</ReactMarkdown>
                </div>

                <div className="text-[10px] text-gray-500 font-tajawal border-t border-[#2d3252]/30 w-full pt-3">
                  {currentCard.hint && <span>تلميح: {currentCard.hint}</span>}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="pt-6 border-t border-[#2d3252]/40">
        {!showAnswer ? (
          <Button 
            variant="primary" 
            className="w-full h-12 font-cairo text-sm glow-primary"
            onClick={() => setShowAnswer(true)}
          >
            عرض الجواب 👁️
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-center text-xs text-gray-400 font-tajawal">كيف كان تذكرك للمعلومة؟</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ratings.map((rate) => (
                <button
                  key={rate.value}
                  onClick={() => handleRateCard(rate.value)}
                  className={`h-12 rounded-xl text-white font-cairo text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1117] flex flex-col justify-center items-center ${rate.color}`}
                >
                  <span>{rate.label}</span>
                  <span className="text-[9px] opacity-75 font-mono font-medium">{isDelayed && rate.value > 1 ? '+15 XP' : rate.xp}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
