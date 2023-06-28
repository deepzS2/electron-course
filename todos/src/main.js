// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const { electronApp, optimizer } = require('@electron-toolkit/utils')

let addWindow, mainWindow

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Todo',
        click: createAddWindow
      },
      {
        label: 'Clear Todos',
        click() {
          mainWindow.webContents.send('todo:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click: app.quit
      }
    ]
  }
]

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../resources/icon.png')
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', app.quit)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
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
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add New Todo'
  })

  addWindow.loadFile(path.join(__dirname, 'add.html'))

  addWindow.on('closed', () => {
    addWindow = null
  })
}

if (process.platform === 'darwin') {
  menuTemplate.unshift({ label: '' })
}

if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'View',
    submenu: [
      {
        role: 'reload'
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(_, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      }
    ]
  })
}

const mainMenu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(mainMenu)

ipcMain.on('todo:add', (_, todo) => {
  mainWindow.webContents.send('todo:add', todo)
  addWindow.close()
})
