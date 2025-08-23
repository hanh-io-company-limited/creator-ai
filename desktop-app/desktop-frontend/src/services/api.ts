import axios from 'axios';

class DesktopAPIService {
  private baseURL: string = 'http://localhost:3001/api';
  private serverPort: number | null = null;

  constructor() {
    this.initializeServerConnection();
  }

  private async initializeServerConnection() {
    try {
      // Get server port from Electron main process
      if (window.electronAPI) {
        this.serverPort = await window.electronAPI.getServerPort();
        this.baseURL = `http://localhost:${this.serverPort}/api`;
        console.log(`Connected to local server on port ${this.serverPort}`);
      }
    } catch (error) {
      console.error('Failed to connect to local server:', error);
    }
  }

  private async request(method: string, endpoint: string, data?: any, config?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        data,
        timeout: 30000,
        ...config
      });
      return response.data;
    } catch (error: any) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Network error');
    }
  }

  // Upload Services
  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.request('POST', '/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getSession(sessionId: string) {
    return this.request('GET', `/upload/session/${sessionId}`);
  }

  // Training Services
  async startTraining(sessionId: string) {
    return this.request('POST', `/training/start/${sessionId}`);
  }

  async getTrainingStatus(sessionId: string) {
    return this.request('GET', `/training/status/${sessionId}`);
  }

  // Generation Services
  async generateImage(prompt: string, style: string = 'realistic', resolution: string = '512x512') {
    return this.request('POST', '/generation/generate', {
      prompt,
      style,
      resolution
    });
  }

  async getStyles() {
    return this.request('GET', '/generation/styles');
  }

  // Animation Services
  async createAnimation(imageId: string, animationType: string = 'lip_sync', audioFile?: string) {
    return this.request('POST', '/animation/create', {
      imageId,
      animationType,
      audioFile
    });
  }

  async getAnimationStatus(animationId: string) {
    return this.request('GET', `/animation/status/${animationId}`);
  }

  // Video Services
  async createVideo(sourceId: string, audioType: string, options: any = {}) {
    return this.request('POST', '/video/create', {
      sourceId,
      audioType,
      ...options
    });
  }

  async getVideoStatus(jobId: string) {
    return this.request('GET', `/video/status/${jobId}`);
  }

  async getVoices() {
    return this.request('GET', '/video/voices');
  }

  // Health check
  async healthCheck() {
    return this.request('GET', '/health');
  }

  // Desktop-specific methods
  async showSaveDialog(options: any) {
    if (window.electronAPI) {
      return window.electronAPI.showSaveDialog(options);
    }
    throw new Error('Electron API not available');
  }

  async showOpenDialog(options: any) {
    if (window.electronAPI) {
      return window.electronAPI.showOpenDialog(options);
    }
    throw new Error('Electron API not available');
  }

  async getAppVersion() {
    if (window.electronAPI) {
      return window.electronAPI.getAppVersion();
    }
    return '1.0.0';
  }

  // Convert blob URL to local file URL for desktop
  getLocalFileUrl(relativePath: string): string {
    if (this.serverPort) {
      return `http://localhost:${this.serverPort}${relativePath}`;
    }
    return relativePath;
  }
}

export const apiService = new DesktopAPIService();
export default apiService;