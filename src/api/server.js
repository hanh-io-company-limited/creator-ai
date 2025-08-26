// Internal API Server for Creator AI
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const MLEngine = require('../ai/ml-engine');

class APIServer {
    constructor(config = {}) {
        this.app = express();
        this.port = config.port || 3000;
        this.host = config.host || 'localhost';
        this.mlEngine = new MLEngine();
        this.server = null;
        this.tasks = new Map(); // Store async task statuses
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // CORS configuration for internal use
        this.app.use(cors({
            origin: ['http://localhost:*', 'file://*'],
            credentials: true
        }));

        // Body parsing
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));

        // File upload configuration
        const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const uploadDir = './uploads';
                try {
                    await fs.mkdir(uploadDir, { recursive: true });
                } catch (error) {
                    // Directory already exists
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
                cb(null, uniqueName);
            }
        });

        this.upload = multer({ 
            storage: storage,
            limits: {
                fileSize: 500 * 1024 * 1024 // 500MB limit for audio/model files
            }
        });

        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });

        // Error handling middleware
        this.app.use((err, req, res, next) => {
            console.error('API Error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: err.message,
                timestamp: new Date().toISOString()
            });
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                mlEngine: this.mlEngine.getSystemInfo()
            });
        });

        // ML Engine routes
        this.app.post('/api/ml/initialize', async (req, res) => {
            try {
                const success = await this.mlEngine.initialize(req.body);
                res.json({ success, message: success ? 'ML Engine initialized' : 'Initialization failed' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/ml/models', (req, res) => {
            try {
                const models = this.mlEngine.listLoadedModels();
                res.json({ models });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/ml/models/:id', (req, res) => {
            try {
                const modelInfo = this.mlEngine.getModelInfo(req.params.id);
                if (!modelInfo) {
                    return res.status(404).json({ error: 'Model not found' });
                }
                res.json({ model: modelInfo });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ml/models/create', async (req, res) => {
            try {
                const { type, config } = req.body;
                let model;

                switch (type) {
                    case 'text-to-audio':
                        model = await this.mlEngine.createTextToAudioModel(config);
                        break;
                    case 'audio-processing':
                        model = await this.mlEngine.createAudioProcessingModel(config);
                        break;
                    default:
                        return res.status(400).json({ error: `Unsupported model type: ${type}` });
                }

                res.json({ 
                    success: true, 
                    model: {
                        id: model.id,
                        type: model.type,
                        parameters: model.parameters,
                        created: model.created
                    }
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ml/models/:id/train', async (req, res) => {
            try {
                const modelId = req.params.id;
                const { trainingData, validationData, config } = req.body;
                
                // Create async task for training
                const taskId = uuidv4();
                this.tasks.set(taskId, {
                    id: taskId,
                    type: 'training',
                    modelId: modelId,
                    status: 'running',
                    progress: 0,
                    startedAt: Date.now()
                });

                // Start training asynchronously
                this.mlEngine.trainModel(
                    modelId, 
                    trainingData, 
                    validationData, 
                    config,
                    (progress) => {
                        const task = this.tasks.get(taskId);
                        if (task) {
                            task.progress = progress.progress;
                            task.epoch = progress.epoch;
                            task.loss = progress.loss;
                            task.accuracy = progress.accuracy;
                        }
                    }
                ).then(() => {
                    const task = this.tasks.get(taskId);
                    if (task) {
                        task.status = 'completed';
                        task.completedAt = Date.now();
                    }
                }).catch((error) => {
                    const task = this.tasks.get(taskId);
                    if (task) {
                        task.status = 'failed';
                        task.error = error.message;
                        task.failedAt = Date.now();
                    }
                });

                res.json({ 
                    success: true, 
                    taskId: taskId,
                    message: 'Training started'
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ml/models/:id/generate-audio', async (req, res) => {
            try {
                const modelId = req.params.id;
                const { prompt, config } = req.body;
                
                const result = await this.mlEngine.generateAudio(modelId, prompt, config);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ml/models/:id/process-audio', async (req, res) => {
            try {
                const modelId = req.params.id;
                const { audioData, config } = req.body;
                
                const result = await this.mlEngine.processAudio(modelId, audioData, config);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ml/models/:id/save', async (req, res) => {
            try {
                const modelId = req.params.id;
                const { path: savePath } = req.body;
                
                const success = await this.mlEngine.saveModel(modelId, savePath);
                res.json({ success, message: success ? 'Model saved successfully' : 'Failed to save model' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.delete('/api/ml/models/:id', (req, res) => {
            try {
                const success = this.mlEngine.unloadModel(req.params.id);
                res.json({ success, message: success ? 'Model unloaded' : 'Model not found' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Task management routes
        this.app.get('/api/tasks', (req, res) => {
            const tasks = Array.from(this.tasks.values());
            res.json({ tasks });
        });

        this.app.get('/api/tasks/:id', (req, res) => {
            const task = this.tasks.get(req.params.id);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json({ task });
        });

        this.app.delete('/api/tasks/:id', (req, res) => {
            const success = this.tasks.delete(req.params.id);
            res.json({ success, message: success ? 'Task deleted' : 'Task not found' });
        });

        // Data management routes
        this.app.post('/api/data/upload', this.upload.array('files'), async (req, res) => {
            try {
                const files = req.files.map(file => ({
                    originalname: file.originalname,
                    filename: file.filename,
                    path: file.path,
                    size: file.size,
                    mimetype: file.mimetype
                }));

                res.json({ 
                    success: true, 
                    files: files,
                    message: `${files.length} file(s) uploaded successfully`
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/data/preprocess', async (req, res) => {
            try {
                const { files, type, config } = req.body;
                
                // Create async task for preprocessing
                const taskId = uuidv4();
                this.tasks.set(taskId, {
                    id: taskId,
                    type: 'preprocessing',
                    status: 'running',
                    progress: 0,
                    startedAt: Date.now(),
                    files: files
                });

                // Simulate preprocessing (in real implementation, this would process the actual data)
                setTimeout(() => {
                    const task = this.tasks.get(taskId);
                    if (task) {
                        task.status = 'completed';
                        task.progress = 100;
                        task.completedAt = Date.now();
                        task.outputPath = './training_data/processed';
                    }
                }, 2000);

                res.json({ 
                    success: true, 
                    taskId: taskId,
                    message: 'Preprocessing started'
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Audio utilities
        this.app.post('/api/audio/convert', async (req, res) => {
            try {
                const { inputPath, outputPath, format, config } = req.body;
                
                // Simulate audio conversion
                const taskId = uuidv4();
                this.tasks.set(taskId, {
                    id: taskId,
                    type: 'audio-conversion',
                    status: 'running',
                    progress: 0,
                    startedAt: Date.now()
                });

                // Simulate conversion process
                setTimeout(() => {
                    const task = this.tasks.get(taskId);
                    if (task) {
                        task.status = 'completed';
                        task.progress = 100;
                        task.completedAt = Date.now();
                        task.outputPath = outputPath;
                    }
                }, 1500);

                res.json({ 
                    success: true, 
                    taskId: taskId,
                    message: 'Audio conversion started'
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // System utilities
        this.app.get('/api/system/info', (req, res) => {
            res.json({
                system: {
                    platform: process.platform,
                    arch: process.arch,
                    nodeVersion: process.version,
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage()
                },
                mlEngine: this.mlEngine.getSystemInfo(),
                activeTasks: this.tasks.size
            });
        });

        this.app.post('/api/system/cleanup', async (req, res) => {
            try {
                await this.mlEngine.cleanup();
                
                // Clear completed tasks older than 1 hour
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                for (const [taskId, task] of this.tasks) {
                    if (task.status === 'completed' && task.completedAt < oneHourAgo) {
                        this.tasks.delete(taskId);
                    }
                }

                res.json({ 
                    success: true, 
                    message: 'System cleanup completed' 
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Default route
        this.app.get('/', (req, res) => {
            res.json({
                name: 'Creator AI Internal API',
                version: '1.0.0',
                status: 'running',
                endpoints: [
                    'GET /health',
                    'POST /api/ml/initialize',
                    'GET /api/ml/models',
                    'POST /api/ml/models/create',
                    'POST /api/ml/models/:id/train',
                    'POST /api/ml/models/:id/generate-audio',
                    'POST /api/ml/models/:id/process-audio',
                    'GET /api/tasks',
                    'POST /api/data/upload',
                    'POST /api/data/preprocess',
                    'GET /api/system/info'
                ]
            });
        });
    }

    async start() {
        try {
            // Initialize ML Engine
            await this.mlEngine.initialize();
            
            // Start server
            this.server = this.app.listen(this.port, this.host, () => {
                console.log(`Creator AI Internal API server running on http://${this.host}:${this.port}`);
                console.log('Available endpoints:');
                console.log('  GET  /health - Health check');
                console.log('  POST /api/ml/initialize - Initialize ML engine');
                console.log('  GET  /api/ml/models - List all models');
                console.log('  POST /api/ml/models/create - Create new model');
                console.log('  POST /api/ml/models/:id/train - Train a model');
                console.log('  POST /api/ml/models/:id/generate-audio - Generate audio');
                console.log('  GET  /api/tasks - List all tasks');
                console.log('  POST /api/data/upload - Upload training data');
                console.log('  GET  /api/system/info - System information');
            });

            return true;
        } catch (error) {
            console.error('Failed to start API server:', error);
            return false;
        }
    }

    async stop() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log('API server stopped');
                    resolve();
                });
            });
        }
    }

    async cleanup() {
        await this.mlEngine.cleanup();
        await this.stop();
    }
}

// Create and export server instance
const server = new APIServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await server.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await server.cleanup();
    process.exit(0);
});

module.exports = APIServer;

// Start server if this file is run directly
if (require.main === module) {
    server.start().catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}