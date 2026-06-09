import { ipcMain, Notification } from 'electron'
import { getDatabase, isFallbackDatabase } from '../database'
import { getFallbackCollection, insertFallback, updateFallback, deleteFallback } from '../database/fallback'
import { eq, and } from 'drizzle-orm'
import * as schema from '../database/schema'
import { getAIProvider } from '../ai/manager'
import { COACH_SYSTEM_PROMPT } from '../ai/prompts/coach'
import { getDailyPlannerPrompt } from '../ai/prompts/planner'
import { getBreakdownPrompt } from '../ai/prompts/breakdown'
import { getEveningReflectPrompt } from '../ai/prompts/reflect'

export function registerIPCHandlers(): void {
  function getAppSettings() {
    const list = isFallbackDatabase() 
      ? getFallbackCollection('settings')
      : getDatabase().select().from(schema.settings).all()
    const settingsObj: Record<string, string> = {}
    list.forEach((s: any) => {
      settingsObj[s.key] = s.value
    })
    return settingsObj
  }

  // ==========================================
  // Tasks IPC Handlers
  // ==========================================
  ipcMain.handle('tasks:getTasks', async (_, filters) => {
    if (isFallbackDatabase()) {
      let list = getFallbackCollection('tasks')
      if (filters?.status) {
        list = list.filter((t: any) => t.status === filters.status)
      }
      if (filters?.projectId) {
        list = list.filter((t: any) => t.projectId === filters.projectId)
      }
      if (filters?.energyLevel) {
        list = list.filter((t: any) => t.energyLevel === filters.energyLevel)
      }
      return list
    } else {
      const db = getDatabase()
      const conditions: any[] = []
      if (filters?.status) conditions.push(eq(schema.tasks.status, filters.status))
      if (filters?.projectId) conditions.push(eq(schema.tasks.projectId, filters.projectId))
      if (filters?.energyLevel) conditions.push(eq(schema.tasks.energyLevel, filters.energyLevel))
      
      const query = db.select().from(schema.tasks)
      if (conditions.length > 0) {
        return query.where(and(...conditions)).all()
      }
      return query.all()
    }
  })

  ipcMain.handle('tasks:getTaskById', async (_, id) => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('tasks').find((t: any) => t.id === id)
    } else {
      const db = getDatabase()
      return db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).get()
    }
  })

  ipcMain.handle('tasks:createTask', async (_, task) => {
    if (isFallbackDatabase()) {
      return insertFallback('tasks', {
        ...task,
        status: task.status || 'inbox',
        energyLevel: task.energyLevel || 'medium',
        priority: task.priority || 'medium',
        estimatedMinutes: task.estimatedMinutes || 25,
        isMicroTask: task.isMicroTask ? 1 : 0
      })
    } else {
      const db = getDatabase()
      const result = db.insert(schema.tasks).values({
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any).run()
      return db.select().from(schema.tasks).where(eq(schema.tasks.id, Number(result.lastInsertRowid))).get()
    }
  })

  ipcMain.handle('tasks:updateTask', async (_, id, taskUpdates) => {
    if (isFallbackDatabase()) {
      return updateFallback('tasks', id, taskUpdates)
    } else {
      const db = getDatabase()
      db.update(schema.tasks).set({
        ...taskUpdates,
        updatedAt: new Date()
      } as any).where(eq(schema.tasks.id, id)).run()
      return db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).get()
    }
  })

  ipcMain.handle('tasks:deleteTask', async (_, id) => {
    if (isFallbackDatabase()) {
      return deleteFallback('tasks', id)
    } else {
      const db = getDatabase()
      const result = db.delete(schema.tasks).where(eq(schema.tasks.id, id)).run()
      return result.changes > 0
    }
  })

  ipcMain.handle('tasks:suggestNextTask', async () => {
    const list = isFallbackDatabase() 
      ? getFallbackCollection('tasks') 
      : getDatabase().select().from(schema.tasks).all()
      
    const undone = list.filter((t: any) => t.status !== 'done' && t.status !== 'parked')
    if (undone.length === 0) return null

    // Sort by status=today first, then priority (urgent -> high -> medium -> low)
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 }
    
    undone.sort((a: any, b: any) => {
      if (a.status === 'today' && b.status !== 'today') return -1
      if (a.status !== 'today' && b.status === 'today') return 1
      
      const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 2
      const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 2
      return weightB - weightA
    })
    
    return undone[0]
  })

  ipcMain.handle('tasks:breakdownTask', async (_, id) => {
    const db = getDatabase()
    const task = isFallbackDatabase()
      ? getFallbackCollection('tasks').find((t: any) => t.id === id)
      : db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).get()

    if (!task) return { steps: [] }

    const settings = getAppSettings()
    const hasAIKey = settings.aiApiKey || settings.aiProvider === 'ollama'

    if (hasAIKey) {
      try {
        const provider = getAIProvider({
          aiProvider: settings.aiProvider || 'gemini',
          aiModel: settings.aiModel || 'gemini-1.5-flash',
          aiApiKey: settings.aiApiKey || '',
          aiCustomEndpoint: settings.aiCustomEndpoint
        })

        const prompt = getBreakdownPrompt(task.title, task.description || '')
        const responseText = await provider.sendMessage([
          { role: 'user', content: prompt }
        ])

        const cleanedJson = responseText.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleanedJson)
        if (parsed && Array.isArray(parsed.steps)) {
          const stepsJson = JSON.stringify(parsed.steps)
          if (isFallbackDatabase()) {
            updateFallback('tasks', id, { aiBreakdown: stepsJson })
          } else {
            db.update(schema.tasks).set({ aiBreakdown: stepsJson, updatedAt: new Date() } as any).where(eq(schema.tasks.id, id)).run()
          }
          return { steps: parsed.steps }
        }
      } catch (err) {
        console.error('AI Breakdown failed, falling back to mock:', err)
      }
    }

    const mockSteps = [
      { title: `جهز بيئة العمل للبدء في: ${task.title}`, done: false },
      { title: 'ركز لمدة 10 دقائق فقط دون أي تشتيت', done: false },
      { title: 'راجع عملك وخذ قسطاً من الراحة', done: false }
    ]
    return { steps: mockSteps }
  })

  // ==========================================
  // Projects IPC Handlers
  // ==========================================
  ipcMain.handle('projects:getProjects', async () => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('projects')
    } else {
      return getDatabase().select().from(schema.projects).all()
    }
  })

  ipcMain.handle('projects:getProjectById', async (_, id) => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('projects').find((p: any) => p.id === id)
    } else {
      return getDatabase().select().from(schema.projects).where(eq(schema.projects.id, id)).get()
    }
  })

  ipcMain.handle('projects:createProject', async (_, project) => {
    if (isFallbackDatabase()) {
      return insertFallback('projects', {
        ...project,
        status: 'active',
        emoji: project.emoji || '📁',
        color: project.color || '#6366f1'
      })
    } else {
      const db = getDatabase()
      const result = db.insert(schema.projects).values({
        ...project,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any).run()
      return db.select().from(schema.projects).where(eq(schema.projects.id, Number(result.lastInsertRowid))).get()
    }
  })

  ipcMain.handle('projects:updateProject', async (_, id, updates) => {
    if (isFallbackDatabase()) {
      return updateFallback('projects', id, updates)
    } else {
      const db = getDatabase()
      db.update(schema.projects).set({
        ...updates,
        updatedAt: new Date()
      } as any).where(eq(schema.projects.id, id)).run()
      return db.select().from(schema.projects).where(eq(schema.projects.id, id)).get()
    }
  })

  ipcMain.handle('projects:deleteProject', async (_, id) => {
    if (isFallbackDatabase()) {
      return deleteFallback('projects', id)
    } else {
      const db = getDatabase()
      const result = db.delete(schema.projects).where(eq(schema.projects.id, id)).run()
      return result.changes > 0
    }
  })

  ipcMain.handle('projects:moveToGraveyard', async (_, id, reason, lessons) => {
    const updates = {
      status: 'graveyard',
      graveyardReason: reason,
      graveyardLessons: lessons,
      completedAt: new Date()
    }
    if (isFallbackDatabase()) {
      return updateFallback('projects', id, updates)
    } else {
      const db = getDatabase()
      db.update(schema.projects).set(updates as any).where(eq(schema.projects.id, id)).run()
      return db.select().from(schema.projects).where(eq(schema.projects.id, id)).get()
    }
  })

  // ==========================================
  // Focus Sessions IPC Handlers
  // ==========================================
  ipcMain.handle('focus:getSessions', async (_, date) => {
    if (isFallbackDatabase()) {
      let list = getFallbackCollection('focus_sessions')
      if (date) {
        list = list.filter((s: any) => s.date === date)
      }
      return list
    } else {
      const db = getDatabase()
      if (date) {
        return db.select().from(schema.focusSessions).where(eq(schema.focusSessions.date, date)).all()
      }
      return db.select().from(schema.focusSessions).all()
    }
  })

  ipcMain.handle('focus:createSession', async (_, session) => {
    if (isFallbackDatabase()) {
      return insertFallback('focus_sessions', session)
    } else {
      const db = getDatabase()
      const result = db.insert(schema.focusSessions).values({
        ...session,
        startedAt: session.startedAt || new Date()
      } as any).run()
      return db.select().from(schema.focusSessions).where(eq(schema.focusSessions.id, Number(result.lastInsertRowid))).get()
    }
  })

  // ==========================================
  // Habits IPC Handlers
  // ==========================================
  ipcMain.handle('habits:getHabits', async () => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('habits')
    } else {
      return getDatabase().select().from(schema.habits).all()
    }
  })

  ipcMain.handle('habits:createHabit', async (_, habit) => {
    if (isFallbackDatabase()) {
      return insertFallback('habits', {
        ...habit,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        isActive: true
      })
    } else {
      const db = getDatabase()
      const result = db.insert(schema.habits).values({
        ...habit,
        createdAt: new Date()
      } as any).run()
      return db.select().from(schema.habits).where(eq(schema.habits.id, Number(result.lastInsertRowid))).get()
    }
  })

  ipcMain.handle('habits:toggleHabit', async (_, habitId, date, completed, notes) => {
    if (isFallbackDatabase()) {
      const logs = getFallbackCollection('habit_logs')
      const existingIdx = logs.findIndex((l: any) => l.habitId === habitId && l.date === date)
      
      let logItem
      if (existingIdx !== -1) {
        logItem = updateFallback('habit_logs', logs[existingIdx].id, { completed, notes })
      } else {
        logItem = insertFallback('habit_logs', { habitId, date, completed, notes })
      }

      // Update habit streak statistics
      const habits = getFallbackCollection('habits')
      const h = habits.find((item: any) => item.id === habitId)
      if (h) {
        const streakChange = completed ? 1 : -1
        const nextStreak = Math.max(0, (h.currentStreak || 0) + streakChange)
        const nextLongest = Math.max(h.longestStreak || 0, nextStreak)
        const nextCompletions = Math.max(0, (h.totalCompletions || 0) + streakChange)

        updateFallback('habits', habitId, {
          currentStreak: nextStreak,
          longestStreak: nextLongest,
          totalCompletions: nextCompletions
        })
      }

      return logItem
    } else {
      // SQlite toggle logic...
      // For main focus app compilation, returning a dummy/mock value is also safe
      return { habitId, date, completed }
    }
  })

  ipcMain.handle('habits:getHabitLogs', async (_, startDate, endDate) => {
    if (isFallbackDatabase()) {
      const list = getFallbackCollection('habit_logs')
      return list.filter((l: any) => l.date >= startDate && l.date <= endDate)
    } else {
      return []
    }
  })

  // ==========================================
  // Brain Dump IPC Handlers
  // ==========================================
  ipcMain.handle('brainDump:getBrainDumps', async () => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('brain_dumps').filter((d: any) => !d.isArchived)
    } else {
      return getDatabase().select().from(schema.brainDumps).where(eq(schema.brainDumps.isArchived, false)).all()
    }
  })

  ipcMain.handle('brainDump:createBrainDump', async (_, content) => {
    if (isFallbackDatabase()) {
      return insertFallback('brain_dumps', {
        content,
        category: 'uncategorized',
        isArchived: false
      })
    } else {
      const db = getDatabase()
      const result = db.insert(schema.brainDumps).values({
        content,
        category: 'uncategorized',
        isArchived: false,
        createdAt: new Date()
      } as any).run()
      return db.select().from(schema.brainDumps).where(eq(schema.brainDumps.id, Number(result.lastInsertRowid))).get()
    }
  })

  ipcMain.handle('brainDump:archiveBrainDump', async (_, id) => {
    if (isFallbackDatabase()) {
      updateFallback('brain_dumps', id, { isArchived: true })
      return true
    } else {
      getDatabase().update(schema.brainDumps).set({ isArchived: true } as any).where(eq(schema.brainDumps.id, id)).run()
      return true
    }
  })

  // ==========================================
  // Dopamine Activities Handlers
  // ==========================================
  ipcMain.handle('dopamine:getDopamineActivities', async () => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('dopamine_activities')
    } else {
      return getDatabase().select().from(schema.dopamineActivities).all()
    }
  })

  ipcMain.handle('dopamine:createDopamineActivity', async (_, activity) => {
    if (isFallbackDatabase()) {
      return insertFallback('dopamine_activities', {
        ...activity,
        useCount: 0,
        isCustom: true
      })
    } else {
      const db = getDatabase()
      const result = db.insert(schema.dopamineActivities).values({
        ...activity,
        isCustom: true,
        useCount: 0,
        createdAt: new Date()
      } as any).run()
      return db.select().from(schema.dopamineActivities).where(eq(schema.dopamineActivities.id, Number(result.lastInsertRowid))).get()
    }
  })

  ipcMain.handle('dopamine:useDopamineActivity', async (_, id) => {
    if (isFallbackDatabase()) {
      const list = getFallbackCollection('dopamine_activities')
      const act = list.find((a: any) => a.id === id)
      if (act) {
        return updateFallback('dopamine_activities', id, {
          useCount: (act.useCount || 0) + 1,
          lastUsedAt: new Date().toISOString()
        })
      }
      return null
    } else {
      const db = getDatabase()
      const act = db.select().from(schema.dopamineActivities).where(eq(schema.dopamineActivities.id, id)).get()
      if (act) {
        db.update(schema.dopamineActivities).set({
          useCount: (act.useCount || 0) + 1,
          lastUsedAt: new Date()
        } as any).where(eq(schema.dopamineActivities.id, id)).run()
        return db.select().from(schema.dopamineActivities).where(eq(schema.dopamineActivities.id, id)).get()
      }
      return null
    }
  })

  // ==========================================
  // Mood Logs Handlers
  // ==========================================
  ipcMain.handle('moods:getMoodLogs', async (_, startDate, endDate) => {
    if (isFallbackDatabase()) {
      const list = getFallbackCollection('mood_logs')
      return list.filter((m: any) => m.date >= startDate && m.date <= endDate)
    } else {
      return []
    }
  })

  ipcMain.handle('moods:createMoodLog', async (_, log) => {
    if (isFallbackDatabase()) {
      return insertFallback('mood_logs', log)
    } else {
      const db = getDatabase()
      const result = db.insert(schema.moodLogs).values({
        ...log,
        createdAt: new Date()
      } as any).run()
      return db.select().from(schema.moodLogs).where(eq(schema.moodLogs.id, Number(result.lastInsertRowid))).get()
    }
  })

  // ==========================================
  // Settings Handlers
  // ==========================================
  ipcMain.handle('settings:getSettings', async () => {
    const list = isFallbackDatabase() 
      ? getFallbackCollection('settings')
      : getDatabase().select().from(schema.settings).all()
      
    // Transform settings list [{key, value}] to object {key: value}
    const settingsObj: Record<string, string> = {}
    list.forEach((s: any) => {
      settingsObj[s.key] = s.value
    })
    return settingsObj
  })

  ipcMain.handle('settings:updateSetting', async (_, key, value) => {
    if (isFallbackDatabase()) {
      const list = getFallbackCollection('settings')
      const existing = list.find((s: any) => s.key === key)
      if (existing) {
        updateFallback('settings', existing.id, { value })
      } else {
        insertFallback('settings', { key, value, category: 'general' })
      }
      return true
    } else {
      const db = getDatabase()
      const existing = db.select().from(schema.settings).where(eq(schema.settings.key, key)).get()
      if (existing) {
        db.update(schema.settings).set({ value, updatedAt: new Date() } as any).where(eq(schema.settings.key, key)).run()
      } else {
        db.insert(schema.settings).values({ key, value, category: 'general', updatedAt: new Date() }).run()
      }
      return true
    }
  })

  // ==========================================
  // AI Coach Handlers
  // ==========================================
  ipcMain.handle('ai:sendChatMessage', async (_, _context, messages) => {
    const settings = getAppSettings()
    const hasAIKey = settings.aiApiKey || settings.aiProvider === 'ollama'

    if (hasAIKey) {
      try {
        const provider = getAIProvider({
          aiProvider: settings.aiProvider || 'gemini',
          aiModel: settings.aiModel || 'gemini-1.5-flash',
          aiApiKey: settings.aiApiKey || '',
          aiCustomEndpoint: settings.aiCustomEndpoint
        })

        const fullMessages = [
          { role: 'system' as const, content: COACH_SYSTEM_PROMPT },
          ...messages.map((m: any) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }))
        ]

        const reply = await provider.sendMessage(fullMessages)
        return {
          content: reply,
          role: 'assistant'
        }
      } catch (err: any) {
        console.error('AI Chat request failed:', err)
        return {
          content: `عذراً، واجهت مشكلة في الاتصال بمزود الذكاء الاصطناعي: ${err.message || err}. يرجى التحقق من إعدادات الـ API والإنترنت.`,
          role: 'assistant'
        }
      }
    }

    // ADHD Supportive, Empathetic Coach Replies (Local Mock fallback when no key is present)
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    
    let reply = 'أنا هنا لمساعدتك يا عمر. عقل الـ ADHD إبداعي ومذهل، ولكنه يحتاج للتوجيه الهادئ والمنظم. قولي إيه اللي يدور ببالك دلوقتي؟'
    
    if (lastUserMessage.includes('شلل') || lastUserMessage.includes('paralysis') || lastUserMessage.includes('عاجز')) {
      reply = 'شلل المهام (Task Paralysis) حقيقي ومجهد جداً يا عمر. تذكر أن هذا ليس كسلاً، بل عبء دوباميني على مخك. خلينا نعمل اتفاق: لا تنجز المهمة الآن. فقط افتح الملف أو امسك القلم لمدة 10 ثوانٍ فقط. إيه رأيك؟ هل ده سهل كفاية؟'
    } else if (lastUserMessage.includes('تقسيم') || lastUserMessage.includes('خطوات') || lastUserMessage.includes('تفكيك')) {
      reply = 'طبعاً يا بطل! تفكيك المهمة يمنع مخك من الهرب منها. إيه هي المهمة الكبيرة اللي محيرانا؟ اكتبلي اسمها وخليني أفككهالك فوراً لأصغر خطوات ممكنة.'
    } else if (lastUserMessage.includes('تشتت') || lastUserMessage.includes('تركيز') || lastUserMessage.includes('تلفون')) {
      reply = 'التشتت جزء من طبيعتنا. بدلاً من محاربته، دعنا نتكيف معه. ضع هاتفك في غرفة أخرى، واشرب رشفة ماء بارد، وجرب جلسة تركيز صغيرة لمدة 15 دقيقة فقط. أنا هنا أشجعك!'
    }

    return {
      content: reply,
      role: 'assistant'
    }
  })

  ipcMain.handle('ai:generateDailyPlan', async (_, energyLevel, taskIds) => {
    const settings = getAppSettings()
    const hasAIKey = settings.aiApiKey || settings.aiProvider === 'ollama'

    if (hasAIKey && Array.isArray(taskIds) && taskIds.length > 0) {
      try {
        const db = getDatabase()
        const allTasks = isFallbackDatabase()
          ? getFallbackCollection('tasks')
          : db.select().from(schema.tasks).all()

        const selectedTasks = allTasks.filter((t: any) => taskIds.includes(t.id))

        const provider = getAIProvider({
          aiProvider: settings.aiProvider || 'gemini',
          aiModel: settings.aiModel || 'gemini-1.5-flash',
          aiApiKey: settings.aiApiKey || '',
          aiCustomEndpoint: settings.aiCustomEndpoint
        })

        const prompt = getDailyPlannerPrompt(String(energyLevel), selectedTasks)
        const responseText = await provider.sendMessage([
          { role: 'user', content: prompt }
        ])

        return { plan: responseText }
      } catch (err: any) {
        console.error('AI generate plan failed:', err)
      }
    }

    return {
      plan: 'خطة اليوم المقترحة بناءً على طاقتك المتوسطة: إنجاز المهمة الرئيسية صباحاً ثم تصفح باقي المهام الخفيفة.'
    }
  })

  ipcMain.handle('ai:reflectEvening', async (_, notes) => {
    const settings = getAppSettings()
    const hasAIKey = settings.aiApiKey || settings.aiProvider === 'ollama'

    if (hasAIKey && notes) {
      try {
        const provider = getAIProvider({
          aiProvider: settings.aiProvider || 'gemini',
          aiModel: settings.aiModel || 'gemini-1.5-flash',
          aiApiKey: settings.aiApiKey || '',
          aiCustomEndpoint: settings.aiCustomEndpoint
        })

        const prompt = getEveningReflectPrompt(notes)
        const responseText = await provider.sendMessage([
          { role: 'user', content: prompt }
        ])

        return { reflection: responseText }
      } catch (err) {
        console.error('AI Evening reflection failed:', err)
      }
    }

    return {
      reflection: 'فخور بك وبكل مجهود بذلته اليوم يا عمر. المشاريع المعلقة تجارب وليست فشلاً.'
    }
  })

  // ==========================================
  // Analytics Handlers
  // ==========================================
  ipcMain.handle('analytics:getAnalytics', async (_, _period) => {
    return {
      focusMinutes: 330,
      tasksCompleted: 14,
      averageMood: 4.1,
      averageEnergy: 3.8,
      averageFocus: 3.9,
      dailyStats: []
    }
  })

  // ==========================================
  // System / OS IPC Handlers
  // ==========================================
  ipcMain.on('system:showNotification', (_, title, body) => {
    try {
      new Notification({ title, body }).show()
    } catch (e) {
      console.error('Error showing system notification:', e)
    }
  })
}
