import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { BarChart3, TrendingUp, Smile } from 'lucide-react'
import Card from '../components/ui/Card'

export default function Analytics() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  const weeklyData = [
    { name: 'الأحد', focusMinutes: 50, tasksCompleted: 4, mood: 4 },
    { name: 'الاثنين', focusMinutes: 75, tasksCompleted: 6, mood: 3 },
    { name: 'الثلاثاء', focusMinutes: 25, tasksCompleted: 2, mood: 2 },
    { name: 'الأربعاء', focusMinutes: 110, tasksCompleted: 9, mood: 5 },
    { name: 'الخميس', focusMinutes: 45, tasksCompleted: 3, mood: 4 },
    { name: 'الجمعة', focusMinutes: 0, tasksCompleted: 0, mood: 5 },
    { name: 'السبت', focusMinutes: 30, tasksCompleted: 1, mood: 3 },
  ]

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white font-cairo">الإحصائيات والتحليلات</h2>
          <p className="text-xs text-gray-400 mt-0.5">تتبع تقدمك، مستويات طاقتك، وحالة تركيزك على مدار الأيام.</p>
        </div>

        <div className="flex gap-2">
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

      {/* Stats summary banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4 border-indigo-500/20 bg-indigo-500/[0.02]">
          <div className="h-11 w-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block mb-0.5">إجمالي وقت التركيز</span>
            <span className="text-lg font-bold text-white font-cairo">335 دقيقة</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block mb-0.5">معدل إنجاز المهام</span>
            <span className="text-lg font-bold text-white font-cairo">25 مهمة</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-orange-500/20 bg-orange-500/[0.02]">
          <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
            <Smile className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block mb-0.5">متوسط الحالة المزاجية</span>
            <span className="text-lg font-bold text-white font-cairo">3.8 / 5</span>
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
              <AreaChart data={weeklyData}>
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
              <BarChart data={weeklyData}>
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
    </div>
  )
}
