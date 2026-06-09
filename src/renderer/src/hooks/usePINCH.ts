import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Task } from '../../../preload/types'
import { useSettingsQuery } from './useSettings'

export interface PinchEvaluation {
  pinchScore: number
  pinchPassion: number
  pinchInterest: number
  pinchNovelty: number
  pinchChallenge: number
  pinchHurry: number
  urgencyBoost: string
  noveltyTwist: string
  challengeFrame: string
}

export function useCalculatePinchMutation() {
  const queryClient = useQueryClient()
  const { data: settings } = useSettingsQuery()

  return useMutation({
    mutationFn: async ({ task, userProfile }: { task: Task; userProfile: any }): Promise<PinchEvaluation> => {
      const hasAI = settings?.aiApiKey || settings?.aiProvider === 'ollama'

      if (hasAI) {
        try {
          const userPref = typeof userProfile?.pinchProfile === 'string' 
            ? JSON.parse(userProfile.pinchProfile) 
            : (userProfile?.pinchProfile || {})

          const systemPrompt = `أنت محلل دوبامين متخصص في ADHD. لكل مهمة، قيّم درجة PINCH (0-10 لكل محور):
- P (Passion): توافقها مع شغف المستخدم (تفضيله: ${userPref.p || 5}/10)
- I (Interest): كم هي مثيرة للاهتمام (تفضيله: ${userPref.i || 5}/10)
- N (Novelty): كم فيها جِدّة وإثارة (تفضيله: ${userPref.n || 5}/10)
- C (Challenge): مستوى التحدي (تفضيله: ${userPref.c || 5}/10)
- H (Hurry): مستوى الاستعجال وضغط الوقت (تفضيله: ${userPref.h || 5}/10)

أيضاً اقترح باللغة العربية:
- urgencyBoost: جملة حماسية تضيف إحساس الاستعجال للمهمة بشكل محبب
- noveltyTwist: كيف يجعل المستخدم المهمة جديدة/مختلفة لكسر الملل
- challengeFrame: كيف يؤطرها كتحدي/لعبة

أجب فقط بـ JSON كالتالي ولا تكتب أي شيء آخر قبل أو بعد:
{
  "pinchScore": 7.5,
  "pinchPassion": 8,
  "pinchInterest": 7,
  "pinchNovelty": 6,
  "pinchChallenge": 5,
  "pinchHurry": 9,
  "urgencyBoost": "...",
  "noveltyTwist": "...",
  "challengeFrame": "..."
}`

          const response = await window.api.ai.sendChatMessage('coach', [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `المهمة: "${task.title}". الوصف: "${task.description || ''}". الأولوية: "${task.priority}".` }
          ])

          const text = response?.content || ''
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            if (typeof parsed.pinchScore === 'number') {
              return {
                pinchScore: parsed.pinchScore,
                pinchPassion: parsed.pinchPassion ?? 5,
                pinchInterest: parsed.pinchInterest ?? 5,
                pinchNovelty: parsed.pinchNovelty ?? 5,
                pinchChallenge: parsed.pinchChallenge ?? 5,
                pinchHurry: parsed.pinchHurry ?? 5,
                urgencyBoost: parsed.urgencyBoost || 'أنجز هذه المهمة في أسرع وقت!',
                noveltyTwist: parsed.noveltyTwist || 'غير مكان عملك لتشعر بالتجديد!',
                challengeFrame: parsed.challengeFrame || 'تحدى نفسك لإكمالها الآن!'
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse AI PINCH evaluation, falling back:', e)
        }
      }

      // Local Fallback Calculation Heuristics
      const p = task.projectId ? 7 : 5
      const i = 6
      const n = 5
      const c = task.priority === 'urgent' || task.priority === 'high' ? 7 : 4
      const h = task.priority === 'urgent' ? 9 : task.priority === 'high' ? 7 : 5
      
      const pinchScore = Math.round(((p + i + n + c + h) / 5) * 10) / 10

      return {
        pinchScore,
        pinchPassion: p,
        pinchInterest: i,
        pinchNovelty: n,
        pinchChallenge: c,
        pinchHurry: h,
        urgencyBoost: task.priority === 'urgent' 
          ? 'المهمة دي مستعجلة جداً ومحتاجة تخلص فوراً علشان ترتاح!' 
          : 'خلينا نخلص دي بسرعة علشان نزود طاقتنا للمهام الجاية!',
        noveltyTwist: 'جرب تشتغل عليها بوضعية مختلفة أو شغل موسيقى Lofi هادئة.',
        challengeFrame: 'اضبط المؤقت على 15 دقيقة وشوف هتوصل لفين قبل ما يرن!'
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.task.id] })
    }
  })
}
