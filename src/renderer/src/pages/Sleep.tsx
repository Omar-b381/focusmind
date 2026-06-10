import { useState } from 'react'
import { 
  useSleepLogsQuery, 
  useLogSleepMutation, 
  useDeleteSleepLogMutation 
} from '../hooks/useSleep'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { 
  Moon, Save, Trash2, Sparkles, 
  BarChart3, Clock, BrainCircuit
} from 'lucide-react'

export default function Sleep() {
  const { data: logs = [], isLoading: isLogsLoading } = useSleepLogsQuery()
  const logSleepMutation = useLogSleepMutation()
  const deleteSleepMutation = useDeleteSleepLogMutation()

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [bedTime, setBedTime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState(3)
  const [racingThoughts, setRacingThoughts] = useState(false)
  const [midnightWakeups, setMidnightWakeups] = useState(0)
  const [medicationTaken, setMedicationTaken] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSave = async () => {
    // Calculate hours slept simply
    const [bedH, bedM] = bedTime.split(':').map(Number)
    const [wakeH, wakeM] = wakeTime.split(':').map(Number)
    
    let totalHours = 0
    if (wakeH >= bedH) {
      totalHours = (wakeH - bedH) + (wakeM - bedM) / 60
    } else {
      totalHours = (24 - bedH + wakeH) + (wakeM - bedM) / 60
    }

    await logSleepMutation.mutateAsync({
      date,
      bedTime,
      wakeTime,
      totalHours,
      quality,
      racingThoughts,
      midnightWakeups,
      medicationTaken,
      notes
    })

    // Reset inputs
    setNotes('')
    setRacingThoughts(false)
    setMidnightWakeups(0)
    alert('تم تسجيل النوم بنجاح وتحليل مستواك دوبامينياً! 💤')
  }

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      await deleteSleepMutation.mutateAsync(id)
    }
  }

  return (
    <div className="h-full flex flex-col font-tajawal text-gray-200 p-6 overflow-y-auto space-y-6 scrollbar-thin">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-[#131620]/60 p-5 border border-[#2d3252]/40 rounded-2xl shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-cairo text-white flex items-center gap-2">
            <span>💤 تتبع النوم لـ ADHD</span>
            <span className="text-xs font-normal text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
              Sleep logs & Focus
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-tajawal">
            تتبع جودة نومك وعلاقتها بتشتت الذهن والتفكير المتسارع وعلاج التراجع الدوباميني الصباحي
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Sleep Logger Form */}
        <Card className="col-span-1 p-5 space-y-4 h-fit bg-[#151924]/85 border-[#2d3252]/60">
          <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5 border-b border-[#2d3252]/40 pb-2">
            <Moon className="h-4 w-4 text-sky-400" />
            <span>تسجيل نوم الليلة الماضية</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">تاريخ الاستيقاظ (الصباح)</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">وقت النوم (Bedtime)</label>
                <Input type="time" value={bedTime} onChange={e => setBedTime(e.target.value)} className="w-full h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">وقت الاستيقاظ (Wake time)</label>
                <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="w-full h-10 text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>جودة النوم الكلية</span>
                <span className="text-sky-400">{quality}/5</span>
              </div>
              <input
                type="range" min="1" max="5"
                className="w-full h-1.5 bg-[#252a40] rounded-lg appearance-none cursor-pointer accent-sky-500"
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#2d3252]/30">
              <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1">
                <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
                <span>مؤشرات ADHD السلوكية للنوم</span>
              </h4>

              {/* Racing thoughts trigger */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={racingThoughts}
                  onChange={e => setRacingThoughts(e.target.checked)}
                  className="rounded bg-[#1c2030] border-[#2d3252] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-gray-300 select-none">عانيت من تفكير متسارع قبل النوم 🧠🌀</span>
              </label>

              {/* Medication taken */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={medicationTaken}
                  onChange={e => setMedicationTaken(e.target.checked)}
                  className="rounded bg-[#1c2030] border-[#2d3252] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-gray-300 select-none">تناولت الدواء الخاص بي 💊</span>
              </label>

              {/* Midnight wakeups */}
              <div className="flex justify-between items-center bg-[#131620]/60 p-2.5 rounded-xl border border-[#2d3252]/30">
                <span className="text-xs text-gray-300">عدد مرات الاستيقاظ ليلاً</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setMidnightWakeups(prev => Math.max(0, prev - 1))}
                    className="h-6 w-6 rounded bg-[#252a40] hover:bg-[#2e3450] text-sm text-white font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-white w-4 text-center">{midnightWakeups}</span>
                  <button 
                    onClick={() => setMidnightWakeups(prev => prev + 1)}
                    className="h-6 w-6 rounded bg-[#252a40] hover:bg-[#2e3450] text-sm text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">ملاحظات إضافية (أحلام، ظروف نوم...)</label>
              <textarea
                className="w-full h-16 bg-[#131620]/60 border border-[#2d3252]/60 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-sky-500 resize-none scrollbar-none"
                placeholder="مثال: حلمت بأفكار مشاريع، شربت قهوة متأخر..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <Button 
              variant="dopamine" 
              className="w-full h-11" 
              isLoading={logSleepMutation.isPending} 
              icon={<Save className="h-4 w-4" />}
              onClick={handleSave}
            >
              حفظ وتحليل تأثير النوم
            </Button>
          </div>
        </Card>

        {/* Sleep History & AI sleep insights */}
        <div className="col-span-2 space-y-6">
          {/* Latest AI Sleep Coach Insight card */}
          {logs.length > 0 && logs[0].aiInsight && (
            <Card className="border-sky-500/30 bg-sky-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-400">
                <Sparkles className="h-5 w-5" />
                <h4 className="text-sm font-bold font-cairo text-white">توقع المحلل لنشاطك وتركيزك اليوم (Sleep Coach)</h4>
              </div>
              <p className="text-xs leading-relaxed text-sky-200">
                " {logs[0].aiInsight} "
              </p>
            </Card>
          )}

          {/* Sleep Logs History List */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5 border-b border-[#2d3252]/40 pb-2">
              <BarChart3 className="h-4.5 w-4.5 text-sky-400" />
              <span>سجلات النوم وتوزيع كفاءة الراحة</span>
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {isLogsLoading ? (
                <div className="text-center py-8 text-gray-500">جاري تحميل سجلات النوم...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">لا تتوفر سجلات نوم بعد. قم بتسجيل نومك الليلة الأولى!</div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-[#2d3252]/40 bg-[#1c2030]/40 flex justify-between items-center relative group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white font-cairo">{log.date}</span>
                        {log.racingThoughts && (
                          <span className="text-[9px] font-bold bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20">
                            عقل متسارع 🌀
                          </span>
                        )}
                        {log.medicationTaken && (
                          <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            أخذت الدواء 💊
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.bedTime} - {log.wakeTime}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-sky-400">ساعات النوم: {log.totalHours?.toFixed(1)} س</span>
                        <span>•</span>
                        <span className="text-emerald-400">جودة النوم: {log.quality}/5</span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-gray-400 leading-normal italic mt-1">"{log.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
