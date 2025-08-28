import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Server communication
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File system operations
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Menu events
  onMenuNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on('menu-navigate', (event, route) => callback(route));
  },
  
  onMenuNewProject: (callback: () => void) => {
    ipcRenderer.on('menu-new-project', () => callback());
  },
  
  onMenuOpenFolder: (callback: (path: string) => void) => {
    ipcRenderer.on('menu-open-folder', (event, path) => callback(path));
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Define types for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getServerPort: () => Promise<number>;
      getAppVersion: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      onMenuNavigate: (callback: (route: string) => void) => void;
      onMenuNewProject: (callback: () => void) => void;
      onMenuOpenFolder: (callback: (path: string) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}