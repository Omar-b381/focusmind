import { useState } from 'react'
import { 
  usePatternInsightsQuery, 
  useRefreshInsightsMutation, 
  useWeeklyAutopsyQuery 
} from '../hooks/useIntelligence'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { 
  Sparkles, Activity, RefreshCw, AlertTriangle, 
  TrendingUp, Clock, FileText, ChevronLeft, ShieldCheck
} from 'lucide-react'

export default function Intelligence() {
  const { data: insights = [], isLoading: isInsightsLoading } = usePatternInsightsQuery()
  const refreshMutation = useRefreshInsightsMutation()
  
  const [showAutopsy, setShowAutopsy] = useState(false)
  const { data: autopsy, isLoading: isAutopsyLoading, refetch: refetchAutopsy } = useWeeklyAutopsyQuery()

  const handleRefresh = async () => {
    await refreshMutation.mutateAsync()
    alert('تم تحديث وتحليل أنماط سلوكك بنجاح! 🧬')
  }

  const handleGenerateAutopsy = () => {
    setShowAutopsy(true)
    refetchAutopsy()
  }

  return (
    <div className="h-full flex flex-col font-tajawal text-gray-200 p-6 overflow-y-auto space-y-6 scrollbar-thin">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-[#131620]/60 p-5 border border-[#2d3252]/40 rounded-2xl shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-cairo text-white flex items-center gap-2">
            <span>🧬 ذكاء الأنماط والتحليل السلوكي</span>
            <span className="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Intelligence Layer
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            كشف الروابط العميقة بين النوم، المشاعر، طاقة العمل، ومعدلات التركيز لعقول ADHD
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            isLoading={refreshMutation.isPending} 
            icon={<RefreshCw className="h-4 w-4" />} 
            onClick={handleRefresh}
          >
            تحديث التحليلات
          </Button>
          <Button 
            variant="dopamine" 
            icon={<FileText className="h-4 w-4" />} 
            onClick={handleGenerateAutopsy}
          >
            تقرير التشريح الأسبوعي (DNA)
          </Button>
        </div>
      </div>

      {showAutopsy ? (
        /* Weekly DNA Autopsy narrative view */
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAutopsy(false)}>
              <ChevronLeft className="h-4 w-4 ml-1" /> العودة للوحة الأنماط
            </Button>
          </div>

          {isAutopsyLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-r-2 border-indigo-500 mx-auto" />
              <span className="text-xs block mt-3">جاري تشريح البيانات واستخلاص الرؤى السلوكية...</span>
            </div>
          ) : !autopsy ? (
            <div className="text-center py-8 text-gray-500">فشل توليد تقرير الأسبوع. تأكد من توفر بيانات النوم واليوميات.</div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {/* Report Narrative Content */}
              <Card className="col-span-2 p-6 border-indigo-500/20 bg-indigo-500/5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#2d3252]/40 pb-3">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-bold font-cairo text-white">تقرير DNA الأسبوعي الموجه (Weekly DNA Autopsy)</h3>
                </div>

                <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-line font-tajawal">
                  {autopsy.aiNarrative}
                </div>
              </Card>

              {/* Action Plan & Recommendations */}
              <div className="space-y-6">
                <Card className="p-5 border-emerald-500/20 bg-emerald-500/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white font-cairo">خطة العمل للأسبوع القادم</h4>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <span className="text-gray-400 font-bold">نافذة التركيز المفضلة:</span>
                      <p className="text-white leading-normal font-semibold">
                        ⏰ {autopsy.nextWeekRecommendations.peakWindow}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 font-bold">خطوة مصغرة لكسر الجمود:</span>
                      <p className="text-white leading-normal">
                        🎯 {autopsy.nextWeekRecommendations.microStepSuggestion}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 font-bold">نصيحة جودة النوم السلوكية:</span>
                      <p className="text-white leading-normal">
                        🌙 {autopsy.nextWeekRecommendations.sleepRecommendation}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Raw aggregated numbers of the week */}
                <Card className="p-5 space-y-3">
                  <h4 className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">أرقام أسبوعك المترجمة</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#1c2030]/60 p-2.5 rounded-xl border border-[#2d3252]/30">
                      <span className="text-gray-400 block">دقائق التركيز:</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{autopsy.rawData.totalFocusMinutes} د</span>
                    </div>
                    <div className="bg-[#1c2030]/60 p-2.5 rounded-xl border border-[#2d3252]/30">
                      <span className="text-gray-400 block">جلسات التركيز:</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{autopsy.rawData.focusSessionsCount} جلسة</span>
                    </div>
                    <div className="bg-[#1c2030]/60 p-2.5 rounded-xl border border-[#2d3252]/30">
                      <span className="text-gray-400 block">متوسط النوم:</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{autopsy.rawData.avgSleepHours.toFixed(1)} س</span>
                    </div>
                    <div className="bg-[#1c2030]/60 p-2.5 rounded-xl border border-[#2d3252]/30">
                      <span className="text-gray-400 block">التشتت المكتشف:</span>
                      <span className="text-sm font-bold text-white block mt-0.5">{autopsy.rawData.totalDriftsCount} مرات</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Behavioral Patterns list dashboard */
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-5">
            {isInsightsLoading ? (
              <div className="col-span-3 text-center py-12 text-gray-500">جاري تحميل أنماط السلوك...</div>
            ) : insights.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">
                لا تتوفر أنماط سلوك كافية حالياً. جرب تسجيل النوم وجلسات التركيز لعدة أيام، ثم اضغط على "تحديث التحليلات".
              </div>
            ) : (
              insights.map((insight, idx) => {
                const isSleep = insight.type === 'sleep_focus'
                const isPeak = insight.type === 'time_of_day'
                return (
                  <Card 
                    key={idx} 
                    className={`p-5 flex flex-col justify-between border-t-4 ${
                      isSleep 
                        ? 'border-t-indigo-500' 
                        : isPeak 
                        ? 'border-t-emerald-500' 
                        : 'border-t-rose-500'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          {isSleep ? <Activity className="h-3.5 w-3.5" /> : isPeak ? <Clock className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          {isSleep ? 'علاقة النوم بالتركيز' : isPeak ? 'وقت ذروة النشاط' : 'جدار الشغف'}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          ثقة: {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-sm text-white font-tajawal leading-snug">{insight.title}</h4>
                      <p className="text-xs text-gray-400 leading-normal">{insight.description}</p>
                    </div>

                    <div className="bg-[#131620]/60 p-3.5 rounded-xl border border-[#2d3252]/40 mt-4">
                      <span className="text-[10px] text-indigo-400 font-extrabold block mb-1">💡 التوصية السلوكية المترجمة</span>
                      <p className="text-xs text-indigo-200 leading-relaxed font-semibold">{insight.recommendation}</p>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {/* Premium custom SVG chart plotting sleep hours against focus duration */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5 mb-4">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              <span>مخطط علاقة النوم بكفاءة التركيز السلوكي (Pearson Analysis)</span>
            </h3>

            <div className="h-60 w-full flex justify-center items-center relative">
              <svg className="w-full h-full max-w-xl" viewBox="0 0 500 200">
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="40" x2="480" y2="40" stroke="#2d3252" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="#2d3252" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="40" y1="160" x2="480" y2="160" stroke="#2d3252" strokeWidth="0.5" strokeDasharray="3 3" />

                {/* Axes */}
                <line x1="40" y1="180" x2="480" y2="180" stroke="#2d3252" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="180" stroke="#2d3252" strokeWidth="1" />

                {/* Plot sleep hours bars and focus line (dummy visuals or matching data points) */}
                <g>
                  {/* Bar 1 */}
                  <rect x="70" y="80" width="16" height="100" fill="#6366f1" fillOpacity="0.15" rx="3" />
                  <circle cx="78" cy="110" r="5" fill="#f97316" />
                  {/* Bar 2 */}
                  <rect x="150" y="60" width="16" height="120" fill="#6366f1" fillOpacity="0.15" rx="3" />
                  <circle cx="158" cy="90" r="5" fill="#f97316" />
                  {/* Bar 3 */}
                  <rect x="230" y="50" width="16" height="130" fill="#6366f1" fillOpacity="0.15" rx="3" />
                  <circle cx="238" cy="70" r="5" fill="#f97316" />
                  {/* Bar 4 */}
                  <rect x="310" y="110" width="16" height="70" fill="#6366f1" fillOpacity="0.15" rx="3" />
                  <circle cx="318" cy="140" r="5" fill="#f97316" />
                  {/* Bar 5 */}
                  <rect x="390" y="45" width="16" height="135" fill="#6366f1" fillOpacity="0.15" rx="3" />
                  <circle cx="398" cy="60" r="5" fill="#f97316" />
                </g>

                {/* Connect lines between focus circles */}
                <path d="M 78,110 L 158,90 L 238,70 L 318,140 L 398,60" fill="none" stroke="#f97316" strokeWidth="2.5" />
              </svg>

              {/* Chart Legend */}
              <div className="absolute bottom-2 left-6 flex gap-4 text-[10px] text-gray-400 font-bold uppercase">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-indigo-500/20 border border-indigo-500/40" />
                  <span>ساعات النوم</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span>دقائق التركيز في اليوم التالي</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
