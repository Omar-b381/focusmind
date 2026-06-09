import { useEffect } from 'react'
import { useAppStore } from '../../stores/app.store'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BrainDumpModal from '../ui/BrainDumpModal' // We will create this next
import ToastContainer from '../ui/ToastContainer' // We will also create a small toast layout

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { toggleBrainDump, isBrainDumpOpen, setBrainDumpOpen } = useAppStore()

  useEffect(() => {
    // Register global hotkey listeners via contextBridge
    if (window.api && window.api.system) {
      const unsubscribeBrainDump = window.api.system.onBrainDumpHotkey(() => {
        toggleBrainDump()
      })

      return () => {
        unsubscribeBrainDump()
      }
    }
    return undefined
  }, [toggleBrainDump])

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#0f1117] text-gray-200 select-none" dir="rtl">
      {/* Sidebar on the right for Arabic RTL */}
      <Sidebar />

      {/* Main content container on the left */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar header */}
        <TopBar />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-[#0f1117] p-6 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Brain Dump Modal */}
      <BrainDumpModal isOpen={isBrainDumpOpen} onClose={() => setBrainDumpOpen(false)} />

      {/* Global Toast Notification Container */}
      <ToastContainer />
    </div>
  )
}
