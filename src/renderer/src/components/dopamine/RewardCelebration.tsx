import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  emoji: string
  size: number
  rotation: number
}

interface RewardCelebrationProps {
  trigger: boolean
  onComplete: () => void
  emojiList?: string[]
}

const DEFAULT_EMOJIS = ['🎉', '✨', '⚡', '🔥', '🍊', '💧', '🏆', '🎯', '🌟']

export default function RewardCelebration({ trigger, onComplete, emojiList = DEFAULT_EMOJIS }: RewardCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!trigger) return

    const newParticles = Array.from({ length: 24 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const distance = 80 + Math.random() * 200
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 50,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        size: 16 + Math.random() * 24,
        rotation: Math.random() * 360
      }
    })
    setParticles(newParticles)

    const timer = setTimeout(() => {
      setParticles([])
      onComplete()
    }, 1500)

    return () => clearTimeout(timer)
  }, [trigger, onComplete, emojiList])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0, x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 1, 0.8, 0],
              x: p.x,
              y: p.y,
              rotate: p.rotation,
              opacity: [1, 1, 1, 0.8, 0]
            }}
            transition={{
              duration: 1.2,
              ease: 'easeOut'
            }}
            className="absolute select-none font-bold"
            style={{ fontSize: p.size }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
