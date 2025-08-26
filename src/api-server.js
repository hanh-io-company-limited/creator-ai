// Internal API Server for Creator AI
// Provides REST endpoints for AI operations and model management

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Import the real AI engine and Audio engine
const RealAIEngine = require('./ai-engine-real');
const AudioEngine = require('./audio-engine');

class CreatorAIServer {
    constructor(port = 3000, wsPort = 8080) {
        this.port = port;
        this.wsPort = wsPort;
        this.app = express();
        this.aiEngine = new RealAIEngine();
        this.audioEngine = new AudioEngine();
        this.activeJobs = new Map();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }

    setupMiddleware() {
        // Basic middleware
        this.app.use(cors());
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // File upload middleware
        const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const uploadDir = path.join(process.cwd(), 'uploads');
                try {
                    await fs.access(uploadDir);
                } catch {
                    await fs.mkdir(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${uuidv4()}_${file.originalname}`;
                cb(null, uniqueName);
            }
        });

        this.upload = multer({
            storage: storage,
            limits: {
                fileSize: 100 * 1024 * 1024 // 100MB limit
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wav|mp3|m4a/;
                const mimetype = allowedTypes.test(file.mimetype);
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                
                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb(new Error('Invalid file type'));
                }
            }
        });

        // Static file serving
        this.app.use('/output', express.static(path.join(process.cwd(), 'output')));
        this.app.use('/models', express.static(path.join(process.cwd(), 'models')));
    }

    setupRoutes() {
        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                engine: 'Real AI Engine'
            });
        });

        // System information
        this.app.get('/api/system', async (req, res) => {
            try {
                const systemInfo = this.aiEngine.getSystemInfo();
                res.json({
                    success: true,
                    data: systemInfo
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Model management routes
        this.setupModelRoutes();
        
        // Training routes
        this.setupTrainingRoutes();
        
        // Generation routes
        this.setupGenerationRoutes();
        
        // Audio processing routes
        this.setupAudioRoutes();
        
        // Data management routes
        this.setupDataRoutes();
    }

    setupModelRoutes() {
        // List all models
        this.app.get('/api/models', async (req, res) => {
            try {
                const models = this.aiEngine.listLoadedModels();
                const modelDetails = models.map(modelId => this.aiEngine.getModelInfo(modelId));
                
                res.json({
                    success: true,
                    data: modelDetails
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get specific model info
        this.app.get('/api/models/:modelId', async (req, res) => {
            try {
                const { modelId } = req.params;
                const modelInfo = this.aiEngine.getModelInfo(modelId);
                
                if (!modelInfo) {
                    return res.status(404).json({
                        success: false,
                        error: 'Model not found'
                    });
                }
                
                res.json({
                    success: true,
                    data: modelInfo
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Load model
        this.app.post('/api/models/load', this.upload.single('modelFile'), async (req, res) => {
            try {
                const { modelId, modelPath } = req.body;
                const file = req.file;
                
                let pathToLoad = modelPath;
                if (file) {
                    pathToLoad = file.path;
                }
                
                if (!pathToLoad) {
                    return res.status(400).json({
                        success: false,
                        error: 'Model path or file is required'
                    });
                }
                
                const model = await this.aiEngine.loadModel(pathToLoad, modelId || uuidv4());
                
                res.json({
                    success: true,
                    data: model
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Unload model
        this.app.delete('/api/models/:modelId', async (req, res) => {
            try {
                const { modelId } = req.params;
                const success = this.aiEngine.unloadModel(modelId);
                
                if (!success) {
                    return res.status(404).json({
                        success: false,
                        error: 'Model not found'
                    });
                }
                
                res.json({
                    success: true,
                    message: `Model ${modelId} unloaded successfully`
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    setupTrainingRoutes() {
        // Create new model
        this.app.post('/api/training/create-model', async (req, res) => {
            try {
                const { type, config } = req.body;
                
                if (!type || !config) {
                    return res.status(400).json({
                        success: false,
                        error: 'Model type and config are required'
                    });
                }
                
                let model;
                switch (type) {
                    case 'text-to-video':
                        model = await this.aiEngine.createTextToVideoModel(config);
                        break;
                    case 'image-to-video':
                        model = await this.aiEngine.createImageToVideoModel(config);
                        break;
                    default:
                        return res.status(400).json({
                            success: false,
                            error: `Unsupported model type: ${type}`
                        });
                }
                
                res.json({
                    success: true,
                    data: model
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Start training
        this.app.post('/api/training/start', this.upload.array('trainingData'), async (req, res) => {
            try {
                const { modelId, config } = req.body;
                const trainingFiles = req.files;
                
                if (!modelId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Model ID is required'
                    });
                }
                
                const jobId = uuidv4();
                const job = {
                    id: jobId,
                    type: 'training',
                    modelId: modelId,
                    config: JSON.parse(config || '{}'),
                    status: 'starting',
                    progress: 0,
                    startTime: Date.now(),
                    files: trainingFiles
                };
                
                this.activeJobs.set(jobId, job);
                
                // Start training asynchronously
                this.runTrainingJob(jobId).catch(error => {
                    console.error('Training job failed:', error);
                    job.status = 'failed';
                    job.error = error.message;
                });
                
                res.json({
                    success: true,
                    data: {
                        jobId: jobId,
                        message: 'Training started'
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get training status
        this.app.get('/api/training/status/:jobId', (req, res) => {
            try {
                const { jobId } = req.params;
                const job = this.activeJobs.get(jobId);
                
                if (!job) {
                    return res.status(404).json({
                        success: false,
                        error: 'Job not found'
                    });
                }
                
                res.json({
                    success: true,
                    data: job
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    setupGenerationRoutes() {
        // Generate video
        this.app.post('/api/generation/video', async (req, res) => {
            try {
                const { modelId, prompt, config } = req.body;
                
                if (!modelId || !prompt) {
                    return res.status(400).json({
                        success: false,
                        error: 'Model ID and prompt are required'
                    });
                }
                
                const jobId = uuidv4();
                const job = {
                    id: jobId,
                    type: 'video-generation',
                    modelId: modelId,
                    prompt: prompt,
                    config: config || {},
                    status: 'starting',
                    progress: 0,
                    startTime: Date.now()
                };
                
                this.activeJobs.set(jobId, job);
                
                // Start generation asynchronously
                this.runGenerationJob(jobId).catch(error => {
                    console.error('Generation job failed:', error);
                    job.status = 'failed';
                    job.error = error.message;
                });
                
                res.json({
                    success: true,
                    data: {
                        jobId: jobId,
                        message: 'Generation started'
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get generation status
        this.app.get('/api/generation/status/:jobId', (req, res) => {
            try {
                const { jobId } = req.params;
                const job = this.activeJobs.get(jobId);
                
                if (!job) {
                    return res.status(404).json({
                        success: false,
                        error: 'Job not found'
                    });
                }
                
                res.json({
                    success: true,
                    data: job
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get sample prompts
        this.app.get('/api/generation/sample-prompts', (req, res) => {
            try {
                const prompts = this.aiEngine.generateSamplePrompts();
                res.json({
                    success: true,
                    data: prompts
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    setupAudioRoutes() {
        // Process audio file with effects
        this.app.post('/api/audio/process', this.upload.single('audioFile'), async (req, res) => {
            try {
                const { effects } = req.body;
                const audioFile = req.file;
                
                if (!audioFile) {
                    return res.status(400).json({
                        success: false,
                        error: 'Audio file is required'
                    });
                }
                
                const result = await this.audioEngine.processAudio(
                    audioFile.path,
                    JSON.parse(effects || '[]'),
                    JSON.parse(req.body.options || '{}')
                );
                
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Generate audio from text (Text-to-Speech)
        this.app.post('/api/audio/text-to-speech', async (req, res) => {
            try {
                const { text, voice, options } = req.body;
                
                if (!text) {
                    return res.status(400).json({
                        success: false,
                        error: 'Text is required'
                    });
                }
                
                const result = await this.audioEngine.generateAudioFromText(text, {
                    voice: voice || 'default',
                    ...options
                });
                
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Generate background music
        this.app.post('/api/audio/generate-music', async (req, res) => {
            try {
                const { prompt, options } = req.body;
                
                if (!prompt) {
                    return res.status(400).json({
                        success: false,
                        error: 'Music prompt is required'
                    });
                }
                
                const result = await this.audioEngine.generateBackgroundMusic(prompt, options || {});
                
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Analyze audio file
        this.app.post('/api/audio/analyze', this.upload.single('audioFile'), async (req, res) => {
            try {
                const audioFile = req.file;
                
                if (!audioFile) {
                    return res.status(400).json({
                        success: false,
                        error: 'Audio file is required'
                    });
                }
                
                const result = await this.audioEngine.analyzeAudio(audioFile.path);
                
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Detect beats in audio
        this.app.post('/api/audio/detect-beats', this.upload.single('audioFile'), async (req, res) => {
            try {
                const audioFile = req.file;
                
                if (!audioFile) {
                    return res.status(400).json({
                        success: false,
                        error: 'Audio file is required'
                    });
                }
                
                const result = await this.audioEngine.detectBeats(audioFile.path);
                
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Mix multiple audio tracks
        this.app.post('/api/audio/mix', this.upload.array('audioTracks'), async (req, res) => {
            try {
                const audioFiles = req.files;
                const { options } = req.body;
                
                if (!audioFiles || audioFiles.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'At least one audio track is required'
                    });
                }
                
                const tracks = audioFiles.map(file => ({
                    path: file.path,
                    name: file.originalname,
                    volume: 1.0,
                    pan: 0.0,
                    duration: 30 // Mock duration
                }));
                
                const result = await this.audioEngine.mixAudio(tracks, JSON.parse(options || '{}'));
                
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Convert audio format
        this.app.post('/api/audio/convert', this.upload.single('audioFile'), async (req, res) => {
            try {
                const audioFile = req.file;
                const { outputFormat, options } = req.body;
                
                if (!audioFile) {
                    return res.status(400).json({
                        success: false,
                        error: 'Audio file is required'
                    });
                }
                
                if (!outputFormat) {
                    return res.status(400).json({
                        success: false,
                        error: 'Output format is required'
                    });
                }
                
                const result = await this.audioEngine.convertAudio(
                    audioFile.path,
                    outputFormat,
                    JSON.parse(options || '{}')
                );
                
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get supported audio formats
        this.app.get('/api/audio/formats', (req, res) => {
            try {
                const formats = this.audioEngine.getAudioFormats();
                res.json({
                    success: true,
                    data: formats
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    setupDataRoutes() {
        // Upload training data
        this.app.post('/api/data/upload', this.upload.array('files'), async (req, res) => {
            try {
                const files = req.files;
                
                if (!files || files.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'No files provided'
                    });
                }
                
                const uploadedFiles = files.map(file => ({
                    originalName: file.originalname,
                    filename: file.filename,
                    path: file.path,
                    size: file.size,
                    mimetype: file.mimetype
                }));
                
                res.json({
                    success: true,
                    data: {
                        message: `${files.length} files uploaded successfully`,
                        files: uploadedFiles
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // List uploaded files
        this.app.get('/api/data/files', async (req, res) => {
            try {
                const uploadsDir = path.join(process.cwd(), 'uploads');
                const files = await fs.readdir(uploadsDir);
                
                const fileDetails = await Promise.all(
                    files.map(async (file) => {
                        const filePath = path.join(uploadsDir, file);
                        const stats = await fs.stat(filePath);
                        return {
                            name: file,
                            path: filePath,
                            size: stats.size,
                            created: stats.birthtime,
                            modified: stats.mtime
                        };
                    })
                );
                
                res.json({
                    success: true,
                    data: fileDetails
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    setupWebSocket() {
        this.wss = new WebSocket.Server({ port: this.wsPort });
        
        this.wss.on('connection', (ws) => {
            console.log('WebSocket client connected');
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format'
                    }));
                }
            });
            
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
            });
        });
        
        console.log(`WebSocket server listening on port ${this.wsPort}`);
    }

    handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'subscribe':
                // Subscribe to job updates
                ws.jobId = data.jobId;
                break;
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    message: `Unknown message type: ${data.type}`
                }));
        }
    }

    broadcastJobUpdate(jobId, update) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.jobId === jobId) {
                client.send(JSON.stringify({
                    type: 'job-update',
                    jobId: jobId,
                    data: update
                }));
            }
        });
    }

    async runTrainingJob(jobId) {
        const job = this.activeJobs.get(jobId);
        if (!job) return;
        
        try {
            job.status = 'running';
            this.broadcastJobUpdate(jobId, job);
            
            // Get model (create if needed)
            const modelInfo = this.aiEngine.getModelInfo(job.modelId);
            let model;
            
            if (!modelInfo) {
                // Create new model
                model = await this.aiEngine.createTextToVideoModel(job.config);
            } else {
                model = this.aiEngine.models.get(job.modelId);
            }
            
            // Run training with progress callback
            await this.aiEngine.trainModel(model, job.files, job.config, (progress) => {
                job.progress = progress.progress;
                job.epoch = progress.epoch;
                job.loss = progress.loss;
                job.accuracy = progress.accuracy;
                this.broadcastJobUpdate(jobId, job);
            });
            
            // Save trained model
            const modelPath = path.join(process.cwd(), 'models', `${job.modelId}.json`);
            await this.aiEngine.saveModel(model, modelPath);
            
            job.status = 'completed';
            job.completedAt = Date.now();
            job.duration = job.completedAt - job.startTime;
            
            this.broadcastJobUpdate(jobId, job);
            
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            this.broadcastJobUpdate(jobId, job);
        }
    }

    async runGenerationJob(jobId) {
        const job = this.activeJobs.get(jobId);
        if (!job) return;
        
        try {
            job.status = 'running';
            this.broadcastJobUpdate(jobId, job);
            
            // Run generation with progress callback
            const result = await this.aiEngine.generateVideo(
                job.modelId,
                job.prompt,
                job.config,
                (progress) => {
                    job.progress = progress.progress;
                    job.stage = progress.stage;
                    if (progress.frame) {
                        job.frame = progress.frame;
                        job.totalFrames = progress.totalFrames;
                    }
                    this.broadcastJobUpdate(jobId, job);
                }
            );
            
            job.status = 'completed';
            job.result = result;
            job.completedAt = Date.now();
            job.duration = job.completedAt - job.startTime;
            
            this.broadcastJobUpdate(jobId, job);
            
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            this.broadcastJobUpdate(jobId, job);
        }
    }

    async start() {
        try {
            // Initialize AI engine and Audio engine
            await this.aiEngine.initialize();
            await this.audioEngine.initialize();
            
            // Start HTTP server
            this.server = this.app.listen(this.port, () => {
                console.log(`Creator AI API Server listening on port ${this.port}`);
                console.log(`WebSocket server listening on port ${this.wsPort}`);
            });
            
            return true;
        } catch (error) {
            console.error('Failed to start server:', error);
            return false;
        }
    }

    async stop() {
        try {
            if (this.server) {
                this.server.close();
            }
            if (this.wss) {
                this.wss.close();
            }
            console.log('Creator AI API Server stopped');
        } catch (error) {
            console.error('Error stopping server:', error);
        }
    }
}

// Export the server class
module.exports = CreatorAIServer;

// If running directly, start the server
if (require.main === module) {
    const server = new CreatorAIServer();
    server.start().then(success => {
        if (success) {
            console.log('Creator AI API Server started successfully');
        } else {
            console.error('Failed to start Creator AI API Server');
            process.exit(1);
        }
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down Creator AI API Server...');
        await server.stop();
        process.exit(0);
    });
}