import { useState, useRef, useEffect } from 'react'
import Modal from './Modal'
import Button from './Button'
import { useNotificationsStore } from '../../stores/notifications.store'
import { Brain } from 'lucide-react'

interface BrainDumpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BrainDumpModal({ isOpen, onClose }: BrainDumpModalProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addNotification = useNotificationsStore((state) => state.addNotification)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the modal animation completes and textarea is in DOM
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    } else {
      setContent('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (window.api && window.api.brainDump) {
        await window.api.brainDump.createBrainDump(content.trim())
      }
      
      addNotification({
        title: 'تم تفريغ الفكرة بنجاح! 🧠✨',
        message: 'تم حفظ الفكرة وسيقوم المساعد الذكي بتصنيفها وجدولتها لاحقاً.',
        type: 'dopamine',
      })
      setContent('')
      onClose()
    } catch (err) {
      console.error('Error saving brain dump:', err)
      addNotification({
        title: 'فشل في حفظ الفكرة',
        message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-indigo-400">
          <Brain className="h-5 w-5 animate-pulse" />
          <span className="font-cairo">تفريغ العقل الفوري</span>
        </div>
      }
      size="md"
    >
      <div className="flex flex-col gap-4 font-tajawal">
        <p className="text-xs text-gray-400 leading-relaxed">
          اكتب هنا أي فكرة، قلق، أو مهمة مفاجئة تشغل بالك الآن للتخلص من تشتت الانتباه والاستمرار في تركيزك.
        </p>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="أفرغ عقلك هنا... (مثال: محتاج أشتري عيش، فكرة لمشروع جديد، أو قلق من تسليم بكرة)"
          className="w-full min-h-[140px] max-h-[300px] p-4 rounded-xl border border-[#2d3252] bg-[#141621] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm leading-relaxed resize-y outline-none"
          disabled={isSubmitting}
        />

        <div className="flex justify-between items-center text-[11px] text-gray-500">
          <span>اضغط على <kbd className="px-1.5 py-0.5 rounded bg-[#21253a] border border-[#2d3252] text-white font-mono text-[9px]">Ctrl+Enter</kbd> للإرسال السريع</span>
          <span className={`${content.length > 500 ? 'text-amber-500' : ''}`}>
            {content.length} حرف
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
          className="font-tajawal"
        >
          إلغاء
        </Button>
        <Button
          variant="dopamine"
          size="sm"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!content.trim()}
          className="font-tajawal"
        >
          حفظ وتفريغ 🧠
        </Button>
      </div>
    </Modal>
  )
}
