/*
 * Creator AI - Main Process
 * 
 * Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file contains proprietary source code and trade secrets of Hanh IO Company Limited.
 * Any unauthorized copying, distribution, modification, or reverse engineering is strictly 
 * prohibited and may result in severe legal penalties.
 * 
 * All rights, title, and interest in this software are owned exclusively by 
 * Hanh IO Company Limited.
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Enable live reload for Electron in development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'app-interface.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory'],
              title: 'Select Project Directory'
            });
            if (!result.canceled) {
              mainWindow.webContents.send('menu-open-project', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-project');
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
      label: 'AI Models',
      submenu: [
        {
          label: 'Train New Model',
          click: () => {
            mainWindow.webContents.send('menu-train-model');
          }
        },
        {
          label: 'Load Pretrained Model',
          click: () => {
            mainWindow.webContents.send('menu-load-model');
          }
        },
        {
          label: 'Model Manager',
          click: () => {
            mainWindow.webContents.send('menu-model-manager');
          }
        }
      ]
    },
    {
      label: 'Generate',
      submenu: [
        {
          label: 'Generate Video',
          accelerator: 'CmdOrCtrl+G',
          click: () => {
            mainWindow.webContents.send('menu-generate-video');
          }
        },
        {
          label: 'Batch Generate',
          click: () => {
            mainWindow.webContents.send('menu-batch-generate');
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
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Creator AI',
              message: 'Creator AI v1.0.0',
              detail: 'AI-powered video content creation tool for offline use.\\n\\n© 2024 Hanh IO Company Limited - All Rights Reserved\\nProprietary Software - Confidential and Trade Secret'
            });
          }
        },
        {
          label: 'User Guide',
          click: () => {
            mainWindow.webContents.send('menu-user-guide');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for file operations
ipcMain.handle('save-file', async (event, content, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath,
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'avi', 'mov'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    try {
      fs.writeFileSync(result.filePath, content);
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Save cancelled' };
});

ipcMain.handle('load-file', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [
      { name: 'Video Files', extensions: ['mp4', 'avi', 'mov'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    try {
      const content = fs.readFileSync(result.filePaths[0]);
      return { success: true, content: content, path: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Load cancelled' };
});

// IPC handler for starting backend server
ipcMain.handle('start-backend-server', async (event) => {
  try {
    const { spawn } = require('child_process');
    const serverPath = path.join(__dirname, 'backend', 'image-processor.js');
    
    // Check if server file exists
    if (!fs.existsSync(serverPath)) {
      return { success: false, error: 'Backend server file not found' };
    }
    
    // Start the backend server
    const serverProcess = spawn('node', [serverPath], {
      detached: false,
      stdio: 'pipe'
    });
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`Backend stdout: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Backend stderr: ${data}`);
    });
    
    serverProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });
    
    // Give it a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Backend server started' };
    
  } catch (error) {
    console.error('Failed to start backend server:', error);
    return { success: false, error: error.message };
  }
});