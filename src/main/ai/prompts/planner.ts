export function getDailyPlannerPrompt(energyLevel: string, tasks: { title: string; priority: string; estimatedMinutes: number }[]): string {
  const tasksList = tasks.map((t, idx) => `- [${idx + 1}] ${t.title} (الأولوية: ${t.priority}، المدة: ${t.estimatedMinutes} دقيقة)`).join('\n')
  
  return `مرحباً! مستخدم الـ ADHD "عمر" لديه طاقة حالية بمستوى "${energyLevel}" (منخفضة/متوسطة/عالية).
لديه المهام التالية المخطط لها اليوم:
${tasksList || 'لا توجد مهام حالياً'}

بصفتك مرشد ADHD، اقترح خطة يومية (Daily Plan) رفيقة بالدماغ ومحفزة للدوبامين.
اتبع القواعد التالية:
1. رتب المهام بحيث تبدأ بمهمة ذات طاقة مناسبة لمستواه الحالي.
2. لا تجدول أكثر من 3 مهام رئيسية لتجنب شلل المهام وغمر العقل (Overwhelm).
3. أضف استراحات قصيرة محددة (مثلاً: الاستماع لموسيقى 5 دقائق، المشي).
4. اكتب الخطة بلغة عربية لطيفة ومحفزة في نقاط قصيرة جداً.`
}
