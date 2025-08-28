import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { OfflineAIService } from './offline-ai-service';

const app = express();
let server: any;
const aiService = new OfflineAIService();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static file serving
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// In-memory storage for sessions and jobs
const sessions = new Map();
const jobs = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'offline'
  });
});

// Upload endpoints
app.post('/api/upload', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Vui lòng tải lên ít nhất 1 hình ảnh'
      });
    }

    const sessionId = uuidv4();
    const uploadedFiles = files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    sessions.set(sessionId, {
      id: sessionId,
      files: uploadedFiles,
      status: 'pending',
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: 'Tải lên thành công',
      sessionId,
      filesCount: files.length,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Lỗi tải lên hình ảnh'
    });
  }
});

app.get('/api/upload/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'Không tìm thấy phiên huấn luyện'
    });
  }

  res.json({
    success: true,
    session
  });
});

// Training endpoints
app.post('/api/training/start/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'Không tìm thấy phiên huấn luyện'
    });
  }

  try {
    const jobId = await aiService.startTraining(sessionId, session.files);
    
    res.json({
      success: true,
      message: 'Bắt đầu huấn luyện mô hình',
      sessionId,
      jobId,
      status: 'processing',
      estimatedTime: '10-15 phút'
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({
      error: 'Training failed',
      message: 'Lỗi khởi động quá trình huấn luyện'
    });
  }
});

app.get('/api/training/status/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const status = await aiService.getTrainingStatus(sessionId);
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(404).json({
      error: 'Session not found',
      message: 'Không tìm thấy phiên huấn luyện'
    });
  }
});

// Generation endpoints
app.post('/api/generation/generate', async (req, res) => {
  const { prompt, style = 'realistic', resolution = '512x512' } = req.body;
  
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({
      error: 'Invalid prompt',
      message: 'Vui lòng nhập mô tả để tạo hình ảnh'
    });
  }

  try {
    const result = await aiService.generateImage(prompt, style, resolution);
    
    res.json({
      success: true,
      message: 'Tạo hình ảnh thành công',
      image: result,
      processingTime: '12.5 giây'
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: 'Lỗi tạo hình ảnh'
    });
  }
});

app.get('/api/generation/styles', (req, res) => {
  res.json({
    success: true,
    styles: aiService.getAvailableStyles()
  });
});

// Animation endpoints
app.post('/api/animation/create', async (req, res) => {
  const { imageId, animationType = 'lip_sync', audioFile } = req.body;
  
  try {
    const result = await aiService.createAnimation(imageId, animationType, audioFile);
    
    res.json({
      success: true,
      message: 'Bắt đầu tạo animation',
      animation: result
    });
  } catch (error) {
    console.error('Animation error:', error);
    res.status(500).json({
      error: 'Animation failed',
      message: 'Lỗi tạo animation'
    });
  }
});

app.get('/api/animation/status/:animationId', async (req, res) => {
  const { animationId } = req.params;
  
  try {
    const status = await aiService.getAnimationStatus(animationId);
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(404).json({
      error: 'Animation not found',
      message: 'Không tìm thấy animation'
    });
  }
});

// Video endpoints
app.post('/api/video/create', async (req, res) => {
  const { sourceId, audioType, ttsText, voice, audioFile } = req.body;
  
  try {
    const result = await aiService.createVideo(sourceId, audioType, { ttsText, voice, audioFile });
    
    res.json({
      success: true,
      message: 'Bắt đầu tạo video',
      job: result
    });
  } catch (error) {
    console.error('Video error:', error);
    res.status(500).json({
      error: 'Video creation failed',
      message: 'Lỗi tạo video'
    });
  }
});

app.get('/api/video/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const status = await aiService.getVideoStatus(jobId);
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(404).json({
      error: 'Job not found',
      message: 'Không tìm thấy job'
    });
  }
});

app.get('/api/video/voices', (req, res) => {
  res.json({
    success: true,
    voices: aiService.getAvailableVoices()
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Lỗi máy chủ nội bộ'
  });
});

export function startLocalServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    // Try to find an available port starting from 3001
    let port = 3001;
    
    const tryPort = (portNum: number) => {
      server = app.listen(portNum, 'localhost', () => {
        console.log(`Local backend server running on http://localhost:${portNum}`);
        resolve(portNum);
      });
      
      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          server.close();
          tryPort(portNum + 1);
        } else {
          reject(err);
        }
      });
    };
    
    tryPort(port);
  });
}

export function stopLocalServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Local backend server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
}