import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { BarChart3, TrendingUp, Smile, RefreshCw, AlertCircle, Heart, Zap, Target, Plus, Award, Lock, CheckCircle2 } from 'lucide-react'
import Card from '../components/ui/Card'
import { useAnalyticsQuery } from '../hooks/useAnalytics'
import { useCreateMoodLogMutation } from '../hooks/useMoods'
import { useAchievementsQuery } from '../hooks/useAchievements'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Analytics() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  // Mood Logger States
  const [isLogOpen, setLogOpen] = useState(false)
  const [mood, setMood] = useState<number>(3)
  const [energy, setEnergy] = useState<number>(3)
  const [focus, setFocus] = useState<number>(3)
  const [notes, setNotes] = useState('')

  // TanStack Query Hooks
  const { data: stats, isLoading, isError, refetch } = useAnalyticsQuery(period)
  const createMoodLogMutation = useCreateMoodLogMutation()

  const handleSaveMood = () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const timeStr = today.toTimeString().split(' ')[0].slice(0, 5) // HH:MM

    const emojis = ['😢', '😐', '🙂', '😄', '🚀']

    createMoodLogMutation.mutate({
      date: dateStr,
      time: timeStr,
      mood,
      energy,
      focus,
      emoji: emojis[mood - 1],
      notes: notes.trim(),
      tags: '[]',
      triggeredBy: 'manual'
    }, {
      onSuccess: () => {
        setLogOpen(false)
        setNotes('')
        refetch() // Refresh stats
      }
    })
  }

  // Default fallback data for empty stats state
  const defaultDailyStats = [
    { name: 'الأحد', focusMinutes: 0, tasksCompleted: 0, mood: 0 },
    { name: 'الاثنين', focusMinutes: 0, tasksCompleted: 0, mood: 0 },
    { name: 'الثلاثاء', focusMinutes: 0, tasksCompleted: 0, mood: 0 },
    { name: 'الأربعاء', focusMinutes: 0, tasksCompleted: 0, mood: 0 },
    { name: 'الخميس', focusMinutes: 0, tasksCompleted: 0, mood: 0 },
    { name: 'الجمعة', focusMinutes: 0, tasksCompleted: 0, mood: 0 },
    { name: 'السبت', focusMinutes: 0, tasksCompleted: 0, mood: 0 }
  ]

  const chartData = stats?.dailyStats && stats.dailyStats.length > 0
    ? stats.dailyStats.map((item) => ({
        name: item.date,
        focusMinutes: item.focusMinutes,
        tasksCompleted: item.tasksCompleted,
        mood: item.mood
      }))
    : defaultDailyStats

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white font-cairo">الإحصائيات والتحليلات</h2>
          <p className="text-xs text-gray-400 mt-0.5">تتبع تقدمك، مستويات طاقتك، وحالة تركيزك على مدار الأيام.</p>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setLogOpen(true)}
            className="h-9 text-xs px-3 font-tajawal"
            icon={<Plus className="h-4 w-4" />}
          >
            تسجيل الحالة المزاجية
          </Button>

          <button
            onClick={() => setPeriod('week')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'week'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-[#1a1d27] border border-[#2d3252]/50 text-gray-400'
            }`}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'month'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-[#1a1d27] border border-[#2d3252]/50 text-gray-400'
            }`}
          >
            شهري
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-24 text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          جاري تحميل التحليلات...
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-red-400 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          حدث خطأ أثناء تحميل التحليلات والبيانات.
        </div>
      ) : (
        <>
          {/* Stats summary banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 flex items-center gap-4 border-indigo-500/20 bg-indigo-500/[0.02]">
              <div className="h-11 w-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5">إجمالي وقت التركيز</span>
                <span className="text-lg font-bold text-white font-cairo">
                  {stats?.focusMinutes || 0} دقيقة
                </span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 border-emerald-500/20 bg-emerald-500/[0.02]">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5">المهام المنجزة</span>
                <span className="text-lg font-bold text-white font-cairo">
                  {stats?.tasksCompleted || 0} مهمة
                </span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 border-orange-500/20 bg-orange-500/[0.02]">
              <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                <Smile className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5">متوسط الحالة المزاجية</span>
                <span className="text-lg font-bold text-white font-cairo">
                  {stats?.averageMood ? stats.averageMood.toFixed(1) : '0.0'} / 5
                </span>
              </div>
            </Card>
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Focus time chart */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-white font-cairo">وقت التركيز (بالدقائق)</h3>
              <div className="h-64 w-full text-xs font-tajawal ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3252" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#2d3252', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="focusMinutes" name="دقائق التركيز" stroke="#6366f1" fillOpacity={1} fill="url(#colorFocus)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Tasks completed chart */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-white font-cairo">المهام المنجزة يومياً</h3>
              <div className="h-64 w-full text-xs font-tajawal ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3252" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1d27', borderColor: '#2d3252', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="tasksCompleted" name="المهام المنجزة" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Achievements Section */}
          <AchievementsWidget />
        </>
      )}

      {/* Mood Logger Modal */}
      <Modal
        isOpen={isLogOpen}
        onClose={() => setLogOpen(false)}
        title="تسجيل الحالة المزاجية والذهنية اليومية 🧠"
        size="md"
      >
        <div className="space-y-5 text-right font-tajawal">
          <p className="text-xs text-gray-400">
            تابع حالتك النفسية لتكتشف متى يكون تركيزك وطاقتك في أفضل حالاتها:
          </p>

          {/* Mood Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-400" />
              المزاج العام (كيف تشعر الآن؟)
            </label>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((val) => {
                const emojis = ['😢', '😐', '🙂', '😄', '🚀']
                return (
                  <button
                    key={val}
                    onClick={() => setMood(val)}
                    className={`flex-1 py-2 rounded-xl border text-sm transition-all flex flex-col items-center gap-1 ${
                      mood === val
                        ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                        : 'border-[#2d3252] bg-[#1a1d27] text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{emojis[val - 1]}</span>
                    <span className="text-[10px]">{val}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Energy Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-orange-400" />
              مستوى الطاقة الحيوية
            </label>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setEnergy(val)}
                  className={`flex-1 py-2 rounded-xl border text-xs transition-all flex items-center justify-center gap-1 ${
                    energy === val
                      ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
                      : 'border-[#2d3252] bg-[#1a1d27] text-gray-400'
                  }`}
                >
                  {val === 1 && '🔋 فارغة'}
                  {val === 2 && '🔋 منخفضة'}
                  {val === 3 && '⚡ متوسطة'}
                  {val === 4 && '⚡ عالية'}
                  {val === 5 && '🔥 متفجرة'}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-indigo-400" />
              مستوى التركيز والانتباه
            </label>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setFocus(val)}
                  className={`flex-1 py-2 rounded-xl border text-xs transition-all flex items-center justify-center gap-1 ${
                    focus === val
                      ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                      : 'border-[#2d3252] bg-[#1a1d27] text-gray-400'
                  }`}
                >
                  {val === 1 && '💤 متشتت'}
                  {val === 2 && '💤 مشتت خفيف'}
                  {val === 3 && '🎯 طبيعي'}
                  {val === 4 && '🎯 مركز'}
                  {val === 5 && '🚀 فوكاس مفرط'}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Input
              label="ملاحظات سريعة / تفريغ فكرة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب كيف تشعر أو ما سبب مزاجك اليوم..."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-[#2d3252]/40">
            <Button variant="ghost" onClick={() => setLogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveMood}
              isLoading={createMoodLogMutation.isPending}
            >
              حفظ السجل 💾
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function AchievementsWidget() {
  const { data: achievements, isLoading } = useAchievementsQuery()
  const [activeTab, setActiveTab] = useState<'all' | 'focus' | 'tasks' | 'habits' | 'consistency' | 'courage'>('all')

  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-400 text-xs flex justify-center items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
        جاري تحميل الإنجازات...
      </div>
    )
  }

  const filtered = achievements?.filter(a => activeTab === 'all' || a.category === activeTab) || []
  
  const categories = [
    { key: 'all', label: 'الكل' },
    { key: 'focus', label: 'التركيز' },
    { key: 'tasks', label: 'المهام' },
    { key: 'habits', label: 'العادات' },
    { key: 'consistency', label: 'الاستمرارية' },
    { key: 'courage', label: 'شجاعة واعتراف' }
  ]

  const categoryColors = {
    focus: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 text-indigo-400',
    tasks: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    habits: 'from-teal-500/20 to-teal-500/5 border-teal-500/30 text-teal-400',
    consistency: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    courage: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400'
  }

  const categoryLabels = {
    focus: 'تركيز',
    tasks: 'مهام',
    habits: 'عادات',
    consistency: 'استمرارية',
    courage: 'شجاعة الـ ADHD'
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            الأوسمة والإنجازات الذاتية 🏆
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">أوسمة تقديرية تحتفل بخطواتك الإيجابية وعاداتك الجديدة. لا يوجد فشل هنا، بل محاولات مستمرة!</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeTab === cat.key
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-[#1a1d27] border border-[#2d3252]/40 text-gray-400 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((ach) => {
          const isUnlocked = ach.isUnlocked
          const colorClass = categoryColors[ach.category as keyof typeof categoryColors] || 'from-gray-500/20 to-gray-500/5 border-gray-500/30'
          const label = categoryLabels[ach.category as keyof typeof categoryLabels] || ach.category

          return (
            <div
              key={ach.id}
              className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                isUnlocked
                  ? `bg-gradient-to-br ${colorClass} shadow-lg shadow-black/10`
                  : 'bg-[#161923]/60 border-[#2d3252]/30 opacity-60'
              }`}
            >
              {/* Badge Icon / Emoji */}
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  isUnlocked
                    ? 'bg-white/10 glow-primary animate-pulse-soft'
                    : 'bg-gray-800/40 grayscale'
                }`}
              >
                {ach.emoji}
              </div>

              {/* Info */}
              <div className="space-y-1 select-none flex-1">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUnlocked ? 'bg-white/10' : 'bg-gray-800/50 text-gray-500'
                  }`}>
                    {label}
                  </span>
                  {isUnlocked ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-gray-500" />
                  )}
                </div>
                <h4 className={`text-xs font-bold font-cairo ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                  {ach.nameAr || ach.name}
                </h4>
                <p className="text-[10px] text-gray-400 leading-normal font-tajawal">
                  {ach.descriptionAr}
                </p>
                {isUnlocked && ach.unlockedAt && (
                  <span className="text-[9px] text-emerald-400/80 block mt-1">
                    ✓ تم الفتح في: {new Date(ach.unlockedAt).toLocaleDateString('ar-EG')}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
