import Ffmpeg, { ffprobe } from 'fluent-ffmpeg'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/iconTemplate.png?asset'

let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('videos:added', (_, videos) => {
  const promises = videos.map(
    (video) =>
      new Promise((resolve, reject) => {
        ffprobe(video.path, (err, metadata) => {
          if (err) return reject(err)

          resolve({
            ...video,
            duration: metadata.format.duration,
            format: 'avi'
          })
        })
      })
  )

  Promise.all(promises).then((results) => {
    mainWindow.webContents.send('metadata:complete', results)
  })
})

ipcMain.on('conversion:start', (_, videos) => {
  for (const video of videos) {
    const outputDir = video.path.split(video.name)[0]
    const outputName = video.name.split('.')[0]
    const outputPath = `${outputDir}/${outputName}.${video.format}`

    Ffmpeg(video.path)
      .output(outputPath)
      .on('progress', ({ timemark }) =>
        mainWindow.webContents.send('conversion:progress', { video, timemark })
      )
      .on('end', () =>
        mainWindow.webContents.send('conversion:end', {
          video,
          outputPath: outputPath
        })
      )
      .run()
  }
})

ipcMain.on('folder:open', (_, outputPath) => {
  shell.showItemInFolder(outputPath)
})
