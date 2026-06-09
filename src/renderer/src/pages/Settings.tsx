import { useEffect, useState } from 'react'
import { useSettingsStore } from '../stores/settings.store'
import { ShieldAlert, Cpu, Timer, Volume2, Download } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Settings() {
  const { settings, fetchSettings, updateSetting } = useSettingsStore()
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    setApiKey(settings.aiApiKey)
  }, [settings.aiApiKey])

  const handleSaveAPIKey = () => {
    updateSetting('aiApiKey', apiKey)
  }

  const providers = [
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'openai', name: 'OpenAI GPT' },
    { id: 'anthropic', name: 'Anthropic Claude' },
    { id: 'ollama', name: 'Ollama (محلي)' },
    { id: 'openrouter', name: 'OpenRouter' },
  ]

  return (
    <div className="space-y-6 font-tajawal text-right">
      <div>
        <h2 className="text-xl font-bold text-white font-cairo">الإعدادات</h2>
        <p className="text-xs text-gray-400 mt-0.5">تخصيص تجربة التطبيق، أوقات الجلسات، وإعدادات الذكاء الاصطناعي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side (2 cols): Main configs */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Settings */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5 text-indigo-400 border-b border-[#2d3252]/50 pb-2">
              <Cpu className="h-4 w-4" />
              محرك الذكاء الاصطناعي (AI Coach)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 mr-1">مزود الخدمة</label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => updateSetting('aiProvider', e.target.value as any)}
                  className="h-11 px-3 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 mr-1">الموديل (Model)</label>
                <input
                  type="text"
                  value={settings.aiModel}
                  onChange={(e) => updateSetting('aiModel', e.target.value)}
                  placeholder="e.g. gemini-1.5-flash"
                  className="h-11 px-4 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="مفتاح الـ API (API Key)"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="أدخل مفتاح التحقق المفرّد الخاص بك..."
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleSaveAPIKey}
                className="h-11 px-5 font-tajawal text-xs shrink-0"
              >
                حفظ المفتاح
              </Button>
            </div>
          </Card>

          {/* Pomodoro settings */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5 text-indigo-400 border-b border-[#2d3252]/50 pb-2">
              <Timer className="h-4 w-4" />
              مؤقت جلسات التركيز (Pomodoro)
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 mr-1">مدة التركيز (دقائق)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.focusDuration}
                  onChange={(e) => updateSetting('focusDuration', Number(e.target.value))}
                  className="h-11 px-3 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-xs outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 mr-1">استراحة قصيرة</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => updateSetting('shortBreakDuration', Number(e.target.value))}
                  className="h-11 px-3 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-xs outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 mr-1">استراحة طويلة</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => updateSetting('longBreakDuration', Number(e.target.value))}
                  className="h-11 px-3 rounded-xl border border-[#2d3252] bg-[#1a1d27] text-white text-center text-xs outline-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side (1 col): System Settings */}
        <div className="space-y-6">
          {/* Sounds & notifications */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5 text-indigo-400 border-b border-[#2d3252]/50 pb-2">
              <Volume2 className="h-4 w-4" />
              النظام والتنبيهات
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white font-tajawal block">مؤثرات صوتية</span>
                  <span className="text-[10px] text-gray-400 font-tajawal leading-none">تشغيل هابتك ومكافآت صوتية</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  className="h-5 w-5 rounded border-[#2d3252] bg-[#1a1d27] text-indigo-500 focus:ring-0 focus:ring-offset-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white font-tajawal block">تنبيهات النظام</span>
                  <span className="text-[10px] text-gray-400 font-tajawal leading-none">إرسال إشعارات بنهاية الجلسات</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
                  className="h-5 w-5 rounded border-[#2d3252] bg-[#1a1d27] text-indigo-500 focus:ring-0 focus:ring-offset-0"
                />
              </label>
            </div>
          </Card>

          {/* Backup & Restore */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-cairo flex items-center gap-1.5 text-indigo-400 border-b border-[#2d3252]/50 pb-2">
              <Download className="h-4 w-4" />
              النسخ الاحتياطي والبيانات
            </h3>
            
            <div className="space-y-3">
              <p className="text-[10px] text-gray-400 leading-relaxed font-tajawal">
                يمكنك حفظ نسخة احتياطية من كل بياناتك واستعادتها في أي وقت للحفاظ على تقدمك.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-xs h-10 font-tajawal"
                  onClick={async () => {
                    const ok = await window.api.system.exportData()
                    if (ok) {
                      window.api.system.showNotification('تم التصدير بنجاح', 'تم حفظ نسخة احتياطية من بياناتك بنجاح.')
                    }
                  }}
                >
                  تصدير البيانات 📤
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 text-xs h-10 font-tajawal"
                  onClick={async () => {
                    const ok = await window.api.system.importData()
                    if (ok) {
                      window.api.system.showNotification('تم الاستيراد بنجاح', 'تمت استعادة بياناتك بنجاح. سيتم تحديث الصفحة.')
                      window.location.reload()
                    }
                  }}
                >
                  استيراد البيانات 📥
                </Button>
              </div>
            </div>
          </Card>

          {/* Privacy and Local first notice */}
          <Card className="p-5 border-indigo-500/20 bg-indigo-500/[0.02] space-y-2 flex flex-col items-center text-center">
            <ShieldAlert className="h-8 w-8 text-indigo-400 mb-1" />
            <h4 className="text-xs font-bold text-white font-cairo">بياناتك محلية بالكامل 🔒</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed font-tajawal">
              يتم حفظ جميع مهامك، مشاريعك ومحادثاتك الذكية محلياً على جهازك في قاعدة بيانات SQLite مشفرة ومؤمنة تماماً. لا توجد خوادم خارجية تخزن معلوماتك.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
