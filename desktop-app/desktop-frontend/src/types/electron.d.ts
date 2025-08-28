export interface ElectronAPI {
  getServerPort: () => Promise<number>;
  getAppVersion: () => Promise<string>;
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  onMenuNavigate: (callback: (route: string) => void) => void;
  onMenuNewProject: (callback: () => void) => void;
  onMenuOpenFolder: (callback: (path: string) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};