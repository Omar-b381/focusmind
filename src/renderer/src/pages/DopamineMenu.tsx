import { useState } from 'react'
import { Play } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

interface MockDopamineActivity {
  id: number
  name: string
  emoji: string
  description: string
  category: 'movement' | 'creative' | 'social' | 'sensory' | 'achievement' | 'nature'
  durationMinutes: number
  dopamineScore: number
}

export default function DopamineMenu() {
  const [activities] = useState<MockDopamineActivity[]>([
    { id: 1, name: 'مشي 5 دقائق', emoji: '🚶', description: 'تمشي لتنشيط الدورة الدموية وتجديد الطاقة', category: 'movement', durationMinutes: 5, dopamineScore: 7 },
    { id: 2, name: 'شرب كوب ماء بارد', emoji: '💧', description: 'شرب كوب ماء بارد ينعش حواسك تماماً', category: 'sensory', durationMinutes: 2, dopamineScore: 4 },
    { id: 3, name: 'الاستماع لأغنية مفضلة', emoji: '🎵', description: 'أغنية واحدة تحبها لتعديل المزاج فوراً', category: 'sensory', durationMinutes: 5, dopamineScore: 8 },
    { id: 4, name: 'تنفس عميق 5 مرات', emoji: '🧘', description: 'تنظيم الشهيق والزفير لتهدئة الجهاز العصبي', category: 'sensory', durationMinutes: 2, dopamineScore: 5 },
    { id: 5, name: 'الرسم العشوائي', emoji: '✍️', description: 'خربشة عشوائية على ورقة لتشغيل الخيال', category: 'creative', durationMinutes: 10, dopamineScore: 6 },
    { id: 6, name: 'النظر إلى الطبيعة', emoji: '🌿', description: 'التحديق في النافذة أو السماء لترييح شبكية العين', category: 'nature', durationMinutes: 3, dopamineScore: 5 },
  ])

  const [activeCategory, setActiveCategory] = useState<'all' | 'movement' | 'sensory' | 'creative'>('all')

  const filteredActivities = activities.filter((act) => {
    if (activeCategory === 'all') return true
    return act.category === activeCategory
  })

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-cairo">قائمة الدوبامين الذكية (Dopamine Menu)</h2>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            أنشطة سريعة وصحية لرفع مستويات الدوبامين لديك قبل بدء المهام الصعبة أو خلال الاستراحات لتفادي التشتت الرقمي.
          </p>
        </div>

        {/* Categories filters */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'movement', 'sensory', 'creative'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-[#1a1d27] border border-[#2d3252]/50 text-gray-400 hover:text-gray-200'
              }`}
            >
              {cat === 'all' && 'الكل'}
              {cat === 'movement' && '🚶 حركة'}
              {cat === 'sensory' && '🎵 حسي'}
              {cat === 'creative' && '✍️ إبداعي'}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => (
          <Card
            key={act.id}
            className="p-5 flex flex-col justify-between hover:border-orange-500/30 transition-all border-[#2d3252]/50 bg-[#1a1d27] group min-h-[180px]"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl p-1 bg-[#21253a] rounded-xl group-hover:scale-110 transition-transform duration-200">{act.emoji}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-bold font-tajawal">
                  +{act.dopamineScore} نقطة
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-cairo">{act.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-1.5">
                {act.description}
              </p>
            </div>

            <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#2d3252]/50">
              <span className="text-xs text-gray-400 font-tajawal">⏱️ المدة: {act.durationMinutes} د</span>
              <Button
                variant="dopamine"
                size="sm"
                className="h-8 py-0 px-3 text-xs font-tajawal"
                icon={<Play className="h-3 w-3 fill-white" />}
              >
                بدء النشاط
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
