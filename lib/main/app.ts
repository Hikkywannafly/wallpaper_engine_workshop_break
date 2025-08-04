import { BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import { registerWindowIPC } from '@/lib/window/ipcEvents'
import appIcon from '@/resources/build/icon.png?asset'

export function createAppWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 760,
    maxHeight: 760,
    minHeight: 760,
    maxWidth: 900,
    minWidth: 900,
    show: false,
    backgroundColor: '#f3f4f6',
    icon: appIcon,
    frame: true,
    title: 'WE Downloader - alexjoneso',
    maximizable: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Register IPC events for the main window.
  registerWindowIPC(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
