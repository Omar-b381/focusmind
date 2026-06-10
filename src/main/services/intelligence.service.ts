import { getDatabase, isFallbackDatabase } from '../database';
import { getFallbackCollection, insertFallback } from '../database/fallback';
import { gte } from 'drizzle-orm';
import * as schema from '../database/schema';

export interface PatternInsight {
  id?: number;
  type: string;
  title: string;
  description: string;
  confidence: number;
  dataPointCount: number;
  recommendation: string;
  correlationValue: number | null;
  chartData: string;
  isNew: boolean;
  isActedOn: boolean;
  validFrom: string;
  generatedAt: Date | string;
}

export class IntelligenceService {
  // Calculate Pearson correlation coefficient
  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0 || n !== y.length) return 0;

    let sumX = 0, sumY = 0, sumXY = 0;
    let sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  // Aggregate behavior patterns based on sleep logs, moods, focus sessions and tasks
  async generateBehaviorInsights(): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    const nowStr = new Date().toISOString().split('T')[0];

    // Get historical datasets
    let sleepLogs: any[] = [];
    let focusSessions: any[] = [];
    let projects: any[] = [];

    if (isFallbackDatabase()) {
      sleepLogs = getFallbackCollection('sleep_logs');
      focusSessions = getFallbackCollection('focus_sessions');
      projects = getFallbackCollection('projects');
    } else {
      const db = getDatabase();
      sleepLogs = db.select().from(schema.sleepLogs).all();
      focusSessions = db.select().from(schema.focusSessions).all();
      projects = db.select().from(schema.projects).all();
    }

    // 1. SLEEP vs FOCUS CORRELATION
    // Map dates to sleep hours and dates to focus minutes
    const sleepMap = new Map<string, number>();
    sleepLogs.forEach((log) => {
      if (log.date && log.totalHours) {
        sleepMap.set(log.date, Number(log.totalHours));
      }
    });

    const focusMap = new Map<string, number>();
    focusSessions.forEach((session) => {
      const dateStr = session.date;
      if (dateStr && session.actualMinutes) {
        focusMap.set(dateStr, (focusMap.get(dateStr) || 0) + session.actualMinutes);
      }
    });

    // Match dates
    const matchedSleep: number[] = [];
    const matchedFocus: number[] = [];

    sleepMap.forEach((sleepHours, date) => {
      const focusMinutes = focusMap.get(date) || 0;
      matchedSleep.push(sleepHours);
      matchedFocus.push(focusMinutes);
    });

    if (matchedSleep.length >= 3) {
      const r = this.calculatePearsonCorrelation(matchedSleep, matchedFocus);
      if (Math.abs(r) >= 0.25) {
        insights.push({
          type: 'sleep_focus',
          title: r > 0 ? 'نومك يصنع إنتاجيتك مباشرة 💤➔🎯' : 'نمط النوم والتركيز غير منتظم',
          description: `تحليل ${matchedSleep.length} يوماً يظهر ارتباطاً بنسبة ${Math.round(r * 100)}% بين ساعات النوم ودقائق التركيز في اليوم التالي.`,
          confidence: Math.min(Math.abs(r) + 0.2, 1),
          dataPointCount: matchedSleep.length,
          recommendation: r > 0 
            ? 'النوم الكافي (7+ ساعات) يزيد من قدرة عقلك على البقاء في حالة التدفق. احرص على النوم المنتظم لتسهيل البدء في المهام.'
            : 'حاول تتبع منغصات النوم وتجنب التفكير المتسارع لرفع كفاءة جلسات التركيز.',
          correlationValue: r,
          chartData: JSON.stringify(matchedSleep.map((sh, idx) => ({
            date: matchedSleep.length - idx,
            sleepHours: sh,
            focusMinutes: matchedFocus[idx]
          }))),
          isNew: true,
          isActedOn: false,
          validFrom: nowStr,
          generatedAt: new Date()
        });
      }
    }

    // 2. PEAK PRODUCTIVITY HOUR ANALYSIS
    const hourCounts = new Array(24).fill(0);
    focusSessions.forEach((session) => {
      const startedAt = session.startedAt;
      if (startedAt) {
        const hour = new Date(startedAt).getHours();
        hourCounts[hour] += (session.actualMinutes || 0);
      }
    });

    let peakHour = 10;
    let maxMinutes = 0;
    for (let h = 0; h < 24; h++) {
      if (hourCounts[h] > maxMinutes) {
        maxMinutes = hourCounts[h];
        peakHour = h;
      }
    }

    if (maxMinutes > 0) {
      insights.push({
        type: 'time_of_day',
        title: `ذروة نشاطك بين ${peakHour}:00 و ${peakHour + 2}:00 ⏰`,
        description: 'تظهر سجلات التركيز تركز أعلى معدلات الإنتاج والتدفق الذهني في هذا النطاق الزمني.',
        confidence: 0.80,
        dataPointCount: focusSessions.length,
        recommendation: `جدول مهامك التي تتطلب طاقة ذهنية مرتفعة وشغفاً عالياً (نظام PINCH) في هذا النطاق الزمني لتحقيق أفضل استجابة.`,
        correlationValue: null,
        chartData: JSON.stringify(hourCounts.map((min, hr) => ({ hour: `${hr}:00`, minutes: min }))),
        isNew: true,
        isActedOn: false,
        validFrom: nowStr,
        generatedAt: new Date()
      });
    }

    // 3. PROJECT ABANDONMENT WARNING (The 9-Day Wall)
    // Find active projects that haven't had completed tasks in 9 days but were created earlier
    const nineDaysAgo = Date.now() - 9 * 24 * 60 * 60 * 1000;
    const stagnantProjects = projects.filter((p: any) => {
      if (p.status !== 'active') return false;
      const createdAtMs = new Date(p.createdAt).getTime();
      const updatedAtMs = p.updatedAt ? new Date(p.updatedAt).getTime() : createdAtMs;
      // Stagnant if not updated or active in 9 days
      return updatedAtMs < nineDaysAgo && p.taskCount > p.completedTaskCount;
    });

    if (stagnantProjects.length > 0) {
      insights.push({
        type: 'project_abandonment',
        title: 'جدار هجر المشاريع يقترب ⚠️',
        description: `المشروع "${stagnantProjects[0].name}" لم يشهد أي تقدم منذ أكثر من 9 أيام. هذا نمط شائع لدى ADHD عند انخفاض الحماسة الأولى.`,
        confidence: 0.90,
        dataPointCount: stagnantProjects.length,
        recommendation: 'تجاوز الجدار عبر التخطيط لـ "فوز سريع" (Quick Win) متناهي الصغر. قم بجدولة مهمة لا تستغرق أكثر من 5 دقائق في هذا المشروع اليوم لإعادة تحفيز الدوبامين.',
        correlationValue: null,
        chartData: JSON.stringify(stagnantProjects.map(p => ({ name: p.name, tasksLeft: p.taskCount - p.completedTaskCount }))),
        isNew: true,
        isActedOn: false,
        validFrom: nowStr,
        generatedAt: new Date()
      });
    }

    // Save generated insights to DB
    if (isFallbackDatabase()) {
      insights.forEach(ins => insertFallback('pattern_insights', ins));
    } else {
      const db = getDatabase();
      for (const ins of insights) {
        db.insert(schema.patternInsights).values(ins as any).run();
      }
    }

    return insights;
  }

  // Compile weekly stats for AI narrative report
  async compileWeeklyReportData(): Promise<any> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    let sleepLogs: any[] = [];
    let focusSessions: any[] = [];
    let tasks: any[] = [];
    let journalEntries: any[] = [];
    let bodyDoubleSessions: any[] = [];

    if (isFallbackDatabase()) {
      sleepLogs = getFallbackCollection('sleep_logs').filter((s: any) => s.date >= sevenDaysAgoStr);
      focusSessions = getFallbackCollection('focus_sessions').filter((f: any) => f.date >= sevenDaysAgoStr);
      tasks = getFallbackCollection('tasks');
      journalEntries = getFallbackCollection('journal_entries').filter((j: any) => j.date >= sevenDaysAgoStr);
      bodyDoubleSessions = getFallbackCollection('body_double_sessions').filter((b: any) => b.date >= sevenDaysAgoStr);
    } else {
      const db = getDatabase();
      sleepLogs = db.select().from(schema.sleepLogs).where(gte(schema.sleepLogs.date, sevenDaysAgoStr)).all();
      focusSessions = db.select().from(schema.focusSessions).where(gte(schema.focusSessions.date, sevenDaysAgoStr)).all();
      tasks = db.select().from(schema.tasks).all();
      journalEntries = db.select().from(schema.journalEntries).where(gte(schema.journalEntries.date, sevenDaysAgoStr)).all();
      bodyDoubleSessions = db.select().from(schema.bodyDoubleSessions).where(gte(schema.bodyDoubleSessions.date, sevenDaysAgoStr)).all();
    }

    // Calculate aggregations
    const totalFocusMinutes = focusSessions.reduce((acc, curr) => acc + (curr.actualMinutes || 0), 0);
    const completedTasksCount = tasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt) >= sevenDaysAgo).length;

    const avgSleepHours = sleepLogs.length > 0 
      ? sleepLogs.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) / sleepLogs.length
      : 0;

    const avgSleepQuality = sleepLogs.length > 0
      ? sleepLogs.reduce((acc, curr) => acc + (curr.quality || 0), 0) / sleepLogs.length
      : 0;

    const racingThoughtsCount = sleepLogs.filter(s => s.racingThoughts).length;

    const avgMood = journalEntries.length > 0
      ? journalEntries.reduce((acc, curr) => acc + (curr.moodAtWrite || 3), 0) / journalEntries.length
      : 3;

    const avgEnergy = journalEntries.length > 0
      ? journalEntries.reduce((acc, curr) => acc + (curr.energyAtWrite || 3), 0) / journalEntries.length
      : 3;

    // Dominant Emotion
    const emotions = journalEntries.map(j => j.primaryEmotion).filter(Boolean);
    const emotionCounts = new Map<string, number>();
    emotions.forEach(e => emotionCounts.set(e, (emotionCounts.get(e) || 0) + 1));
    let dominantEmotion = 'غير مسجلة';
    let maxEmotionCount = 0;
    emotionCounts.forEach((cnt, em) => {
      if (cnt > maxEmotionCount) {
        maxEmotionCount = cnt;
        dominantEmotion = em;
      }
    });

    const totalDriftsCount = bodyDoubleSessions.reduce((acc, curr) => acc + (curr.driftDetectedCount || 0), 0);

    return {
      totalFocusMinutes,
      focusSessionsCount: focusSessions.length,
      completedTasksCount,
      totalTasksCount: tasks.length,
      cardsReviewedCount: focusSessions.reduce((acc, curr) => acc + (curr.cardsReviewed || 0), 0),
      avgSleepHours,
      avgSleepQuality,
      racingThoughtsCount,
      avgMood,
      avgEnergy,
      dominantEmotion,
      totalDriftsCount,
      bodyDoubleSessions: bodyDoubleSessions.length
    };
  }
}
