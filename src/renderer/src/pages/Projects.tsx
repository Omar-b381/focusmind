import { useState } from 'react'
import { FolderPlus, Target, Ghost, AlertCircle, RefreshCw } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useMoveToGraveyardMutation
} from '../hooks/useProjects'
import { useAppStore } from '../stores/app.store'

export default function Projects() {
  const [activeTab, setActiveTab] = useState<'active' | 'graveyard'>('active')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectEmoji, setNewProjectEmoji] = useState('📁')
  const [newProjectColor, setNewProjectColor] = useState('#6366f1')

  // Move to Graveyard Modal States
  const [graveyardProjectId, setGraveyardProjectId] = useState<number | null>(null)
  const [graveyardReason, setGraveyardReason] = useState('')
  const [graveyardLessons, setGraveyardLessons] = useState('')

  // TanStack Query Hooks
  const { data: projects = [], isLoading, isError } = useProjectsQuery()
  const createProjectMutation = useCreateProjectMutation()
  const updateProjectMutation = useUpdateProjectMutation()
  const moveToGraveyardMutation = useMoveToGraveyardMutation()
  const setActiveGlobalTab = useAppStore((state) => state.setActiveTab)

  const handleAddProject = () => {
    if (!newProjectName.trim()) return
    createProjectMutation.mutate({
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      emoji: newProjectEmoji,
      color: newProjectColor,
      status: 'active',
      totalFocusMinutes: 0,
      taskCount: 0,
      completedTaskCount: 0
    })
    setNewProjectName('')
    setNewProjectDescription('')
  }

  const handleOpenGraveyardModal = (id: number) => {
    setGraveyardProjectId(id)
    setGraveyardReason('')
    setGraveyardLessons('')
  }

  const handleConfirmGraveyard = () => {
    if (graveyardProjectId === null || !graveyardReason.trim()) return
    moveToGraveyardMutation.mutate({
      id: graveyardProjectId,
      reason: graveyardReason.trim(),
      lessons: graveyardLessons.trim()
    })
    setGraveyardProjectId(null)
  }

  const handleReviveProject = (id: number) => {
    updateProjectMutation.mutate({
      id,
      updates: {
        status: 'active',
        graveyardReason: null,
        graveyardLessons: null
      }
    })
  }

  const activeProjects = projects.filter((p) => p.status === 'active')
  const graveyardProjects = projects.filter((p) => p.status === 'graveyard')

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white font-cairo">المشاريع</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-[#1a1d27] border border-[#2d3252]/50 text-gray-400'
            }`}
          >
            <Target className="h-4 w-4" />
            المشاريع النشطة ({activeProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('graveyard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'graveyard'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-[#1a1d27] border border-[#2d3252]/50 text-gray-400'
            }`}
          >
            <Ghost className="h-4 w-4" />
            مقبرة المشاريع 💀 ({graveyardProjects.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
          جاري تحميل المشاريع...
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-400 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          حدث خطأ أثناء تحميل المشاريع.
        </div>
      ) : activeTab === 'active' ? (
        <div className="space-y-6">
          {/* Quick Create Project */}
          <Card className="p-4 border-[#2d3252]/50">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full text-right">
                  <Input
                    label="اسم المشروع الجديد..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 mr-1">الأيقونة</label>
                    <input
                      type="text"
                      value={newProjectEmoji}
                      onChange={(e) => setNewProjectEmoji(e.target.value)}
                      className="h-11 w-14 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-lg outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 mr-1">اللون</label>
                    <input
                      type="color"
                      value={newProjectColor}
                      onChange={(e) => setNewProjectColor(e.target.value)}
                      className="h-11 w-14 p-1 rounded-xl border border-[#2d3252] bg-[#1a1d27] outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full text-right">
                  <Input
                    label="وصف المشروع (اختياري)..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddProject}
                  className="h-11 shrink-0 w-full md:w-auto"
                  isLoading={createProjectMutation.isPending}
                  icon={<FolderPlus className="h-5 w-5" />}
                >
                  إنشاء مشروع
                </Button>
              </div>
            </div>
          </Card>

          {/* Active Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((project) => (
              <Card
                key={project.id}
                className="p-5 flex flex-col justify-between border-l-4 min-h-[160px]"
                style={{ borderLeftColor: project.color }}
              >
                <div>
                  <div className="flex gap-2.5 items-center mb-2">
                    <span className="text-2xl">{project.emoji}</span>
                    <h3 className="text-base font-bold text-white font-cairo">{project.name}</h3>
                  </div>
                  <p className="text-xs text-gray-400 font-tajawal leading-relaxed">
                    {project.description || 'لا يوجد وصف مضاف لهذا المشروع.'}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 py-0 px-3 text-[11px] text-orange-400 hover:text-orange-500 font-tajawal"
                    onClick={() => handleOpenGraveyardModal(project.id)}
                  >
                    تعليق المشروع (مقبرة) 💀
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 py-0 px-3 text-[11px] font-tajawal"
                    onClick={() => setActiveGlobalTab('tasks')}
                  >
                    إدارة المهام
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {activeProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              لا توجد مشاريع نشطة حالياً. أضف مشروعاً جديداً بالأعلى للبدء! 📁
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 text-gray-300 text-xs leading-relaxed flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-400 shrink-0" />
            <p>
              <strong>مقبرة المشاريع بدون خجل:</strong> عقول الـ ADHD مليئة بالطاقة والأفكار الإبداعية. تعليق مشروع والاعتراف بذلك هو شجاعة كبيرة وليس فشلاً. هنا نحتفل بالمشاريع التي بدأتها والدروس التي تعلمتها منها.
            </p>
          </div>

          {/* Graveyard Projects Grid */}
          <div className="grid grid-cols-1 gap-4">
            {graveyardProjects.map((project) => (
              <Card
                key={project.id}
                className="p-5 border-orange-500/20 bg-[#1c1a22]/50 flex flex-col md:flex-row gap-4 justify-between items-start"
              >
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex gap-2 items-center">
                    <span className="text-2xl">{project.emoji}</span>
                    <h3 className="text-base font-bold text-white font-cairo">{project.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-[#131118] border border-[#2d2235] rounded-xl text-right">
                      <h4 className="text-xs font-bold text-orange-400 font-cairo mb-1">لماذا علقت المشروع؟</h4>
                      <p className="text-xs text-gray-400 font-tajawal leading-relaxed">
                        {project.graveyardReason || 'لا يوجد سبب مكتوب.'}
                      </p>
                    </div>
                    <div className="p-3 bg-[#131118] border border-[#22352b] rounded-xl text-right">
                      <h4 className="text-xs font-bold text-emerald-400 font-cairo mb-1">ماذا تعلمت؟</h4>
                      <p className="text-xs text-gray-400 font-tajawal leading-relaxed">
                        {project.graveyardLessons || 'لم يتم تسجيل دروس بعد.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="self-end md:self-center shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => handleReviveProject(project.id)}
                    isLoading={updateProjectMutation.isPending}
                  >
                    إعادة إحياء المشروع ⚡
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {graveyardProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              المقبرة فارغة حالياً. كل مشروع تبدأه مستمر بنجاح! 🌟
            </div>
          )}
        </div>
      )}

      {/* Move to Graveyard Modal */}
      <Modal
        isOpen={graveyardProjectId !== null}
        onClose={() => setGraveyardProjectId(null)}
        title="شجاعة الاعتراف: تعليق المشروع 💀"
        size="md"
      >
        <div className="space-y-4 text-right font-tajawal">
          <p className="text-xs text-gray-300 leading-relaxed">
            تعليق المشاريع المعلقة يقلل العبء النفسي ويسمح لك بالتركيز على ما يهم حالياً. اكتب هنا سبب التعليق وما تعلمته للاستفادة منه لاحقاً.
          </p>
          <div className="space-y-3">
            <Input
              label="لماذا اخترت تعليق هذا المشروع الآن؟"
              value={graveyardReason}
              onChange={(e) => setGraveyardReason(e.target.value)}
              placeholder="مثال: فقدت الشغف بسبب الصعوبة التقنية / أريد التركيز على مشروع آخر..."
            />
            <Input
              label="ما هي أهم الدروس المستفادة من التجربة؟"
              value={graveyardLessons}
              onChange={(e) => setGraveyardLessons(e.target.value)}
              placeholder="مثال: تقسيم المهام لقطع أصغر / أحتاج لشريك مساءلة..."
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setGraveyardProjectId(null)}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmGraveyard}
              disabled={!graveyardReason.trim()}
              isLoading={moveToGraveyardMutation.isPending}
            >
              تعليق بمحبة وسلام ❤️
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
