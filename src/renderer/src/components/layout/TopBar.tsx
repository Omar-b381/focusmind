import { useAppStore } from '../../stores/app.store'
import { useFocusStore } from '../../stores/focus.store'
import { getGreeting, formatTimer } from '../../lib/formatters'
import { Brain, Play, Square, Pause } from 'lucide-react'
import Button from '../ui/Button'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function TopBar() {
  const { toggleBrainDump } = useAppStore()
  const { status, elapsed, duration, type, start, pause, reset } = useFocusStore()

  const todayStr = format(new Date(), 'EEEE، d MMMM', { locale: ar })
  const greeting = getGreeting()

  // Map timer types to labels
  const timerLabels = {
    focus: 'تركيز',
    short_break: 'استراحة قصيرة',
    long_break: 'استراحة طويلة',
    free: 'وقت حر',
  }

  const isTimerRunning = status === 'running'
  const timeRemaining = duration - elapsed

  return (
    <header className="h-16 border-b border-[#2d3252]/50 bg-[#141621]/80 px-6 flex items-center justify-between shrink-0 glass z-10">
      {/* Right Side: Greeting */}
      <div className="flex flex-col">
        <h2 className="text-sm font-bold text-white font-cairo">
          {greeting}، يا عمر
        </h2>
        <span className="text-[11px] text-gray-400 font-tajawal">
          {todayStr}
        </span>
      </div>

      {/* Left Side: Actions & Mini Focus Bar */}
      <div className="flex items-center gap-4">
        {/* Quick Focus Timer widget */}
        {(status === 'running' || status === 'paused') && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1d27] border border-[#2d3252] rounded-xl text-xs font-tajawal text-gray-300">
            <span className="font-semibold text-indigo-400">{timerLabels[type]}</span>
            <span className="font-mono text-white text-sm ltr font-bold px-1.5 py-0.5 rounded bg-[#21253a]">
              {formatTimer(timeRemaining)}
            </span>
            <div className="flex items-center gap-1">
              {isTimerRunning ? (
                <button 
                  onClick={pause}
                  className="p-1 hover:bg-[#2d3252] rounded text-gray-400 hover:text-white transition-colors"
                  title="إيقاف مؤقت"
                >
                  <Pause className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button 
                  onClick={start}
                  className="p-1 hover:bg-[#2d3252] rounded text-gray-400 hover:text-white transition-colors"
                  title="بدء"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              )}
              <button 
                onClick={reset}
                className="p-1 hover:bg-[#2d3252] rounded text-gray-400 hover:text-white transition-colors"
                title="إعادة تعيين"
              >
                <Square className="h-3.5 w-3.5 fill-gray-400 hover:fill-white" />
              </button>
            </div>
          </div>
        )}

        {/* Brain Dump Button */}
        <Button
          variant="dopamine"
          size="sm"
          onClick={toggleBrainDump}
          icon={<Brain className="h-4 w-4" />}
          className="shadow-sm font-tajawal"
        >
          تفريغ العقل (Ctrl+Space)
        </Button>
      </div>
    </header>
  )
}
