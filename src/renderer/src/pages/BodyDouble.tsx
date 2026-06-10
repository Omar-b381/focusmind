import { useState, useEffect, useRef } from 'react'
import { useBodyDoubleStore } from '../stores/bodyDouble.store'
import { useStartBodyDoubleSessionMutation, useStopBodyDoubleSessionMutation } from '../hooks/useBodyDouble'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { 
  User, Volume2, VolumeX, Music, Play, Square, 
  Sparkles, CheckCircle2, AlertTriangle, ShieldAlert
} from 'lucide-react'

// Web Audio API Synthesizer to generate ADHD focus sounds locally with no assets
class FocusAudioGenerator {
  private ctx: AudioContext | null = null
  private noiseNode: AudioNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private oscillatorNode1: OscillatorNode | null = null
  private oscillatorNode2: OscillatorNode | null = null
  private gainNode: GainNode | null = null

  start(type: string) {
    this.stop()
    
    // Initialize context
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    this.ctx = new AudioCtx()
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = 0.15 // Low volume for ambient presence
    this.gainNode.connect(this.ctx.destination)

    if (type === 'brown_noise' || type === 'rain') {
      // Programmatic Brown Noise generation
      const bufferSize = 2 * this.ctx.sampleRate
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      
      let lastOut = 0.0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + (0.02 * white)) / 1.02
        lastOut = output[i]
        output[i] *= 3.5 // Compensate gain loss
      }

      const noiseSource = this.ctx.createBufferSource()
      noiseSource.buffer = noiseBuffer
      noiseSource.loop = true

      // Apply Lowpass filter for Rain/Deep Brown Noise effect
      this.filterNode = this.ctx.createBiquadFilter()
      this.filterNode.type = 'lowpass'
      this.filterNode.frequency.value = type === 'rain' ? 800 : 400

