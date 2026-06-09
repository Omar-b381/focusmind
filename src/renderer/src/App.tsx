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

export default function App() {
  const activeTab = useAppStore((state) => state.activeTab)

  // Render page based on active tab state (fast state-based routing)
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'tasks':
        return <Tasks />
      case 'projects':
        return <Projects />
      case 'focus':
        return <FocusMode />
      case 'habits':
        return <Habits />
      case 'dopamine':
        return <DopamineMenu />
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
    <QueryClientProvider client={queryClient}>
      <Layout>{renderPage()}</Layout>
    </QueryClientProvider>
  )
}
