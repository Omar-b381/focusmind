import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle, Sparkles, Clock, Compass } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useUpdateUserProfileMutation } from '../hooks/useXP'

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🧠')
  const [peakHour, setPeakHour] = useState(10)
  const [pinchProfile, setPinchProfile] = useState({
    p: 7, // Passion
    i: 8, // Interest
    n: 6, // Novelty
    c: 5, // Challenge
    h: 9  // Hurry
  })

  const updateProfileMutation = useUpdateUserProfileMutation()

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Save profile
      updateProfileMutation.mutate({
        name: name || 'عمر',
        avatar,
        peakHour,
        pinchProfile: JSON.stringify(pinchProfile),
        onboardingCompleted: true,
        createdAt: new Date()
      }, {
        onSuccess: () => {
          onComplete()
        }
      })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const avatars = ['🧠', '⚡', '🚀', '🔥', '🎨', '🌟', '🎮', '🎧', '☕', '💡']

  const handlePinchChange = (key: keyof typeof pinchProfile, val: number) => {
    setPinchProfile(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/95 p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-dark-bg to-dark-bg -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass p-8 relative overflow-hidden border-indigo-500/20">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-dark-border">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex justify-between items-center mb-8 mt-2">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-indigo-400" />
              <span className="font-cairo text-xl font-extrabold text-white">FocusMind</span>
            </div>
            <span className="text-sm text-gray-400 font-medium font-cairo">الخطوة {step} من 3</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white font-cairo">مرحباً بك في عالم التركيز الذكي! ✨</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    هذا التطبيق مصمم خصيصاً ليعمل كـ "دماغ خارجي" لعقول الـ ADHD. دعنا نخصص إعداداتك لتبدأ رحلتك.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-200 font-cairo">ما هو اسمك؟</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="اكتب اسمك هنا..." 
                    className="w-full text-lg"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-200 font-cairo">اختر أيقونتك التعبيرية (Avatar):</label>
                  <div className="grid grid-cols-5 gap-3">
                    {avatars.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`text-3xl p-3 rounded-xl transition-all duration-200 border ${
                          avatar === av 
                            ? 'bg-indigo-500/20 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/10' 
                            : 'bg-dark-surface border-dark-border hover:bg-dark-hover'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white font-cairo">منحنى الطاقة والوقت الذكي ⏱️</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    أدمغة ADHD لديها "ساعات ذروة" محددة تكون فيها الإنتاجية في أقصى طاقتها. دعنا نحدد وقتك المفضل.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Clock className="h-5 w-5" />
                    <label className="block text-sm font-semibold text-gray-200 font-cairo">ما هي أكثر ساعة تكون فيها نشيطاً ومركزاً؟</label>
                  </div>
                  
                  <div className="bg-dark-surface p-4 rounded-2xl border border-dark-border space-y-4">
                    <div className="flex justify-between items-center text-sm font-cairo">
                      <span className="text-indigo-400 font-bold text-lg">{peakHour}:00</span>
                      <span className="text-gray-400">
                        {peakHour < 12 ? 'صباحاً' : peakHour === 12 ? 'ظهراً' : 'مساءً'}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="23" 
                      value={peakHour} 
                      onChange={(e) => setPeakHour(parseInt(e.target.value))}
                      className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>23:00</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl flex gap-3 text-sm">
                  <Sparkles className="h-6 w-6 text-indigo-400 shrink-0" />
                  <p className="text-gray-300 leading-relaxed">
                    سيقوم الذكاء الاصطناعي بجدولة مهامك الصعبة في الساعة المحددة لضمان أقصى استفادة من طاقتك الدوبامينية!
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white font-cairo">نموذج PINCH المحفّز للدوبامين ⚡</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    عقل الـ ADHD لا تحركه "الأهمية"، بل تحركه المحفزات الخمسة التالية. قيّم مستوى حساسيتك لكل منها:
                  </p>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {/* Passion */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-cairo">
                      <span className="font-bold text-gray-200">الشغف (Passion)</span>
                      <span className="text-indigo-400 font-bold">{pinchProfile.p}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={pinchProfile.p} 
                      onChange={(e) => handlePinchChange('p', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Interest */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-cairo">
                      <span className="font-bold text-gray-200">الاهتمام والشغف اللحظي (Interest)</span>
                      <span className="text-indigo-400 font-bold">{pinchProfile.i}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={pinchProfile.i} 
                      onChange={(e) => handlePinchChange('i', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Novelty */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-cairo">
                      <span className="font-bold text-gray-200">الجدّة والتغيير (Novelty)</span>
                      <span className="text-indigo-400 font-bold">{pinchProfile.n}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={pinchProfile.n} 
                      onChange={(e) => handlePinchChange('n', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Challenge */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-cairo">
                      <span className="font-bold text-gray-200">التحدي والمنافسة (Challenge)</span>
                      <span className="text-indigo-400 font-bold">{pinchProfile.c}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={pinchProfile.c} 
                      onChange={(e) => handlePinchChange('c', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Hurry */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-cairo">
                      <span className="font-bold text-gray-200">الاستعجال والضغط (Hurry)</span>
                      <span className="text-indigo-400 font-bold">{pinchProfile.h}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={pinchProfile.h} 
                      onChange={(e) => handlePinchChange('h', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8 border-t border-dark-border pt-6">
            {step > 1 ? (
              <Button variant="secondary" onClick={handleBack}>
                السابق
              </Button>
            ) : (
              <div />
            )}

            <Button 
              variant="primary" 
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              isLoading={updateProfileMutation.isPending}
              icon={step === 3 ? <CheckCircle className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
            >
              {step === 3 ? 'ابدأ الاستخدام' : 'التالي'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
