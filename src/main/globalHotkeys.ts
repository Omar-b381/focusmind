import { globalShortcut, BrowserWindow } from 'electron'

export function registerGlobalHotkeys(mainWindow: BrowserWindow): void {
  // Unregister all hotkeys first to avoid conflicts
  globalShortcut.unregisterAll()

  // 1. Ctrl+Space for Brain Dump (Global Quick Capture)
  globalShortcut.register('CommandOrControl+Space', () => {
    mainWindow.webContents.send('hotkey:brain-dump')
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
    mainWindow.focus()
  })

  // 2. Ctrl+Shift+F for Focus Timer Start/Pause
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    mainWindow.webContents.send('hotkey:focus-timer')
  })
}

export function unregisterGlobalHotkeys(): void {
  globalShortcut.unregisterAll()
}
