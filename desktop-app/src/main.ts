import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { startLocalServer } from './backend/server';

let mainWindow: BrowserWindow | null = null;
let serverPort: number;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Set up the menu
  createMenu();

  // Load the React app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Load from local build
    const indexPath = path.join(__dirname, '../frontend-build/index.html');
    mainWindow.loadFile(indexPath);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // Focus on window
      if (isDev) {
        mainWindow.webContents.focus();
      }
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Send event to renderer to start new project
            if (mainWindow) {
              mainWindow.webContents.send('menu-new-project');
            }
          }
        },
        {
          label: 'Open Project Folder',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (!mainWindow) return;
            
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory'],
              title: 'Select Project Folder'
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-open-folder', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'AI Tools',
      submenu: [
        {
          label: 'Upload Images',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-navigate', '/upload');
            }
          }
        },
        {
          label: 'Generate Images',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-navigate', '/generation');
            }
          }
        },
        {
          label: 'Create Animation',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-navigate', '/animation');
            }
          }
        },
        {
          label: 'Create Video',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-navigate', '/video');
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Creator AI',
          click: () => {
            if (mainWindow) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'About Creator AI',
                message: 'Creator AI Desktop v1.0.0',
                detail: 'AI-powered avatar and video creation tool\\n\\nBuilt with love by Hanh IO Company Limited',
                buttons: ['OK']
              });
            }
          }
        },
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://github.com/hanh-io-company-limited/creator-ai');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // Start the local backend server
    serverPort = await startLocalServer();
    console.log(`Local server started on port ${serverPort}`);
    
    // Create the main window
    createWindow();
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start local server:', error);
    dialog.showErrorBox('Startup Error', 'Failed to start local backend server. Please try restarting the application.');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-server-port', () => {
  return serverPort;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Auto-updater events (if needed in the future)
app.on('ready', () => {
  // Auto-updater setup can go here
});

export { mainWindow };