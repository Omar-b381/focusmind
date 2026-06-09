import { motion } from 'framer-motion'
import { useAppStore } from '../stores/app.store'
import { Sparkles, CheckCircle, Flame, Timer } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function Dashboard() {
  const { setActiveTab } = useAppStore()

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 font-tajawal text-right"
    >
      {/* AI Coach Welcome / Tip */}
      <motion.div variants={itemVariants}>
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 glass overflow-hidden flex items-start gap-4">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 glow-primary">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-base font-bold text-white font-cairo">المرشد الذكي</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              &quot;أهلاً بك يا عمر. تذكر، عقل الـ ADHD ليس معيباً، هو فقط يعمل بطريقة مختلفة. اليوم سنركز على إنجاز مهمة واحدة رئيسية، ولا داعي للقلق بشأن المهام الأخرى.&quot;
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: One Thing & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: One Thing Rule */}
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col">
          <Card variant="elevated" className="flex-1 border-indigo-500/30 p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-indigo-400 font-semibold tracking-wider font-cairo">قاعدة المهمة الواحدة (One Thing)</span>
                <Badge category="priority" value="high" />
              </div>
              <h2 className="text-xl font-extrabold text-white font-cairo mb-3">
                تجهيز عرض التصميم لعميل FocusMind
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                هذه هي المهمة الأكثر أهمية اليوم. ركز عليها أولاً لرفع مستويات الدوبامين والشعور بالإنجاز المبكر.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => setActiveTab('focus')}
                icon={<Timer className="h-4.5 w-4.5" />}
              >
                بدء التركيز ⏱️
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('tasks')}
              >
                تصفح باقي المهام
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Right Col: Stats & Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Energy Widget */}
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-cairo">طاقتك اليوم</h4>
                <p className="text-xs text-gray-400">متوسطة — مناسب للمهام المتوسطة</p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-orange-400 font-cairo">3 / 5</span>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <Timer className="h-5 w-5 text-indigo-400" />
              <span className="text-xs text-gray-400 font-tajawal">وقت التركيز</span>
              <span className="text-lg font-bold text-white font-cairo">50 دقيقة</span>
            </Card>

            <Card className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-gray-400 font-tajawal">المهام المنجزة</span>
              <span className="text-lg font-bold text-white font-cairo">4 مهام</span>
            </Card>
          </div>

          {/* Dopamine Boost Card */}
          <Card className="p-4 border-orange-500/20 bg-gradient-to-tr from-orange-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-cairo">تحتاج دفعة دوبامين؟</h4>
                <p className="text-xs text-gray-400">ابدأ بنشاط 2 دقيقة لتنشيط ذهنك</p>
              </div>
            </div>
            <Button
              variant="dopamine"
              size="sm"
              onClick={() => setActiveTab('dopamine')}
              className="px-3 py-1.5 text-xs h-8"
            >
              دوبامين ⚡
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Today's Habits Section */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-base font-bold text-white font-cairo">عادات اليوم السريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center justify-between border-emerald-500/20 bg-emerald-500/5">
            <span className="text-sm font-medium text-white">💧 شرب 2 لتر ماء</span>
            <span className="text-xs text-emerald-400 font-medium font-tajawal">مكتملة ✅</span>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-white">🚶 مشي خفيف 10 دقائق</span>
            <Button variant="secondary" size="sm" className="h-8 py-0 px-3 text-xs">تحديد كمكتمل</Button>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-white">📖 قراءة 5 صفحات</span>
            <Button variant="secondary" size="sm" className="h-8 py-0 px-3 text-xs">تحديد كمكتمل</Button>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
