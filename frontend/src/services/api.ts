import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Upload Services
export const uploadService = {
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSession: async (sessionId: string) => {
    const response = await api.get(`/upload/session/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/upload/session/${sessionId}`);
    return response.data;
  },
};

// Training Services
export const trainingService = {
  startTraining: async (sessionId: string) => {
    const response = await api.post(`/training/start/${sessionId}`);
    return response.data;
  },

  getStatus: async (sessionId: string) => {
    const response = await api.get(`/training/status/${sessionId}`);
    return response.data;
  },

  stopTraining: async (sessionId: string) => {
    const response = await api.post(`/training/stop/${sessionId}`);
    return response.data;
  },
};

// Generation Services
export const generationService = {
  generateImage: async (prompt: string, style: string = 'realistic', resolution: string = '512x512') => {
    const response = await api.post('/generation/generate', {
      prompt,
      style,
      resolution
    });
    return response.data;
  },

  getStyles: async () => {
    const response = await api.get('/generation/styles');
    return response.data;
  },

  enhanceImage: async (imageId: string, enhancementType: string = 'quality') => {
    const response = await api.post(`/generation/enhance/${imageId}`, {
      enhancementType
    });
    return response.data;
  },
};

// Animation Services
export const animationService = {
  createAnimation: async (imageId: string, animationType: string = 'lip_sync', audioFile?: string) => {
    const response = await api.post('/animation/create', {
      imageId,
      animationType,
      audioFile
    });
    return response.data;
  },

  getStatus: async (animationId: string) => {
    const response = await api.get(`/animation/status/${animationId}`);
    return response.data;
  },

  getTypes: async () => {
    const response = await api.get('/animation/types');
    return response.data;
  },

  getPreview: async (animationId: string) => {
    const response = await api.get(`/animation/preview/${animationId}`);
    return response.data;
  },
};

// Upscaling Services
export const upscalingService = {
  upscale: async (sourceId: string, sourceType: string, targetResolution: string = '4K', model: string = 'ESRGAN') => {
    const response = await api.post('/upscaling/upscale', {
      sourceId,
      sourceType,
      targetResolution,
      model
    });
    return response.data;
  },

  getStatus: async (jobId: string) => {
    const response = await api.get(`/upscaling/status/${jobId}`);
    return response.data;
  },

  getResolutions: async () => {
    const response = await api.get('/upscaling/resolutions');
    return response.data;
  },

  getModels: async () => {
    const response = await api.get('/upscaling/models');
    return response.data;
  },
};

// Video Services
export const videoService = {
  createVideo: async (sourceId: string, audioType: string, options: any = {}) => {
    const response = await api.post('/video/create', {
      sourceId,
      audioType,
      ...options
    });
    return response.data;
  },

  createTTS: async (text: string, voice: string = 'vi-female-1', language: string = 'vi-VN', speed: number = 1.0) => {
    const response = await api.post('/video/tts', {
      text,
      voice,
      language,
      speed
    });
    return response.data;
  },

  getStatus: async (jobId: string) => {
    const response = await api.get(`/video/status/${jobId}`);
    return response.data;
  },

  getVoices: async () => {
    const response = await api.get('/video/voices');
    return response.data;
  },

  getTemplates: async () => {
    const response = await api.get('/video/templates');
    return response.data;
  },
};

// Health check
export const healthService = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;