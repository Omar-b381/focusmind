import { useState } from 'react'
import { FolderPlus, Target, Ghost, AlertCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

interface MockProject {
  id: number
  name: string
  description?: string
  emoji: string
  color: string
  status: 'active' | 'paused' | 'completed' | 'graveyard'
  graveyardReason?: string
  graveyardLessons?: string
}

export default function Projects() {
  const [activeTab, setActiveTab] = useState<'active' | 'graveyard'>('active')
  const [projects, setProjects] = useState<MockProject[]>([
    { id: 1, name: 'تطبيق FocusMind لإدارة ADHD', description: 'تطبيق متكامل مبني باستخدام Electron و React', emoji: '🧠', color: '#6366f1', status: 'active' },
    { id: 2, name: 'تعلم العزف على البيانو', description: 'كورس تدريبي على العزف والسلم الموسيقي', emoji: '🎹', color: '#f97316', status: 'graveyard', graveyardReason: 'فقدت الشغف بعد أسبوعين والتركيز تشتت لمشاريع أخرى', graveyardLessons: 'يفضل التدريب في استوديو أو بشكل جماعي لزيادة الحافز الخارجي.' },
    { id: 3, name: 'تنظيم محتويات المنزل وغرفة المكتب', description: 'تطبيق أسلوب الحد الأدنى في تنظيم وترتيب الأدراج والمكاتب', emoji: '🧹', color: '#10b981', status: 'active' },
  ])

  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectEmoji, setNewProjectEmoji] = useState('📁')
  const [newProjectColor, setNewProjectColor] = useState('#6366f1')

  const handleAddProject = () => {
    if (!newProjectName.trim()) return
    const project: MockProject = {
      id: Date.now(),
      name: newProjectName.trim(),
      emoji: newProjectEmoji,
      color: newProjectColor,
      status: 'active'
    }
    setProjects([project, ...projects])
    setNewProjectName('')
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

      {activeTab === 'active' ? (
        <div className="space-y-6">
          {/* Quick Create Project */}
          <Card className="p-4 border-[#2d3252]/50">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="اسم المشروع الجديد..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
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
                <Button
                  variant="primary"
                  onClick={handleAddProject}
                  className="h-11 shrink-0"
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
              <Card key={project.id} className="p-5 flex flex-col justify-between border-l-4 min-h-[160px]" style={{ borderLeftColor: project.color }}>
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
                  <Button variant="ghost" size="sm" className="h-8 py-0 px-3 text-[11px] text-orange-400 hover:text-orange-500 font-tajawal">
                    تعليق المشروع (مقبرة) 💀
                  </Button>
                  <Button variant="secondary" size="sm" className="h-8 py-0 px-3 text-[11px] font-tajawal">
                    إدارة المهام
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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
              <Card key={project.id} className="p-5 border-orange-500/20 bg-[#1c1a22]/50 flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2 items-center">
                    <span className="text-2xl">{project.emoji}</span>
                    <h3 className="text-base font-bold text-white font-cairo">{project.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-[#131118] border border-[#2d2235] rounded-xl">
                      <h4 className="text-xs font-bold text-orange-400 font-cairo mb-1">لماذا علقت المشروع؟</h4>
                      <p className="text-xs text-gray-400 font-tajawal leading-relaxed">{project.graveyardReason}</p>
                    </div>
                    <div className="p-3 bg-[#131118] border border-[#22352b] rounded-xl">
                      <h4 className="text-xs font-bold text-emerald-400 font-cairo mb-1">ماذا تعلمت؟</h4>
                      <p className="text-xs text-gray-400 font-tajawal leading-relaxed">{project.graveyardLessons}</p>
                    </div>
                  </div>
                </div>
                <div className="self-end md:self-center shrink-0">
                  <Button variant="secondary" size="sm" className="h-9 text-xs">
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
    </div>
  )
}
