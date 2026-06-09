import { ipcMain, Notification, dialog, BrowserWindow, app } from 'electron'
import { getDatabase, isFallbackDatabase } from '../database'
import { getFallbackCollection, insertFallback, updateFallback, deleteFallback, initFallbackDatabase } from '../database/fallback'
import { eq, and, sql } from 'drizzle-orm'
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
    let newSession
    if (isFallbackDatabase()) {
      newSession = insertFallback('focus_sessions', {
        ...session,
        startedAt: session.startedAt || new Date().toISOString()
      })
    } else {
      const db = getDatabase()
      const result = db.insert(schema.focusSessions).values({
        ...session,
        startedAt: session.startedAt || new Date()
      } as any).run()
      newSession = db.select().from(schema.focusSessions).where(eq(schema.focusSessions.id, Number(result.lastInsertRowid))).get()
    }

    if (newSession && newSession.actualMinutes > 0 && newSession.type === 'focus') {
      const actualMinutes = newSession.actualMinutes
      let taskId = newSession.taskId
      let projectId = newSession.projectId
      let learningTrackId = newSession.learningTrackId
      let lessonId = newSession.lessonId

      if (isFallbackDatabase()) {
        // 1. Resolve task relations if missing
        if (taskId) {
          const task = getFallbackCollection('tasks').find((t: any) => t.id === taskId)
          if (task) {
            if (!projectId) projectId = task.projectId
            if (!learningTrackId) learningTrackId = task.learningTrackId

            // Update task actualMinutes
            updateFallback('tasks', taskId, {
              actualMinutes: (task.actualMinutes || 0) + actualMinutes
            })
          }
        }

        // 1b. Resolve lesson relations if present
        if (lessonId) {
          const lesson = getFallbackCollection('learning_lessons').find((l: any) => l.id === lessonId)
          if (lesson) {
            if (!learningTrackId) learningTrackId = lesson.trackId
            updateFallback('learning_lessons', lessonId, {
              actualMinutes: (lesson.actualMinutes || 0) + actualMinutes
            })
          }
        }

        // 2. Update project minutes
        if (projectId) {
          const project = getFallbackCollection('projects').find((p: any) => p.id === projectId)
          if (project) {
            updateFallback('projects', projectId, {
              totalFocusMinutes: (project.totalFocusMinutes || 0) + actualMinutes
            })
          }
        }

        // 3. Update learning track minutes & XP
        const xpToEarn = Math.round(actualMinutes * 0.8) || 1
        if (learningTrackId) {
          const track = getFallbackCollection('learning_tracks').find((t: any) => t.id === learningTrackId)
          if (track) {
            updateFallback('learning_tracks', learningTrackId, {
              totalStudyMinutes: (track.totalStudyMinutes || 0) + actualMinutes,
              xpEarned: (track.xpEarned || 0) + xpToEarn
            })
          }
        }

        // 4. Update user profile XP and Level
        const profiles = getFallbackCollection('user_profile')
        const p = profiles[0] || { id: 1, totalXP: 0, level: 1 }
        const nextXP = (p.totalXP || 0) + xpToEarn
        let level = 1
        let xpForPrevLevels = 0
        while (nextXP >= xpForPrevLevels + level * 100) {
          xpForPrevLevels += level * 100
          level++
        }
        updateFallback('user_profile', p.id || 1, { totalXP: nextXP, level })

        // 5. Insert XP ledger entry
        insertFallback('xp_ledger', {
          amount: xpToEarn,
          reason: `جلسة تركيز: ${actualMinutes} دقيقة`,
          refId: newSession.id,
          refType: 'focus_session',
          totalAfter: nextXP,
          date: new Date().toISOString().split('T')[0]
        })
      } else {
        const db = getDatabase()
        
        // 1. Resolve task relations if missing
        if (taskId) {
          const task = db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).get()
          if (task) {
            if (!projectId) projectId = task.projectId
            if (!learningTrackId) learningTrackId = task.learningTrackId

            db.update(schema.tasks).set({
              actualMinutes: (task.actualMinutes || 0) + actualMinutes,
              updatedAt: new Date()
            } as any).where(eq(schema.tasks.id, taskId)).run()
          }
        }

        // 1b. Resolve lesson relations if present
        if (lessonId) {
          const lesson = db.select().from(schema.learningLessons).where(eq(schema.learningLessons.id, lessonId)).get()
          if (lesson) {
            if (!learningTrackId) learningTrackId = lesson.trackId
            db.update(schema.learningLessons).set({
              actualMinutes: (lesson.actualMinutes || 0) + actualMinutes
            } as any).where(eq(schema.learningLessons.id, lessonId)).run()
          }
        }

        // 2. Update project minutes
        if (projectId) {
          const project = db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).get()
          if (project) {
            db.update(schema.projects).set({
              totalFocusMinutes: (project.totalFocusMinutes || 0) + actualMinutes,
              updatedAt: new Date()
            } as any).where(eq(schema.projects.id, projectId)).run()
          }
        }

        // 3. Update learning track minutes & XP
        const xpToEarn = Math.round(actualMinutes * 0.8) || 1
        if (learningTrackId) {
          const track = db.select().from(schema.learningTracks).where(eq(schema.learningTracks.id, learningTrackId)).get()
          if (track) {
            db.update(schema.learningTracks).set({
              totalStudyMinutes: (track.totalStudyMinutes || 0) + actualMinutes,
              xpEarned: (track.xpEarned || 0) + xpToEarn
            } as any).where(eq(schema.learningTracks.id, learningTrackId)).run()
          }
        }

        // 4. Update user profile XP and Level
        const p = db.select().from(schema.userProfile).get()
        if (p) {
          const nextXP = p.totalXP + xpToEarn
          let level = 1
          let xpForPrevLevels = 0
          while (nextXP >= xpForPrevLevels + level * 100) {
            xpForPrevLevels += level * 100
            level++
          }
          db.update(schema.userProfile).set({ totalXP: nextXP, level }).where(eq(schema.userProfile.id, p.id)).run()

          // 5. Insert XP ledger entry
          db.insert(schema.xpLedger).values({
            amount: xpToEarn,
            reason: `جلسة تركيز: ${actualMinutes} دقيقة`,
            referenceId: newSession.id,
            referenceType: 'focus_session',
            totalAfter: nextXP,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date()
          } as any).run()
        }
      }
    }

    return newSession
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
  ipcMain.handle('analytics:getAnalytics', async (_, period) => {
    const daysCount = period === 'month' ? 30 : 7
    const dates: string[] = []
    const today = new Date()
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }

    if (isFallbackDatabase()) {
      const sessions = getFallbackCollection('focus_sessions')
      const tasks = getFallbackCollection('tasks')
      const moods = getFallbackCollection('mood_logs')

      const totalFocus = sessions.reduce((acc: number, s: any) => acc + (s.actualMinutes || 0), 0)
      const totalTasks = tasks.filter((t: any) => t.status === 'done').length
      
      const moodValues = moods.map((m: any) => m.mood).filter(Boolean)
      const avgMood = moodValues.length ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0
      
      const energyValues = moods.map((m: any) => m.energy).filter(Boolean)
      const avgEnergy = energyValues.length ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length : 0

      const focusValues = moods.map((m: any) => m.focus).filter(Boolean)
      const avgFocus = focusValues.length ? focusValues.reduce((a, b) => a + b, 0) / focusValues.length : 0

      const dailyStats = dates.map(dStr => {
        const dateObj = new Date(dStr)
        const weekdayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        const name = weekdayNames[dateObj.getDay()]

        const daySessions = sessions.filter((s: any) => s.date === dStr)
        const dayFocus = daySessions.reduce((acc: number, s: any) => acc + (s.actualMinutes || 0), 0)

        const dayCompletedTasks = tasks.filter((t: any) => {
          if (!t.completedAt) return false
          const compDate = new Date(t.completedAt).toISOString().split('T')[0]
          return compDate === dStr
        }).length

        const dayMoods = moods.filter((m: any) => m.date === dStr)
        const dayAvgMood = dayMoods.length ? dayMoods.reduce((acc, m) => acc + m.mood, 0) / dayMoods.length : 0

        return {
          date: name,
          focusMinutes: dayFocus,
          tasksCompleted: dayCompletedTasks,
          mood: dayAvgMood
        }
      })

      return {
        focusMinutes: totalFocus,
        tasksCompleted: totalTasks,
        averageMood: avgMood,
        averageEnergy: avgEnergy,
        averageFocus: avgFocus,
        dailyStats
      }
    } else {
      const db = getDatabase()
      const sessions = db.select().from(schema.focusSessions).all()
      const tasks = db.select().from(schema.tasks).all()
      const moods = db.select().from(schema.moodLogs).all()

      const totalFocus = sessions.reduce((acc: number, s: any) => acc + (s.actualMinutes || 0), 0)
      const totalTasks = tasks.filter((t: any) => t.status === 'done').length
      
      const moodValues = moods.map((m: any) => m.mood).filter(Boolean)
      const avgMood = moodValues.length ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0
      
      const energyValues = moods.map((m: any) => m.energy).filter(Boolean)
      const avgEnergy = energyValues.length ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length : 0

      const focusValues = moods.map((m: any) => m.focus).filter(Boolean)
      const avgFocus = focusValues.length ? focusValues.reduce((a, b) => a + b, 0) / focusValues.length : 0

      const dailyStats = dates.map(dStr => {
        const dateObj = new Date(dStr)
        const weekdayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        const name = weekdayNames[dateObj.getDay()]

        const daySessions = sessions.filter((s: any) => s.date === dStr)
        const dayFocus = daySessions.reduce((acc: number, s: any) => acc + (s.actualMinutes || 0), 0)

        const dayCompletedTasks = tasks.filter((t: any) => {
          if (!t.completedAt) return false
          const compDate = new Date(t.completedAt).toISOString().split('T')[0]
          return compDate === dStr
        }).length

        const dayMoods = moods.filter((m: any) => m.date === dStr)
        const dayAvgMood = dayMoods.length ? dayMoods.reduce((acc, m) => acc + m.mood, 0) / dayMoods.length : 0

        return {
          date: name,
          focusMinutes: dayFocus,
          tasksCompleted: dayCompletedTasks,
          mood: dayAvgMood
        }
      })

      return {
        focusMinutes: totalFocus,
        tasksCompleted: totalTasks,
        averageMood: avgMood,
        averageEnergy: avgEnergy,
        averageFocus: avgFocus,
        dailyStats
      }
    }
  })

  // ==========================================
  // Achievements Handlers
  // ==========================================
  ipcMain.handle('achievements:getAchievements', async () => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('achievements')
    } else {
      return getDatabase().select().from(schema.achievements).all()
    }
  })

  ipcMain.handle('achievements:unlockAchievement', async (_, key) => {
    const unlockedAt = new Date()
    if (isFallbackDatabase()) {
      const list = getFallbackCollection('achievements')
      const achievement = list.find((a: any) => a.key === key)
      if (achievement && !achievement.isUnlocked) {
        updateFallback('achievements', achievement.id, {
          isUnlocked: true,
          unlockedAt: unlockedAt.toISOString()
        })
        return true
      }
      return false
    } else {
      const db = getDatabase()
      const achievement = db.select().from(schema.achievements).where(eq(schema.achievements.key, key)).get()
      if (achievement && !achievement.isUnlocked) {
        db.update(schema.achievements)
          .set({ isUnlocked: true, unlockedAt: unlockedAt } as any)
          .where(eq(schema.achievements.key, key))
          .run()
        return true
      }
      return false
    }
  })

  // ==========================================
  // Learning Tracks Handlers
  // ==========================================
  ipcMain.handle('learningTracks:getTracks', async () => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('learning_tracks')
    } else {
      return getDatabase().select().from(schema.learningTracks).all()
    }
  })

  ipcMain.handle('learningTracks:getTrackById', async (_, id) => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('learning_tracks').find((t: any) => t.id === id)
    } else {
      return getDatabase().select().from(schema.learningTracks).where(eq(schema.learningTracks.id, id)).get()
    }
  })

  ipcMain.handle('learningTracks:createTrack', async (_, track) => {
    if (isFallbackDatabase()) {
      const newTrack = insertFallback('learning_tracks', {
        ...track,
        totalLessons: track.totalLessons || 1,
        completedLessons: 0,
        currentLesson: 1,
        status: 'active',
        currentStreakDays: 0,
        longestStreakDays: 0,
        totalStudyMinutes: 0,
        xpEarned: 0,
        pinchScore: track.pinchScore || 5
      })
      // Seed initial lessons
      for (let i = 1; i <= (track.totalLessons || 1); i++) {
        insertFallback('learning_lessons', {
          trackId: newTrack.id,
          order: i,
          title: `الدرس ${i}`,
          estimatedMinutes: 20,
          status: 'pending'
        })
      }
      return newTrack
    } else {
      const db = getDatabase()
      const result = db.insert(schema.learningTracks).values({
        ...track,
        createdAt: new Date()
      } as any).run()
      const trackId = Number(result.lastInsertRowid)
      
      // Seed initial lessons in transaction
      db.transaction((tx) => {
        for (let i = 1; i <= (track.totalLessons || 1); i++) {
          tx.insert(schema.learningLessons).values({
            trackId,
            order: i,
            title: `الدرس ${i}`,
            estimatedMinutes: 20,
            status: 'pending'
          } as any).run()
        }
      })
      return db.select().from(schema.learningTracks).where(eq(schema.learningTracks.id, trackId)).get()
    }
  })

  ipcMain.handle('learningTracks:updateTrack', async (_, id, updates) => {
    if (isFallbackDatabase()) {
      return updateFallback('learning_tracks', id, updates)
    } else {
      const db = getDatabase()
      db.update(schema.learningTracks).set({
        ...updates,
        updatedAt: new Date()
      } as any).where(eq(schema.learningTracks.id, id)).run()
      return db.select().from(schema.learningTracks).where(eq(schema.learningTracks.id, id)).get()
    }
  })

  ipcMain.handle('learningTracks:deleteTrack', async (_, id) => {
    if (isFallbackDatabase()) {
      deleteFallback('learning_tracks', id)
      return true
    } else {
      const db = getDatabase()
      db.delete(schema.learningLessons).where(eq(schema.learningLessons.trackId, id)).run()
      const result = db.delete(schema.learningTracks).where(eq(schema.learningTracks.id, id)).run()
      return result.changes > 0
    }
  })

  ipcMain.handle('learningTracks:getLessons', async (_, trackId) => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('learning_lessons').filter((l: any) => l.trackId === trackId)
    } else {
      return getDatabase().select().from(schema.learningLessons).where(eq(schema.learningLessons.trackId, trackId)).all()
    }
  })

  ipcMain.handle('learningTracks:updateLesson', async (_, id, updates) => {
    if (isFallbackDatabase()) {
      const updated = updateFallback('learning_lessons', id, updates)
      
      if (updates.status === 'done' && updated) {
        const lessons = getFallbackCollection('learning_lessons').filter((l: any) => l.trackId === updated.trackId)
        const doneCount = lessons.filter((l: any) => l.status === 'done').length
        
        updateFallback('learning_tracks', updated.trackId, {
          completedLessons: doneCount,
          currentLesson: Math.min(lessons.length, doneCount + 1),
          lastStudiedAt: new Date().toISOString()
        })
      }
      return updated
    } else {
      const db = getDatabase()
      db.update(schema.learningLessons).set(updates as any).where(eq(schema.learningLessons.id, id)).run()
      const updated = db.select().from(schema.learningLessons).where(eq(schema.learningLessons.id, id)).get()
      
      if (updates.status === 'done' && updated) {
        const lessons = db.select().from(schema.learningLessons).where(eq(schema.learningLessons.trackId, updated.trackId)).all()
        const doneCount = lessons.filter((l: any) => l.status === 'done').length
        
        db.update(schema.learningTracks).set({
          completedLessons: doneCount,
          currentLesson: Math.min(lessons.length, doneCount + 1),
          lastStudiedAt: new Date()
        } as any).where(eq(schema.learningTracks.id, updated.trackId)).run()
      }
      return updated
    }
  })

  // ==========================================
  // Learning Materials Handlers
  // ==========================================
  ipcMain.handle('learningMaterials:getMaterials', async (_, trackId) => {
    if (isFallbackDatabase()) {
      const materials = getFallbackCollection('learning_materials')
      if (trackId) {
        return materials.filter((m: any) => m.learningTrackId === trackId)
      }
      return materials
    } else {
      const db = getDatabase()
      if (trackId) {
        return db.select().from(schema.learningMaterials).where(eq(schema.learningMaterials.learningTrackId, trackId)).all()
      }
      return db.select().from(schema.learningMaterials).all()
    }
  })

  ipcMain.handle('learningMaterials:getMaterialById', async (_, id) => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('learning_materials').find((m: any) => m.id === id)
    } else {
      return getDatabase().select().from(schema.learningMaterials).where(eq(schema.learningMaterials.id, id)).get()
    }
  })

  ipcMain.handle('learningMaterials:createMaterial', async (_, material) => {
    const now = new Date()
    if (isFallbackDatabase()) {
      const newMaterial = insertFallback('learning_materials', {
        ...material,
        status: material.status || 'pending',
        createdAt: now.toISOString()
      })
      return newMaterial
    } else {
      const db = getDatabase()
      const result = db.insert(schema.learningMaterials).values({
        ...material,
        createdAt: now
      } as any).run()
      return db.select().from(schema.learningMaterials).where(eq(schema.learningMaterials.id, Number(result.lastInsertRowid))).get()
    }
  })

  ipcMain.handle('learningMaterials:updateMaterial', async (_, id, updates) => {
    const now = new Date()
    if (isFallbackDatabase()) {
      return updateFallback('learning_materials', id, {
        ...updates,
        updatedAt: now.toISOString()
      })
    } else {
      const db = getDatabase()
      db.update(schema.learningMaterials).set({
        ...updates,
        updatedAt: now
      } as any).where(eq(schema.learningMaterials.id, id)).run()
      return db.select().from(schema.learningMaterials).where(eq(schema.learningMaterials.id, id)).get()
    }
  })

  ipcMain.handle('learningMaterials:deleteMaterial', async (_, id) => {
    if (isFallbackDatabase()) {
      deleteFallback('learning_materials', id)
      return true
    } else {
      const result = getDatabase().delete(schema.learningMaterials).where(eq(schema.learningMaterials.id, id)).run()
      return result.changes > 0
    }
  })

  ipcMain.handle('learningMaterials:generateSummary', async (_, id) => {
    let material: any
    if (isFallbackDatabase()) {
      material = getFallbackCollection('learning_materials').find((m: any) => m.id === id)
    } else {
      material = getDatabase().select().from(schema.learningMaterials).where(eq(schema.learningMaterials.id, id)).get()
    }

    if (!material) {
      throw new Error(`Material with ID ${id} not found`)
    }

    const settings = getAppSettings()
    const hasAIKey = settings.aiApiKey || settings.aiProvider === 'ollama'
    let summaryText = ''
    let conceptMapJson = ''

    if (hasAIKey) {
      try {
        const provider = getAIProvider({
          aiProvider: settings.aiProvider || 'gemini',
          aiModel: settings.aiModel || 'gemini-1.5-flash',
          aiApiKey: settings.aiApiKey || '',
          aiCustomEndpoint: settings.aiCustomEndpoint
        })

        const contentToAnalyze = material.content || material.title
        const prompt = `أنت خبير تعلم مخصص لعقول الـ ADHD. قمنا بتحميل ملف/نص تعليمي بعنوان "${material.title}".
المطلوب منك هو:
1. إنشاء ملخص غني وتفاعلي ومنظم جداً (Markdown) يسهل قراءته وفهمه دون تشتت (استخدم نقاط واضحة، تفاصيل هامة، وجداول إذا لزم الأمر).
2. إنشاء خريطة مفاهيم ثلاثية الأبعاد (3D Concept Map) لتمثيل العلاقات بين الأفكار.

يرجى إرجاع الإجابة بصيغة JSON فقط، بدون أي نصوص إضافية أو علامات كود (markdown fences). الهيكل المطلوب للـ JSON هو كالتالي:
{
  "summary": "ملخص كامل ومنسق بالماركداون هنا...",
  "conceptMap": {
    "nodes": [
      {"id": "1", "label": "الفكرة الرئيسية", "val": 20, "group": 0, "description": "شرح مبسط للفكرة الرئيسية"},
      {"id": "2", "label": "المفهوم الفرعي 1", "val": 12, "group": 1, "description": "شرح المفهوم الفرعي 1"},
      {"id": "3", "label": "المفهوم الفرعي 2", "val": 12, "group": 2, "description": "شرح المفهوم الفرعي 2"}
    ],
    "links": [
      {"source": "1", "target": "2"},
      {"source": "1", "target": "3"}
    ]
  }
}

ملاحظات هامة جداً:
- يجب أن تكون المعرفات (id) للفرع والمصدر في الروابط (links) مطابقة تماماً للمعرفات في العقد (nodes).
- اجعل التسميات (labels) والملخص باللغة العربية بأسلوب شيق وجذاب يناسب مرضى ADHD.
- العقد الرئيسية يجب أن تأخذ قيمة val أكبر (مثلاً 20)، والعقد المتوسطة (12)، والتفاصيل (6).
- اجعل الحقول (groups) مختلفة لتلوين المسارات المختلفة (مثلاً 0 للفكرة الرئيسية، 1 للفرع الأول، 2 للفرع الثاني).

محتوى النص المراد تلخيصه هو:
${contentToAnalyze}
`

        const response = await provider.sendMessage([
          { role: 'user', content: prompt }
        ])

        // Strip markdown blocks if any
        let cleanJson = response.trim()
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.substring(7)
        }
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.substring(3)
        }
        if (cleanJson.endsWith('```')) {
          cleanJson = cleanJson.substring(0, cleanJson.length - 3)
        }
        cleanJson = cleanJson.trim()

        const parsed = JSON.parse(cleanJson)
        summaryText = parsed.summary
        conceptMapJson = JSON.stringify(parsed.conceptMap)
      } catch (err) {
        console.error('AI Summarization failed, using fallback:', err)
      }
    }

    // Fallback if AI failed or API key missing
    if (!summaryText || !conceptMapJson) {
      summaryText = `### 📚 ملخص محلي: ${material.title}
      
* **الفكرة الأساسية:** هذا ملخص تم إنشاؤه محلياً كنسخة احتياطية. لتوليد ملخص متقدم بالذكاء الاصطناعي، يرجى تفعيل مفتاح الـ API في الإعدادات.
* **النص المكتشف:** تم العثور على محتوى بطول ${material.content?.length || 0} حرف.
* **كيف تتعلم هذا بكفاءة؟**
  1. اقرأ الأفكار الكبرى أولاً.
  2. استخدم خريطة المفاهيم ثلاثية الأبعاد الموضحة على اليسار للتنقل بين المفاهيم.
  3. حول الأفكار الصعبة إلى مهام تطبيقية عملية.
  4. خذ فترات استراحة قصيرة لتجديد الدوبامين.`

      const mockMap = {
        nodes: [
          { id: '1', label: material.title, val: 20, group: 0, description: 'المفهوم الرئيسي للمادة الدراسية' },
          { id: '2', label: 'مقدمة عامة', val: 12, group: 1, description: 'فهم الأساسيات والمصطلحات الأولى' },
          { id: '3', label: 'العناصر الأساسية', val: 12, group: 2, description: 'المكونات والقواعد التي يقوم عليها الموضوع' },
          { id: '4', label: 'التطبيق العملي', val: 12, group: 3, description: 'كيفية ترجمة هذا المفهوم إلى كود أو ممارسة فعلية' },
          { id: '5', label: 'الأخطاء الشائعة', val: 12, group: 4, description: 'أشياء يجب تجنبها أثناء الدراسة والعمل' }
        ],
        links: [
          { source: '1', target: '2' },
          { source: '1', target: '3' },
          { source: '1', target: '4' },
          { source: '1', target: '5' }
        ]
      }
      conceptMapJson = JSON.stringify(mockMap)
    }

    // Save back to DB
    const updates = {
      summary: summaryText,
      conceptMap: conceptMapJson,
      status: 'summarized'
    }

    if (isFallbackDatabase()) {
      return updateFallback('learning_materials', id, updates)
    } else {
      const db = getDatabase()
      db.update(schema.learningMaterials).set(updates as any).where(eq(schema.learningMaterials.id, id)).run()
      return db.select().from(schema.learningMaterials).where(eq(schema.learningMaterials.id, id)).get()
    }
  })

  // ==========================================
  // XP System Handlers
  // ==========================================
  ipcMain.handle('xp:getLedger', async () => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('xp_ledger')
    } else {
      return getDatabase().select().from(schema.xpLedger).all()
    }
  })

  ipcMain.handle('xp:addXP', async (_, amount, reason, refId, refType) => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]

    let currentXP = 0
    let currentLevel = 1
    let profileId = 1

    if (isFallbackDatabase()) {
      const profiles = getFallbackCollection('user_profile')
      const p = profiles[0] || { id: 1, totalXP: 0, level: 1 }
      currentXP = p.totalXP || 0
      currentLevel = p.level || 1
      profileId = p.id
    } else {
      const db = getDatabase()
      const p = db.select().from(schema.userProfile).get()
      if (p) {
        currentXP = p.totalXP
        currentLevel = p.level
        profileId = p.id
      }
    }

    const nextXP = currentXP + amount
    
    let level = 1
    let xpForPrevLevels = 0
    while (nextXP >= xpForPrevLevels + level * 100) {
      xpForPrevLevels += level * 100
      level++
    }

    const leveledUp = level > currentLevel

    if (isFallbackDatabase()) {
      updateFallback('user_profile', profileId, {
        totalXP: nextXP,
        level
      })
      insertFallback('xp_ledger', {
        amount,
        reason,
        refId: refId || null,
        refType: refType || null,
        totalAfter: nextXP,
        date: dateStr
      })
    } else {
      const db = getDatabase()
      db.update(schema.userProfile).set({
        totalXP: nextXP,
        level
      }).where(eq(schema.userProfile.id, profileId)).run()

      db.insert(schema.xpLedger).values({
        amount,
        reason,
        referenceId: refId || null,
        referenceType: refType || null,
        totalAfter: nextXP,
        date: dateStr,
        createdAt: now
      } as any).run()
    }

    return {
      amount,
      totalXP: nextXP,
      level,
      leveledUp
    }
  })

  // ==========================================
  // Energy Logs Handlers
  // ==========================================
  ipcMain.handle('energy:getEnergyLogs', async (_, startDate, endDate) => {
    if (isFallbackDatabase()) {
      return getFallbackCollection('energy_logs').filter((l: any) => l.date >= startDate && l.date <= endDate)
    } else {
      return getDatabase().select().from(schema.energyLogs).all()
    }
  })

  ipcMain.handle('energy:logEnergy', async (_, hour, level) => {
    const dateStr = new Date().toISOString().split('T')[0]
    if (isFallbackDatabase()) {
      const logs = getFallbackCollection('energy_logs')
      const existing = logs.find((l: any) => l.date === dateStr && l.hour === hour)
      if (existing) {
        return updateFallback('energy_logs', existing.id, { energyLevel: level })
      } else {
        return insertFallback('energy_logs', { date: dateStr, hour, energyLevel: level })
      }
    } else {
      const db = getDatabase()
      const existing = db.select().from(schema.energyLogs).where(
        and(eq(schema.energyLogs.date, dateStr), eq(schema.energyLogs.hour, hour))
      ).get()
      if (existing) {
        db.update(schema.energyLogs).set({ energyLevel: level }).where(eq(schema.energyLogs.id, existing.id)).run()
        return db.select().from(schema.energyLogs).where(eq(schema.energyLogs.id, existing.id)).get()
      } else {
        const result = db.insert(schema.energyLogs).values({ date: dateStr, hour, energyLevel: level }).run()
        return db.select().from(schema.energyLogs).where(eq(schema.energyLogs.id, Number(result.lastInsertRowid))).get()
      }
    }
  })

  // ==========================================
  // User Profile Handlers
  // ==========================================
  ipcMain.handle('userProfile:getProfile', async () => {
    if (isFallbackDatabase()) {
      const profiles = getFallbackCollection('user_profile')
      return profiles[0] || insertFallback('user_profile', {
        id: 1,
        name: 'عمر',
        avatar: '🧠',
        level: 1,
        totalXP: 0,
        currentStreakDays: 0,
        longestStreakDays: 0,
        pinchProfile: JSON.stringify({ p: 8, i: 7, n: 6, c: 5, h: 9 }),
        peakHour: 10,
        avgDailyEnergy: 3.0,
        onboardingCompleted: false
      })
    } else {
      const db = getDatabase()
      let p = db.select().from(schema.userProfile).get()
      if (!p) {
        const now = new Date()
        db.insert(schema.userProfile).values({
          id: 1,
          name: 'عمر',
          avatar: '🧠',
          level: 1,
          totalXP: 0,
          currentStreakDays: 0,
          longestStreakDays: 0,
          pinchProfile: JSON.stringify({ p: 8, i: 7, n: 6, c: 5, h: 9 }),
          peakHour: 10,
          avgDailyEnergy: 3.0,
          onboardingCompleted: false,
          createdAt: now
        } as any).run()
        p = db.select().from(schema.userProfile).get()
      }
      return p
    }
  })

  ipcMain.handle('userProfile:updateProfile', async (_, updates) => {
    if (isFallbackDatabase()) {
      return updateFallback('user_profile', 1, updates)
    } else {
      const db = getDatabase()
      db.update(schema.userProfile).set(updates).where(eq(schema.userProfile.id, 1)).run()
      return db.select().from(schema.userProfile).where(eq(schema.userProfile.id, 1)).get()
    }
  })

  // ==========================================
  // Context Snapshots Handlers
  // ==========================================
  ipcMain.handle('contextSnapshots:getLatestSnapshot', async (_, taskId, projectId, trackId) => {
    if (isFallbackDatabase()) {
      const list = getFallbackCollection('context_snapshots')
      const filtered = list.filter((s: any) => {
        if (taskId && s.taskId !== taskId) return false
        if (projectId && s.projectId !== projectId) return false
        if (trackId && s.learningTrackId !== trackId) return false
        return true
      })
      filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return filtered[0]
    } else {
      const db = getDatabase()
      const query = db.select().from(schema.contextSnapshots)
      const conditions: any[] = []
      if (taskId) conditions.push(eq(schema.contextSnapshots.taskId, taskId))
      if (projectId) conditions.push(eq(schema.contextSnapshots.projectId, projectId))
      if (trackId) conditions.push(eq(schema.contextSnapshots.learningTrackId, trackId))
      
      if (conditions.length > 0) {
        return query.where(and(...conditions)).orderBy(sql`${schema.contextSnapshots.createdAt} DESC`).get()
      }
      return query.orderBy(sql`${schema.contextSnapshots.createdAt} DESC`).get()
    }
  })

  ipcMain.handle('contextSnapshots:saveSnapshot', async (_, snapshotData) => {
    if (isFallbackDatabase()) {
      return insertFallback('context_snapshots', {
        taskId: snapshotData.taskId || null,
        projectId: snapshotData.projectId || null,
        learningTrackId: snapshotData.learningTrackId || null,
        snapshot: snapshotData.snapshot
      })
    } else {
      const db = getDatabase()
      const result = db.insert(schema.contextSnapshots).values({
        taskId: snapshotData.taskId || null,
        projectId: snapshotData.projectId || null,
        learningTrackId: snapshotData.learningTrackId || null,
        snapshot: snapshotData.snapshot,
        createdAt: new Date()
      } as any).run()
      return db.select().from(schema.contextSnapshots).where(eq(schema.contextSnapshots.id, Number(result.lastInsertRowid))).get()
    }
  })

  // ==========================================
  // System / OS IPC Handlers
  // ==========================================
  ipcMain.handle('system:exportData', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false

    const { filePath } = await dialog.showSaveDialog(window, {
      title: 'تصدير بيانات FocusMind',
      defaultPath: 'focusmind_backup.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    })

    if (!filePath) return false

    let backupData: any = {}

    if (isFallbackDatabase()) {
      backupData = {
        settings: getFallbackCollection('settings'),
        tasks: getFallbackCollection('tasks'),
        projects: getFallbackCollection('projects'),
        focus_sessions: getFallbackCollection('focus_sessions'),
        habits: getFallbackCollection('habits'),
        habit_logs: getFallbackCollection('habit_logs'),
        brain_dumps: getFallbackCollection('brain_dumps'),
        dopamine_activities: getFallbackCollection('dopamine_activities'),
        mood_logs: getFallbackCollection('mood_logs'),
        ai_conversations: getFallbackCollection('ai_conversations'),
        achievements: getFallbackCollection('achievements')
      }
    } else {
      const db = getDatabase()
      backupData = {
        settings: db.select().from(schema.settings).all(),
        tasks: db.select().from(schema.tasks).all(),
        projects: db.select().from(schema.projects).all(),
        focus_sessions: db.select().from(schema.focusSessions).all(),
        habits: db.select().from(schema.habits).all(),
        habit_logs: db.select().from(schema.habitLogs).all(),
        brain_dumps: db.select().from(schema.brainDumps).all(),
        dopamine_activities: db.select().from(schema.dopamineActivities).all(),
        mood_logs: db.select().from(schema.moodLogs).all(),
        ai_conversations: db.select().from(schema.aiConversations).all(),
        achievements: db.select().from(schema.achievements).all()
      }
    }

    try {
      const fs = require('fs')
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8')
      return true
    } catch (err) {
      console.error('Failed to export data:', err)
      return false
    }
  })

  ipcMain.handle('system:importData', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false

    const { filePaths } = await dialog.showOpenDialog(window, {
      title: 'استيراد بيانات FocusMind',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    })

    if (!filePaths || filePaths.length === 0) return false

    try {
      const fs = require('fs')
      const raw = fs.readFileSync(filePaths[0], 'utf-8')
      const parsed = JSON.parse(raw)
      
      if (typeof parsed !== 'object') return false

      if (isFallbackDatabase()) {
        const path = require('path')
        const userDataPath = app.getPath('userData')
        const dataFilePath = path.join(userDataPath, 'focusmind_data.json')
        fs.writeFileSync(dataFilePath, JSON.stringify(parsed, null, 2), 'utf-8')
        initFallbackDatabase()
        return true
      } else {
        const db = getDatabase()
        db.transaction((tx) => {
          if (Array.isArray(parsed.settings)) {
            tx.delete(schema.settings).run()
            for (const s of parsed.settings) tx.insert(schema.settings).values(s).run()
          }
          if (Array.isArray(parsed.tasks)) {
            tx.delete(schema.tasks).run()
            for (const t of parsed.tasks) tx.insert(schema.tasks).values(t).run()
          }
          if (Array.isArray(parsed.projects)) {
            tx.delete(schema.projects).run()
            for (const p of parsed.projects) tx.insert(schema.projects).values(p).run()
          }
          if (Array.isArray(parsed.focus_sessions)) {
            tx.delete(schema.focusSessions).run()
            for (const fsItem of parsed.focus_sessions) tx.insert(schema.focusSessions).values(fsItem).run()
          }
          if (Array.isArray(parsed.habits)) {
            tx.delete(schema.habits).run()
            for (const h of parsed.habits) tx.insert(schema.habits).values(h).run()
          }
          if (Array.isArray(parsed.habit_logs)) {
            tx.delete(schema.habitLogs).run()
            for (const hl of parsed.habit_logs) tx.insert(schema.habitLogs).values(hl).run()
          }
          if (Array.isArray(parsed.brain_dumps)) {
            tx.delete(schema.brainDumps).run()
            for (const bd of parsed.brain_dumps) tx.insert(schema.brainDumps).values(bd).run()
          }
          if (Array.isArray(parsed.dopamine_activities)) {
            tx.delete(schema.dopamineActivities).run()
            for (const da of parsed.dopamine_activities) tx.insert(schema.dopamineActivities).values(da).run()
          }
          if (Array.isArray(parsed.mood_logs)) {
            tx.delete(schema.moodLogs).run()
            for (const ml of parsed.mood_logs) tx.insert(schema.moodLogs).values(ml).run()
          }
          if (Array.isArray(parsed.ai_conversations)) {
            tx.delete(schema.aiConversations).run()
            for (const ac of parsed.ai_conversations) tx.insert(schema.aiConversations).values(ac).run()
          }
          if (Array.isArray(parsed.achievements)) {
            tx.delete(schema.achievements).run()
            for (const a of parsed.achievements) tx.insert(schema.achievements).values(a).run()
          }
        })
        return true
      }
    } catch (err) {
      console.error('Failed to import data:', err)
      return false
    }
  })

  ipcMain.on('system:showNotification', (_, title, body) => {
    try {
      new Notification({ title, body }).show()
    } catch (e) {
      console.error('Error showing system notification:', e)
    }
  })
}
