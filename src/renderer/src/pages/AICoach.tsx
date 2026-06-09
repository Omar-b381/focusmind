import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Brain, AlertCircle, HelpCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً عمر! أنا مدربك الشخصي لـ ADHD. كيف يمكنني مساعدتك اليوم؟ يمكنك التحدث معي حول أي تشتت، أو طلب تقسيم مهمة صعبة لخطوات صغيرة، أو مجرد التنفيس عن قلقك.',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSubmitting) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsSubmitting(true)

    try {
      if (window.api && window.api.ai) {
        // Send previous messages format to main process AI
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content
        }))
        const reply = await window.api.ai.sendChatMessage('coach', apiMessages)
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply.content || 'عذراً يا عمر، لم أستطع فهم الرسالة بشكل كامل. أعد صياغتها من فضلك.',
          timestamp: new Date()
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        // Fallback simulate response in browser
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'هذا رد تجريبي. يرجى تفعيل مفاتيح الـ API في الإعدادات لتفعيل المحادثة الحقيقية مع المساعد الذكي.',
            timestamp: new Date()
          }
          setMessages((prev) => [...prev, assistantMessage])
        }, 1000)
      }
    } catch (err) {
      console.error('AI Chat Error:', err)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'حدث خطأ أثناء الاتصال بمزود الذكاء الاصطناعي. يرجى التحقق من مفتاح الـ API والاتصال بالإنترنت في صفحة الإعدادات.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleParalysisClick = () => {
    setInputValue('أنا أشعر بشلل المهام (Task Paralysis) وعاجز تماماً عن بدء العمل. ساعدني!')
  }

  const handleBreakdownClick = () => {
    setInputValue('عندي مهمة صعبة ومحتاج منك تقسمها لخطوات صغيرة جداً وسهلة البدء.')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col font-tajawal text-right">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white font-cairo">المرشد الذكي لـ ADHD</h2>
          <p className="text-xs text-gray-400 mt-0.5">مساعدك الشخصي للتغلب على التشتت، شلل المهام، وتقسيم الأهداف الكبيرة.</p>
        </div>
      </div>

      {/* Main chat window container */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Bubbles (Left 3 cols) */}
        <Card className="lg:col-span-3 flex flex-col h-full bg-[#1a1d27]/70 border-[#2d3252]/50 relative overflow-hidden">
          {/* Scrollable message viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant'
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[80%] ${
                    isAssistant ? 'self-start' : 'self-end flex-row-reverse mr-auto text-left'
                  }`}
                >
                  {isAssistant && (
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-[#21253a] text-gray-200 border border-[#2d3252]/40 rounded-tr-none'
                        : 'bg-indigo-500 text-white rounded-tl-none font-medium'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input area */}
          <div className="p-4 border-t border-[#2d3252]/60 bg-[#141621]/90 flex gap-3 items-center shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالتك للمدرب هنا..."
              className="flex-1 h-11 px-4 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm outline-none"
              disabled={isSubmitting}
            />
            <Button
              variant="primary"
              onClick={handleSendMessage}
              isLoading={isSubmitting}
              disabled={!inputValue.trim()}
              className="h-11 px-5"
              icon={<Send className="h-4 w-4 rotate-180" />}
            >
              إرسال
            </Button>
          </div>
        </Card>

        {/* Sidebar suggestions (Right 1 col) */}
        <div className="lg:col-span-1 space-y-4 shrink-0 flex flex-col justify-start">
          <Card className="p-4 space-y-3 border-[#2d3252]/50">
            <h3 className="text-xs font-bold text-white font-cairo flex items-center gap-1.5 text-indigo-400">
              <Brain className="h-4 w-4" />
              مساعدة فورية (دوبامين)
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              إذا كنت تواجه صعوبة بالغة في البدء، جرب هذه الأزرار السريعة لإرشاد المساعد فوراً:
            </p>
            <div className="space-y-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleParalysisClick}
                className="w-full text-xs text-right justify-start font-tajawal hover:border-orange-500/40"
                icon={<AlertCircle className="h-4 w-4 text-orange-400" />}
              >
                أشعر بشلل المهام 💀
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBreakdownClick}
                className="w-full text-xs text-right justify-start font-tajawal hover:border-indigo-500/40"
                icon={<HelpCircle className="h-4 w-4 text-indigo-400" />}
              >
                تقسيم مهمة صعبة 🧩
              </Button>
            </div>
          </Card>

          <Card className="p-4 border-[#2d3252]/50 bg-gradient-to-br from-indigo-500/[0.02] to-transparent">
            <h4 className="text-xs font-bold text-white font-cairo mb-2">كيف تتحدث مع المساعد؟</h4>
            <div className="text-[11px] text-gray-400 leading-relaxed space-y-2">
              <p>📍 كن صادقاً تماماً بشأن مستويات تشتتك وطاقتك.</p>
              <p>📍 اطلب منه أن يكون موجزاً إذا شعرت بملل القراءة.</p>
              <p>📍 استخدم المحادثة الصوتية لتفريغ رأسك بسرعة دون الحاجة للكتابة.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
