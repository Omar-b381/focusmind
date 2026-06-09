import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXPStore } from '../../stores/xp.store'
import { Sparkles, Trophy, Star } from 'lucide-react'

// Web Audio API Synth reward sound to avoid asset loading errors
const playRewardSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Level up chime sequence: low to high pitch
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25] // C E G C E chord
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.15)
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.15)
      gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + index * 0.15 + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.15 + 0.4)
      
      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      osc.start(audioCtx.currentTime + index * 0.15)
      osc.stop(audioCtx.currentTime + index * 0.15 + 0.4)
    })
  } catch (e) {
    console.error('Failed to play synthesized audio reward:', e)
  }
}

export default function LevelUpOverlay() {
  const { showLevelUp, levelUpValue, dismissLevelUp } = useXPStore()

  useEffect(() => {
    if (showLevelUp) {
      playRewardSound()
    }
  }, [showLevelUp])

  return (
    <AnimatePresence>
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/90 p-4 font-cairo"
          onClick={dismissLevelUp}
        >
          {/* Confetti-like floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ 
                  x: '50vw', 
                  y: '50vh', 
                  scale: 0, 
                  rotate: 0 
                }}
                animate={{ 
                  x: `${Math.random() * 100}vw`, 
                  y: `${Math.random() * 100}vh`, 
                  scale: [0, 1.5, 1],
                  rotate: Math.random() * 360 
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                {['✨', '⭐', '🎉', '⚡', '🏆'][i % 5]}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            className="w-full max-w-md bg-gradient-to-b from-[#1a1d27] to-[#21253a] border-2 border-indigo-500 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-indigo-500/25 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-indigo-500/5 -z-10 animate-pulse-soft" />

            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-full"
              >
                <Trophy className="h-16 w-16 text-indigo-400" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white">ترقية المستوى! 🎉</h2>
              <p className="text-gray-300 text-sm">مبارك يا بطل، لقد تقدمت في رحلتك للتحكم بتركيزك!</p>
            </div>

            <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border inline-flex items-center gap-4 relative overflow-hidden w-full justify-center">
              <span className="text-2xl text-indigo-400 font-bold">المستوى</span>
              <motion.span 
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-5xl font-extrabold text-white font-mono"
              >
                {levelUpValue}
              </motion.span>
              <Sparkles className="h-6 w-6 text-indigo-400 absolute right-4 top-4 animate-pulse" />
              <Star className="h-6 w-6 text-indigo-400 absolute left-4 bottom-4 animate-pulse" />
            </div>

            <p className="text-xs text-gray-500">انقر في أي مكان للإغلاق ومتابعة العمل الرائع</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
