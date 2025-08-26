// Integration Tests for API Server
const request = require('supertest');
const APIServer = require('../src/api/server');

describe('API Server Integration Tests', () => {
    let server;
    let app;

    beforeAll(async () => {
        server = new APIServer({ port: 3001 }); // Use different port for tests
        app = server.app;
        await server.start();
    });

    afterAll(async () => {
        await server.cleanup();
    });

    describe('Health Check', () => {
        test('GET /health should return healthy status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
            expect(response.body.timestamp).toBeDefined();
            expect(response.body.uptime).toBeGreaterThan(0);
        });
    });

    describe('ML Engine API', () => {
        test('POST /api/ml/initialize should initialize ML engine', async () => {
            const response = await request(app)
                .post('/api/ml/initialize')
                .send({})
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('GET /api/ml/models should return empty models list initially', async () => {
            const response = await request(app)
                .get('/api/ml/models')
                .expect(200);

            expect(response.body.models).toBeInstanceOf(Array);
        });

        test('POST /api/ml/models/create should create text-to-audio model', async () => {
            const response = await request(app)
                .post('/api/ml/models/create')
                .send({
                    type: 'text-to-audio',
                    config: {
                        sequenceLength: 50,
                        embeddingDim: 64,
                        lstmUnits: 128
                    }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.model.id).toBeDefined();
            expect(response.body.model.type).toBe('text-to-audio');
        });

        test('POST /api/ml/models/create should create audio-processing model', async () => {
            const response = await request(app)
                .post('/api/ml/models/create')
                .send({
                    type: 'audio-processing',
                    config: {
                        inputShape: [null, 512],
                        filterSizes: [32, 64],
                        numClasses: 5
                    }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.model.id).toBeDefined();
            expect(response.body.model.type).toBe('audio-processing');
        });

        test('POST /api/ml/models/create should reject invalid model type', async () => {
            const response = await request(app)
                .post('/api/ml/models/create')
                .send({
                    type: 'invalid-type',
                    config: {}
                })
                .expect(400);

            expect(response.body.error).toContain('Unsupported model type');
        });
    });

    describe('Model Operations', () => {
        let modelId;

        beforeAll(async () => {
            // Create a model for testing
            const response = await request(app)
                .post('/api/ml/models/create')
                .send({
                    type: 'text-to-audio',
                    config: { sequenceLength: 20, embeddingDim: 32 }
                });
            modelId = response.body.model.id;
        });

        test('GET /api/ml/models/:id should return model info', async () => {
            const response = await request(app)
                .get(`/api/ml/models/${modelId}`)
                .expect(200);

            expect(response.body.model.id).toBe(modelId);
            expect(response.body.model.type).toBe('text-to-audio');
        });

        test('GET /api/ml/models/:id should return 404 for non-existent model', async () => {
            await request(app)
                .get('/api/ml/models/non-existent-id')
                .expect(404);
        });

        test('POST /api/ml/models/:id/generate-audio should generate audio', async () => {
            const response = await request(app)
                .post(`/api/ml/models/${modelId}/generate-audio`)
                .send({
                    prompt: 'peaceful piano music',
                    config: { sampleRate: 16000, duration: 1.0 }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.result.audioData).toBeInstanceOf(Array);
            expect(response.body.result.sampleRate).toBe(16000);
            expect(response.body.result.duration).toBe(1.0);
        });

        test('POST /api/ml/models/:id/train should start training', async () => {
            const response = await request(app)
                .post(`/api/ml/models/${modelId}/train`)
                .send({
                    trainingData: {
                        texts: ['happy music', 'sad song'],
                        audioFeatures: [[0.1, 0.2], [0.3, 0.4]]
                    },
                    config: { epochs: 2, batchSize: 1 }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.taskId).toBeDefined();
        });

        test('DELETE /api/ml/models/:id should unload model', async () => {
            const response = await request(app)
                .delete(`/api/ml/models/${modelId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('Task Management', () => {
        test('GET /api/tasks should return tasks list', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);

            expect(response.body.tasks).toBeInstanceOf(Array);
        });

        test('GET /api/tasks/:id should return 404 for non-existent task', async () => {
            await request(app)
                .get('/api/tasks/non-existent-task-id')
                .expect(404);
        });
    });

    describe('Data Management', () => {
        test('POST /api/data/preprocess should start preprocessing', async () => {
            const response = await request(app)
                .post('/api/data/preprocess')
                .send({
                    files: ['test-file.wav'],
                    type: 'audio',
                    config: {}
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.taskId).toBeDefined();
        });

        test('POST /api/audio/convert should start audio conversion', async () => {
            const response = await request(app)
                .post('/api/audio/convert')
                .send({
                    inputPath: '/test/input.wav',
                    outputPath: '/test/output.mp3',
                    format: 'mp3'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.taskId).toBeDefined();
        });
    });

    describe('System Operations', () => {
        test('GET /api/system/info should return system information', async () => {
            const response = await request(app)
                .get('/api/system/info')
                .expect(200);

            expect(response.body.system).toBeDefined();
            expect(response.body.mlEngine).toBeDefined();
            expect(response.body.activeTasks).toBeDefined();
        });

        test('POST /api/system/cleanup should perform cleanup', async () => {
            const response = await request(app)
                .post('/api/system/cleanup')
                .send({})
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should handle 404 for non-existent routes', async () => {
            await request(app)
                .get('/non-existent-route')
                .expect(404);
        });

        test('should handle malformed JSON', async () => {
            await request(app)
                .post('/api/ml/models/create')
                .send('invalid json')
                .expect(400);
        });
    });

    describe('File Upload', () => {
        test('POST /api/data/upload should handle file uploads', async () => {
            const testFile = Buffer.from('test audio data');
            
            const response = await request(app)
                .post('/api/data/upload')
                .attach('files', testFile, 'test.wav')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.files).toBeInstanceOf(Array);
            expect(response.body.files.length).toBe(1);
            expect(response.body.files[0].originalname).toBe('test.wav');
        });
    });

    describe('Async Task Tracking', () => {
        let taskId;

        test('should track async tasks', async () => {
            // Start a preprocessing task
            const response = await request(app)
                .post('/api/data/preprocess')
                .send({
                    files: ['test-file.wav'],
                    type: 'audio',
                    config: {}
                });
            
            taskId = response.body.taskId;

            // Check task status
            const taskResponse = await request(app)
                .get(`/api/tasks/${taskId}`)
                .expect(200);

            expect(taskResponse.body.task.id).toBe(taskId);
            expect(taskResponse.body.task.type).toBe('preprocessing');
            expect(['running', 'completed', 'failed']).toContain(taskResponse.body.task.status);
        });

        test('should delete tasks', async () => {
            if (taskId) {
                const response = await request(app)
                    .delete(`/api/tasks/${taskId}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
            }
        });
    });

    describe('Root Endpoint', () => {
        test('GET / should return API information', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.body.name).toBe('Creator AI Internal API');
            expect(response.body.version).toBeDefined();
            expect(response.body.status).toBe('running');
            expect(response.body.endpoints).toBeInstanceOf(Array);
        });
    });

    describe('Audio Processing Models', () => {
        let audioModelId;

        beforeAll(async () => {
            // Create an audio processing model
            const response = await request(app)
                .post('/api/ml/models/create')
                .send({
                    type: 'audio-processing',
                    config: { 
                        inputShape: [null, 256],
                        filterSizes: [16, 32],
                        numClasses: 3
                    }
                });
            audioModelId = response.body.model.id;
        });

        test('POST /api/ml/models/:id/process-audio should process audio', async () => {
            const audioData = Array.from({ length: 256 }, () => Math.random() * 2 - 1);
            
            const response = await request(app)
                .post(`/api/ml/models/${audioModelId}/process-audio`)
                .send({
                    audioData: audioData,
                    config: {}
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.result.processedData).toBeInstanceOf(Array);
            expect(response.body.result.confidence).toBeGreaterThanOrEqual(0);
        });

        afterAll(async () => {
            // Clean up the model
            await request(app).delete(`/api/ml/models/${audioModelId}`);
        });
    });

    describe('Performance', () => {
        test('should handle multiple concurrent requests', async () => {
            const requests = Array.from({ length: 5 }, () => 
                request(app).get('/health')
            );

            const responses = await Promise.all(requests);
            
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.status).toBe('healthy');
            });
        });

        test('should respond within reasonable time', async () => {
            const startTime = Date.now();
            
            await request(app)
                .get('/health')
                .expect(200);
            
            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        });
    });
});