      noiseSource.connect(this.filterNode)
      this.filterNode.connect(this.gainNode)
      noiseSource.start()
      this.noiseNode = noiseSource
    } else if (type === 'binaural_focus') {
      // Binaural Beats Focus: 150Hz in left ear, 154Hz in right ear (4Hz Delta focus waves)
      const merger = this.ctx.createChannelMerger(2)

      const osc1 = this.ctx.createOscillator()
      const gainLeft = this.ctx.createGain()
      osc1.frequency.value = 150
      osc1.connect(gainLeft)
      gainLeft.connect(merger, 0, 0)

      const osc2 = this.ctx.createOscillator()
      const gainRight = this.ctx.createGain()
      osc2.frequency.value = 154
      osc2.connect(gainRight)
      gainRight.connect(merger, 0, 1)

      merger.connect(this.gainNode)

      osc1.start()
      osc2.start()

      this.oscillatorNode1 = osc1
      this.oscillatorNode2 = osc2
    }
  }

  stop() {
    try {
      if (this.noiseNode) {
        (this.noiseNode as any).stop()
        this.noiseNode = null
      }
      if (this.oscillatorNode1) {
        this.oscillatorNode1.stop()
        this.oscillatorNode1 = null
      }
      if (this.oscillatorNode2) {
        this.oscillatorNode2.stop()
        this.oscillatorNode2 = null
      }
      if (this.ctx) {
        this.ctx.close()
        this.ctx = null
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export default function BodyDouble() {
  const {
    activeSession,
    setActiveSession,
    messages,
    addMessage,
    clearMessages,
    voiceEnabled,
    setVoiceEnabled,
    soundscape,
    setSoundscape,
    personaName,
    setPersonaName,
    checkInIntervalMin,
    setCheckInIntervalMin,
    ambientType,
    setAmbientType
  } = useBodyDoubleStore()

  // Mutations
  const startSessionMutation = useStartBodyDoubleSessionMutation()
  const stopSessionMutation = useStopBodyDoubleSessionMutation()

  const [plannedMin, setPlannedMin] = useState(25)
  const [timeLeft, setTimeLeft] = useState(0)
  const audioGenRef = useRef<FocusAudioGenerator | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Initialize Audio Generator
  useEffect(() => {
    audioGenRef.current = new FocusAudioGenerator()
    return () => {
      audioGenRef.current?.stop()
    }
  }, [])

  // Listen to main process IPC events for body-double messages & TTS
  useEffect(() => {
    const removeMsgListener = window.api.bodyDouble.onMessage((msg: any) => {
      addMessage({
        text: msg.text,
        type: msg.type,
        timestamp: new Date()
      })
    })

    const removeSpeakListener = window.api.bodyDouble.onSpeak((text: string) => {
      if (voiceEnabled) {
        const speech = new SpeechSynthesisUtterance(text)
        speech.lang = 'ar-SA'
        speech.rate = 0.95 // ADHD calm pacing
        window.speechSynthesis.speak(speech)
      }
    })

    return () => {
      removeMsgListener()
      removeSpeakListener()
    }
  }, [voiceEnabled])

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Local timer for UI countdown
  useEffect(() => {
    if (!activeSession) return

    setTimeLeft(plannedMin * 60)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleStop(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession])

  const handleStart = async () => {
    clearMessages()
    
    // Start programmatic audio synth if selected
    if (soundscape !== 'none') {
      audioGenRef.current?.start(soundscape)
    }

    const session = await startSessionMutation.mutateAsync({
      focusSessionId: undefined,
      personaName,
      ambientType,
      soundscape,
      checkInIntervalMin,
      voiceEnabled,
      plannedMinutes: plannedMin
    })

    setActiveSession(session)
  }

  const handleStop = async (completed = false) => {
    audioGenRef.current?.stop()
    const elapsedMinutes = Math.min(plannedMin, Math.ceil((plannedMin * 60 - timeLeft) / 60))
    
    await stopSessionMutation.mutateAsync({
      actualMinutes: elapsedMinutes,
      completed
    })

    setActiveSession(null)
  }

  // Update soundscape during active session
  const handleSoundscapeChange = (sound: string) => {
    setSoundscape(sound)
    if (activeSession) {
      if (sound === 'none') {
        audioGenRef.current?.stop()
      } else {
        audioGenRef.current?.start(sound)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full flex flex-col font-tajawal text-gray-200">
      {/* Top Header */}
      <div className="flex justify-between items-center p-6 border-b border-[#2d3252]/80 bg-[#131620] shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-cairo text-white flex items-center gap-2">
            <span>👤 المرافق الافتراضي الذكي</span>
            <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              AI Body Double
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            مبني على دراسات 2025/2026: المساءلة المحيطية الهادئة تعوض النقص التنفيذي وتقلل عقبات RSD
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Setup & Settings */}
        <div className="w-96 border-l border-[#2d3252]/60 p-6 space-y-6 overflow-y-auto bg-[#151924]/80 shrink-0">
          {!activeSession ? (
            /* Setup Form */
            <div className="space-y-5">
              <h3 className="text-md font-bold text-white font-cairo border-b border-[#2d3252]/40 pb-2">
                تهيئة جلسة المرافق
              </h3>

              {/* Persona Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">شخصية المرافق الافتراضي</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'مرافق', label: 'مرافق صامت' },
                    { id: 'مرشد', label: 'مرشد ذكي' },
                    { id: 'صديق', label: 'صديق مشجع' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPersonaName(p.id)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                        personaName === p.id 
                          ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                          : 'border-[#2d3252]/40 bg-[#1c2030]/60 text-gray-400 hover:bg-[#21253a]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interaction Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">نمط التفاعل والوجود</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'silent', label: 'هادئ جداً' },
                    { id: 'subtle', label: 'معتدل' },
                    { id: 'active', label: 'تفاعل مستمر' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setAmbientType(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                        ambientType === m.id 
                          ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                          : 'border-[#2d3252]/40 bg-[#1c2030]/60 text-gray-400 hover:bg-[#21253a]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soundscape generator */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5" />
                  <span>بيئة الصوت المدمجة (برمجية بالكامل)</span>
                </label>
                <select
                  className="w-full h-11 rounded-xl bg-[#1c2030] border border-[#2d3252] text-sm text-gray-300 px-3 pr-8 focus:ring-indigo-500"
                  value={soundscape}
                  onChange={e => handleSoundscapeChange(e.target.value)}
                >
                  <option value="none">بدون صوت (صمت)</option>
                  <option value="rain">صوت المطر الاسترخائي 🌧️</option>
                  <option value="brown_noise">الضوضاء البنية العميقة 🎚️</option>
                  <option value="binaural_focus">موجات التركيز الثنائية (Binaural) 🧠</option>
                </select>
              </div>

              {/* Check-in slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-400">معدل التحقق والمراجعة</label>
                  <span className="text-indigo-400 font-bold">كل {checkInIntervalMin} دقائق</span>
                </div>
                <input 
                  type="range" min="5" max="25" step="5"
                  className="w-full h-1.5 bg-[#252a40] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  value={checkInIntervalMin}
                  onChange={e => setCheckInIntervalMin(Number(e.target.value))}
                />
              </div>

              {/* Voice toggle */}
              <div className="flex justify-between items-center bg-[#131620]/60 p-4 border border-[#2d3252]/40 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">نطق العبارات صوتياً (TTS)</span>
                  <span className="text-[10px] text-gray-400 block">سوف ينطق باللغة العربية عند التنبيهات</span>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-xl transition-all ${
                    voiceEnabled ? 'bg-indigo-500 text-white' : 'bg-[#1c2030] text-gray-500 border border-[#2d3252]'
                  }`}
                >
                  {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
              </div>

              {/* Planned minutes slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-400">وقت جلسة العمل المخطط</label>
                  <span className="text-indigo-400 font-bold">{plannedMin} دقيقة</span>
                </div>
                <input 
                  type="range" min="10" max="90" step="5"
                  className="w-full h-1.5 bg-[#252a40] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  value={plannedMin}
                  onChange={e => setPlannedMin(Number(e.target.value))}
                />
              </div>

              <Button variant="dopamine" className="w-full h-12 text-md font-bold mt-4" icon={<Play className="h-4 w-4" />} onClick={handleStart}>
                ابدأ الجلسة الآن 🚀
              </Button>
            </div>
          ) : (
            /* Active Session view */
            <div className="space-y-6 text-center">
              <h3 className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">الجلسة قيد التشغيل</h3>
              
              {/* Countdown Circular timer */}
              <div className="flex justify-center py-4">
                <div className="relative h-44 w-44 rounded-full bg-[#131620] border-4 border-indigo-500/20 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/5">
                  {/* Dynamic pulse ripple */}
                  <div className="absolute inset-0 rounded-full border border-indigo-500/50 animate-ping opacity-20" />
                  
                  <span className="text-3xl font-extrabold text-white font-mono">{formatTime(timeLeft)}</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">متبقي من الوقت</span>
                </div>
              </div>

              {/* Setup change during session */}
              <div className="space-y-4 text-right">
                <div className="bg-[#1c2030]/40 p-4 border border-[#2d3252]/40 rounded-2xl space-y-3">
                  <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    <Music className="h-3.5 w-3.5" />
                    <span>تغيير الصوت المحيطي</span>
                  </label>
                  <select
                    className="w-full h-10 rounded-xl bg-[#131620] border border-[#2d3252] text-xs text-gray-300 px-3 pr-8 focus:ring-indigo-500"
                    value={soundscape}
                    onChange={e => handleSoundscapeChange(e.target.value)}
                  >
                    <option value="none">صمت</option>
                    <option value="rain">صوت المطر 🌧️</option>
                    <option value="brown_noise">الضوضاء البنية 🎚️</option>
                    <option value="binaural_focus">موجات Binaural 🧠</option>
                  </select>
                </div>

                <div className="flex justify-between items-center bg-[#131620]/60 p-4 border border-[#2d3252]/40 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">نطق العبارات صوتياً</span>
                    <span className="text-[10px] text-gray-400 block">نطق فوري للتأكيدات</span>
                  </div>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-2 rounded-xl transition-all ${
                      voiceEnabled ? 'bg-indigo-500 text-white' : 'bg-[#1c2030] text-gray-500 border border-[#2d3252]'
                    }`}
                  >
                    {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  variant="primary" 
                  className="w-full" 
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => handleStop(true)}
                >
                  أكملت مهمتي بنجاح 🎉
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-400 hover:text-rose-400"
                  icon={<Square className="h-4 w-4" />}
                  onClick={() => handleStop(false)}
                >
                  إنهاء الجلسة مبكراً
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Chat / Ambient Presence interaction */}
        <div className="flex-1 bg-[#0f1117] flex flex-col overflow-hidden relative">
          {activeSession ? (
            /* Chat Interface */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Top status bar representing co-regulation */}
              <div className="p-4 border-b border-[#2d3252]/40 bg-[#131620]/30 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-gray-400 font-bold">المرافق: {personaName} متصل وجاهز للضبط المعرفي</span>
                </div>
                {soundscape !== 'none' && (
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 animate-pulse-soft">
                    صوت {soundscape === 'rain' ? 'المطر' : soundscape === 'brown_noise' ? 'الضوضاء البنية' : 'Delta Beats'} فعال
                  </span>
                )}
              </div>

              {/* Messages stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8">
                    <User className="h-10 w-10 text-indigo-400/40 mb-3 animate-pulse-soft" />
                    <p className="text-xs text-gray-500 leading-normal max-w-xs">
                      سوف يقوم المرافق الافتراضي بإرسال تأكيدات لفظية خفيفة (Check-ins) دورية وكشف حالات تشتتك أو ابتعادك عن الشاشة.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isDrift = msg.type === 'drift'
                    const isDone = msg.type === 'done'
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 max-w-[85%] ${
                          isDrift 
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-200' 
                            : isDone
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-200'
                            : 'bg-[#1c2030]/60 border border-[#2d3252]/50 text-gray-200'
                        } p-4 rounded-2xl`}
                      >
                        {isDrift ? (
                          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">
                            {isDrift ? 'تنبيه استعادة انتباه' : personaName}
                          </span>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <span className="text-[9px] text-gray-500 block text-left">
                            {new Date(msg.timestamp).toLocaleTimeString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            /* Idle / Waiting screen */
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-[#0f1117]">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 glow-success">
                <User className="h-8 w-8 animate-pulse-soft" />
              </div>
              <h3 className="text-lg font-bold font-cairo text-white">المرافق الافتراضي (Ambient Presence)</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-sm leading-normal">
                اختر شخصية رفيق العمل ونوع الموسيقى، ثم ابدأ الجلسة. وجود رفيق يعوض النقص الدوباميني ويساعدك على البدء والمواصلة دون ضغوط.
              </p>
              <Card className="max-w-md border-indigo-500/20 bg-indigo-500/5 mt-6 text-right p-4 flex gap-3">
                <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-white font-cairo">كيف يراقب التشتت؟</h5>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    يقوم التطبيق بالتحقق من خمول النظام (idle time) دورياً. إذا لم تقم بأي إدخال (ماوس أو كيبورد) لأكثر من 5 دقائق، سيوجه لك المرافق عبارة استعادة انتباه لطيفة لمساعدتك على العودة.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
