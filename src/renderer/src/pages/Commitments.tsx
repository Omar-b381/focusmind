import { useState, useMemo } from 'react'
import { 
  useCommitmentsQuery, 
  useCreateCommitmentMutation, 
  useUpdateCommitmentMutation, 
  useDeleteCommitmentMutation 
} from '../hooks/useCommitments'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { 
  FileSignature, Plus, Trash2, Award, 
  CheckCircle2, TrendingUp, ShieldAlert
} from 'lucide-react'

export default function Commitments() {
  const { data: commitments = [], isLoading: isCommitmentsLoading } = useCommitmentsQuery()
  const createCommitmentMutation = useCreateCommitmentMutation()
  const updateCommitmentMutation = useUpdateCommitmentMutation()
  const deleteCommitmentMutation = useDeleteCommitmentMutation()

  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('learning')
  const [commitment, setCommitment] = useState('')
  const [whyItMatters, setWhyItMatters] = useState('')
  const [obstaclesPlan, setObstaclesPlan] = useState('')
  const [rewardPlan, setRewardPlan] = useState('')
  const [durationDays, setDurationDays] = useState(30)

  const handleCreate = async () => {
    if (!title.trim() || !commitment.trim()) return

    const startDate = new Date().toISOString().split('T')[0]
    const end = new Date()
    end.setDate(end.getDate() + durationDays)
    const endDate = end.toISOString().split('T')[0]

    await createCommitmentMutation.mutateAsync({
      title,
      type,
      commitment,
      whyItMatters,
      obstaclesPlan,
      rewardPlan,
      startDate,
      endDate,
      durationDays,
      status: 'active',
      streak: 0,
      completionRate: 0,
      aiCheckinEnabled: true
    })

    setIsCreating(false)
    setTitle('')
    setCommitment('')
    setWhyItMatters('')
    setObstaclesPlan('')
    setRewardPlan('')
    alert('تم كتابة عقد الالتزام بنجاح ونقش نيتك في الدماغ الثاني! 📜')
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    await updateCommitmentMutation.mutateAsync({
      id,
      updates: {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null
      }
    })
  }

  const handleCheckInIncrement = async (id: number, currentStreak: number) => {
    await updateCommitmentMutation.mutateAsync({
      id,
      updates: {
        streak: currentStreak + 1,
        completionRate: 100 // Mock completion update
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('هل تريد حذف عقد الالتزام هذا؟')) {
      await deleteCommitmentMutation.mutateAsync(id)
    }
  }

  // Calculate user integrity rate (completed commitments / total resolved)
  const integrityScore = useMemo(() => {
    const finished = commitments.filter(c => c.status === 'completed').length
    const broken = commitments.filter(c => c.status === 'broken').length
    const total = finished + broken
    if (total === 0) return 100
    return Math.round((finished / total) * 100)
  }, [commitments])

  return (
    <div className="h-full flex flex-col font-tajawal text-gray-200 p-6 overflow-y-auto space-y-6 scrollbar-thin">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-[#131620]/60 p-5 border border-[#2d3252]/40 rounded-2xl shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-cairo text-white flex items-center gap-2">
            <span>📝 عقود الالتزام والنية المكتوبة</span>
            <span className="text-xs font-normal text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Commitment Contracts
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            صياغة التزامات واضحة تحدد الدوافع والخطط الاحتياطية لتجاوز فقدان الشغف السريع
          </p>
        </div>
        <Button variant="dopamine" icon={<Plus className="h-4 w-4" />} onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'عرض العقود الفعالة' : 'صياغة عقد جديد'}
        </Button>
      </div>

      {/* Integrity Metrics Banner */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-4 bg-amber-500/5 border-amber-500/20 flex items-center gap-4">
          <Award className="h-10 w-10 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs text-gray-400 font-bold uppercase">مؤشر النزاهة والالتزام (Integrity Index)</h4>
            <span className="text-2xl font-extrabold text-white block mt-0.5">{integrityScore}%</span>
          </div>
        </Card>
        <Card className="p-4 bg-indigo-500/5 border-indigo-500/20 flex items-center gap-4">
          <FileSignature className="h-10 w-10 text-indigo-400 shrink-0" />
          <div>
            <h4 className="text-xs text-gray-400 font-bold uppercase">عقود الالتزام الفعالة</h4>
            <span className="text-2xl font-extrabold text-white block mt-0.5">
              {commitments.filter(c => c.status === 'active').length} عقد نشط
            </span>
          </div>
        </Card>
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 flex items-center gap-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs text-gray-400 font-bold uppercase">العقود المنجزة بنجاح</h4>
            <span className="text-2xl font-extrabold text-white block mt-0.5">
              {commitments.filter(c => c.status === 'completed').length} عقد منجز
            </span>
          </div>
        </Card>
      </div>

      {isCreating ? (
        /* Contract Creation Form */
        <Card className="p-6 space-y-4 bg-[#151924]/80 border-[#2d3252]/60 max-w-2xl mx-auto">
          <h3 className="text-md font-bold text-white font-cairo flex items-center gap-2 border-b border-[#2d3252]/40 pb-2">
            <FileSignature className="h-5 w-5 text-amber-400" />
            <span>صياغة وتوثيق عقد التزام معرفي وسلوكي</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">عنوان الالتزام</label>
                <Input 
                  placeholder="مثال: التزام بمسار التسويق الرقمي..." 
                  className="w-full h-10 text-sm"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">نوع المسعى</label>
                <select
                  className="w-full h-10 rounded-xl bg-[#1c2030] border border-[#2d3252] text-sm text-gray-300 px-3 pr-8 focus:ring-indigo-500"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="learning">التعلم والدراسة 📚</option>
                  <option value="habit">بناء عادات جديدة ⚡</option>
                  <option value="project">إنجاز مشروع محدد 🎯</option>
                  <option value="custom">مسعى شخصي مخصص 📝</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">أتعهد بـ (التعهد الصريح الصغير)</label>
              <textarea
                className="w-full h-16 bg-[#131620]/60 border border-[#2d3252]/60 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 resize-none scrollbar-none"
                placeholder="مثال: أتعهد بدراسة 20 دقيقة يومياً من مسار التسويق الرقمي..."
                value={commitment}
                onChange={e => setCommitment(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">لماذا هذا مهم جداً بالنسبة لي؟ (المحرك الداخلي المانع للملل)</label>
              <textarea
                className="w-full h-16 bg-[#131620]/60 border border-[#2d3252]/60 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 resize-none scrollbar-none"
                placeholder="مثال: لأنني أريد تسويق أعمالي الخاصة دون الحاجة لمسوقين خارجيين..."
                value={whyItMatters}
                onChange={e => setWhyItMatters(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-rose-400 block mb-1">خطة العقبات (عند انخفاض الشغف أو التشتت)</label>
                <textarea
                  className="w-full h-20 bg-[#131620]/60 border border-[#2d3252]/60 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-rose-500 resize-none scrollbar-none"
                  placeholder="مثال: إذا شعرت بالملل الشديد، سأقوم بفتح الدرس لمدة 5 دقائق فقط."
                  value={obstaclesPlan}
                  onChange={e => setObstaclesPlan(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-400 block mb-1">خطة المكافأة بعد الإكمال</label>
                <textarea
                  className="w-full h-20 bg-[#131620]/60 border border-[#2d3252]/60 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 resize-none scrollbar-none"
                  placeholder="مثال: سأشتري تلك اللعبة التي أريدها بعد إكمال المسار بنجاح."
                  value={rewardPlan}
                  onChange={e => setRewardPlan(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-gray-400">مدة العقد الملتزم بها</label>
                <span className="text-indigo-400 font-bold">{durationDays} يوماً</span>
              </div>
              <input 
                type="range" min="7" max="90" step="7"
                className="w-full h-1.5 bg-[#252a40] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
              />
            </div>

            <Button variant="primary" className="w-full h-11 mt-4" onClick={handleCreate}>
              نقش عقد الالتزام رسمياً 📜✍️
            </Button>
          </div>
        </Card>
      ) : (
        /* Contracts List Grid */
        <div className="grid grid-cols-2 gap-5">
          {isCommitmentsLoading ? (
            <div className="col-span-2 text-center py-12 text-gray-500">جاري تحميل عقود الالتزام...</div>
          ) : commitments.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              لا توجد عقود التزام حالياً. اضغط على "صياغة عقد جديد" لوضع تعهد معرفي يمنعك من تشتيت مسارك.
            </div>
          ) : (
            commitments.map(item => (
              <Card 
                key={item.id}
                className={`p-5 flex flex-col justify-between border-r-4 ${
                  item.status === 'completed'
                    ? 'border-r-emerald-500'
                    : item.status === 'broken'
                    ? 'border-r-rose-500'
                    : 'border-r-indigo-500'
                } relative`}
              >
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute left-3 top-3 p-1 text-gray-500 hover:text-rose-400 rounded transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">
                      {item.type === 'learning' ? 'تعلم' : item.type === 'habit' ? 'عادة' : 'مشروع'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.status === 'broken'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {item.status === 'completed' ? 'منجز' : item.status === 'broken' ? 'ملغى' : 'نشط'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-md text-white font-cairo leading-snug">{item.title}</h3>

                  <div className="p-3 bg-[#131620]/60 border border-[#2d3252]/40 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">التعهد الصريح:</span>
                    <p className="text-xs text-white leading-relaxed font-semibold">" {item.commitment} "</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> خطة العقبات
                      </span>
                      <p className="text-gray-400">{item.obstaclesPlan || 'غير مسجل'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <Award className="h-3 w-3" /> خطة المكافأة
                      </span>
                      <p className="text-gray-400">{item.rewardPlan || 'غير مسجل'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-4 border-t border-[#2d3252]/30">
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-indigo-400 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      سلسلة الالتزام: {item.streak} أيام
                    </span>
                  </div>

                  {item.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2.5 text-xs text-rose-400"
                        onClick={() => handleUpdateStatus(item.id, 'broken')}
                      >
                        ألغيت العقد
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => handleCheckInIncrement(item.id, item.streak)}
                      >
                        سجل التزام اليوم ✅
                      </Button>
                      <Button
                        variant="dopamine"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => handleUpdateStatus(item.id, 'completed')}
                      >
                        أنجزت الهدف كامل
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
