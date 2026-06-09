import { subDays, format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Card from '../ui/Card'
import Tooltip from '../ui/Tooltip'

interface HabitGridProps {
  logs: { date: string; completed: boolean }[]
  daysCount?: number
}

export default function HabitGrid({ logs, daysCount = 30 }: HabitGridProps) {
  // Generate the list of last N days
  const days = Array.from({ length: daysCount }, (_, i) => subDays(new Date(), i)).reverse()

  const isDayCompleted = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return logs.some((l) => l.date === dayStr && l.completed)
  }

  return (
    <Card className="p-4 border-[#2d3252]/50 bg-[#1a1d27]/65">
      <h4 className="text-xs font-bold text-gray-300 font-cairo mb-3 text-right">معدل الالتزام (آخر {daysCount} يوماً)</h4>
      <div className="flex flex-wrap gap-1.5 justify-start md:justify-center items-center py-2" dir="ltr">
        {days.map((day, idx) => {
          const completed = isDayCompleted(day)
          const formattedDate = format(day, 'dd MMMM yyyy', { locale: ar })
          
          return (
            <Tooltip
              key={idx}
              content={`${formattedDate}: ${completed ? 'تم الإنجاز ✅' : 'لم يكتمل ⭕'}`}
            >
              <div
                className={`h-6.5 w-6.5 rounded-md transition-all duration-200 cursor-pointer ${
                  completed
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/20 scale-105'
                    : 'bg-[#21253a] border border-[#2d3252] hover:border-[#4338ca]'
                }`}
              />
            </Tooltip>
          )
        })}
      </div>
    </Card>
  )
}
