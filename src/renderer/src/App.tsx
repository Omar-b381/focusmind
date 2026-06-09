import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAppStore } from './stores/app.store'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import FocusMode from './pages/FocusMode'
import Habits from './pages/Habits'
import DopamineMenu from './pages/DopamineMenu'
import AICoach from './pages/AICoach'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import LearningPaths from './pages/LearningPaths'
import Flashcards from './pages/Flashcards'
import FlashcardReview from './pages/FlashcardReview'
import Feynman from './pages/Feynman'
import KnowledgeMap from './pages/KnowledgeMap'
import Achievements from './pages/Achievements'
import Onboarding from './pages/Onboarding'
import LevelUpOverlay from './components/gamification/LevelUpOverlay'
import { useUserProfileQuery } from './hooks/useXP'

function AppContent() {
  const activeTab = useAppStore((state) => state.activeTab)
  const { data: profile, isLoading, refetch } = useUserProfileQuery()

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0f1117] flex flex-col items-center justify-center font-cairo">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-r-2 border-indigo-500" />
        <span className="text-gray-400 text-sm mt-4">جاري تحميل لوحة التحكم...</span>
      </div>
    )
  }

  if (!profile || !profile.onboardingCompleted) {
    return <Onboarding onComplete={() => refetch()} />
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <Tasks />
      case 'projects':
        return <Projects />
      case 'learning':
        return <LearningPaths />
      case 'flashcards':
        return <Flashcards />
      case 'flashcard-review':
        return <FlashcardReview />
      case 'feynman':
        return <Feynman />
      case 'knowledgeMap':
        return <KnowledgeMap />
      case 'focus':
        return <FocusMode />
      case 'habits':
        return <Habits />
      case 'dopamine':
        return <DopamineMenu />
      case 'achievements':
        return <Achievements />
      case 'coach':
        return <AICoach />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <>
      <Layout>{renderPage()}</Layout>
      <LevelUpOverlay />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
