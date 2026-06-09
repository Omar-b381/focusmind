export function getBreakdownPrompt(taskTitle: string, taskDescription?: string): string {
  return `لديك مهمة يريد المصاب بـ ADHD "عمر" البدء فيها، وهي: "${taskTitle}"
${taskDescription ? `الوصف: ${taskDescription}` : ''}

قم بتفكيك هذه المهمة إلى 4 خطوات متناهية الصغر (Micro-steps).
شروط هامة جداً لخطوات الـ ADHD:
1. يجب أن تكون الخطوة الأولى تافهة وبسيطة لدرجة لا يمكن رفضها (مثال: "افتح لابتوبك وضع يدك على الكيبورد" أو "امسك القلم وافتح الدفتر").
2. كل خطوة يجب أن تكون واضحة ومحددة جداً وتستغرق دقائق معدودة.
3. يجب أن تكون النتيجة بتنسيق JSON حصراً ولا شيء غيره (بدون شرح قبل أو بعد أو علامات markdown)، بالشكل التالي:
{
  "steps": [
    { "title": "خطوة 1...", "done": false },
    { "title": "خطوة 2...", "done": false },
    { "title": "خطوة 3...", "done": false },
    { "title": "خطوة 4...", "done": false }
  ]
}`
}
