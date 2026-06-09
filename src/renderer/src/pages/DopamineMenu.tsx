import { useState } from 'react'
import { Play, Plus, RefreshCw, AlertCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import {
  useDopamineActivitiesQuery,
  useCreateDopamineActivityMutation,
  useUseDopamineActivityMutation
} from '../hooks/useDopamine'

export default function DopamineMenu() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'movement' | 'sensory' | 'creative' | 'nature' | 'social' | 'achievement'>('all')

  // Create Activity Modal states
  const [isAddOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🌟')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState<'movement' | 'creative' | 'social' | 'sensory' | 'achievement' | 'nature'>('creative')
  const [newDuration, setNewDuration] = useState(5)
  const [newDopamineScore, setNewDopamineScore] = useState(5)

  // TanStack Query Hooks
  const { data: activities = [], isLoading, isError } = useDopamineActivitiesQuery()
  const createActivityMutation = useCreateDopamineActivityMutation()
  const useActivityMutation = useUseDopamineActivityMutation()

  const handleAddActivity = () => {
    if (!newName.trim()) return
    createActivityMutation.mutate({
      name: newName.trim(),
      emoji: newEmoji,
      description: newDescription.trim(),
      category: newCategory,
      durationMinutes: newDuration,
      dopamineScore: newDopamineScore,
      energyCost: 'low',
      isCustom: true
    })
    setNewName('')
    setNewDescription('')
    setAddOpen(false)
  }

  const handleUseActivity = (id: number) => {
    useActivityMutation.mutate(id)
  }

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

        {/* Action and Categories filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <Button
            variant="dopamine"
            size="sm"
            onClick={() => setAddOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            إضافة نشاط مخصص
          </Button>

          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'movement', 'sensory', 'creative', 'nature'] as const).map((cat) => (
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
                {cat === 'nature' && '🌿 طبيعة'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          جاري تحميل قائمة الدوبامين...
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-400 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          حدث خطأ أثناء تحميل قائمة الدوبامين.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => (
            <Card
              key={act.id}
              className="p-5 flex flex-col justify-between hover:border-orange-500/30 transition-all border-[#2d3252]/50 bg-[#1a1d27] group min-h-[180px]"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-3xl p-1 bg-[#21253a] rounded-xl group-hover:scale-110 transition-transform duration-200">{act.emoji}</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-bold font-tajawal">
                      +{act.dopamineScore} نقطة
                    </span>
                    {act.useCount > 0 && (
                      <span className="text-[9px] text-gray-400">
                        استخدم {act.useCount} مرات
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white font-cairo">{act.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-1.5">
                  {act.description || 'لا يوجد وصف مضاف لهذا النشاط.'}
                </p>
              </div>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#2d3252]/50">
                <span className="text-xs text-gray-400 font-tajawal">⏱️ المدة: {act.durationMinutes} د</span>
                <Button
                  variant="dopamine"
                  size="sm"
                  className="h-8 py-0 px-3 text-xs font-tajawal"
                  onClick={() => handleUseActivity(act.id)}
                  isLoading={useActivityMutation.isPending}
                  icon={<Play className="h-3 w-3 fill-white" />}
                >
                  بدء النشاط
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dopamine Activity Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        title="إضافة نشاط مخصص لقائمة الدوبامين 🍊"
        size="md"
      >
        <div className="space-y-4 text-right font-tajawal">
          <p className="text-xs text-gray-400">
            أضف نشاطاً صحياً ومحبباً لتعود إليه عندما تشعر بتشتت التركيز:
          </p>
          <div className="space-y-3">
            <Input
              label="اسم النشاط..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="مثال: الاستماع لمقطع صوتي حماسي / تمارين ضغط..."
            />
            <Input
              label="الوصف..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="وصف مختصر للخطوات البسيطة لبدء النشاط..."
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 text-right">
                <label className="text-[10px] text-gray-400 mr-1">التصنيف</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="h-11 px-3 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-xs outline-none"
                >
                  <option value="movement">🚶 حركة وجسد</option>
                  <option value="sensory">🎵 حسي وسمعي</option>
                  <option value="creative">✍️ إبداعي وخيالي</option>
                  <option value="nature">🌿 طبيعة وتأمل</option>
                  <option value="achievement">🏆 إنجاز وتحدي</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <label className="text-[10px] text-gray-400 mr-1">الأيقونة (Emoji)</label>
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="h-11 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 text-right">
                <label className="text-[10px] text-gray-400 mr-1">المدة بالدقائق</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="h-11 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-xs outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 text-right">
                <label className="text-[10px] text-gray-400 mr-1">التقييم الدوباميني (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newDopamineScore}
                  onChange={(e) => setNewDopamineScore(Number(e.target.value))}
                  className="h-11 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#2d3252]/40">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="dopamine"
              onClick={handleAddActivity}
              disabled={!newName.trim()}
              isLoading={createActivityMutation.isPending}
            >
              إضافة للقائمة 🍊
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
