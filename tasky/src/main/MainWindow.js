import { BrowserWindow, shell } from 'electron'
import icon from '../../resources/iconTemplate.png?asset'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

class MainWindow extends BrowserWindow {
  constructor(fileUrl) {
    super({
      width: 300,
      height: 500,
      show: false,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        backgroundThrottling: false
      }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.loadFile(fileUrl)
    }

    this.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // mainWindow.on('ready-to-show', () => {
    //   mainWindow.show()
    // })

    this.on('blur', () => this.onBlur())
  }

  onBlur() {
    this.hide()
  }
}

export default MainWindow
