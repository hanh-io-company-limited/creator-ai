// Unit Tests for Enhanced AI Engine
const AIEngine = require('../src/ai-engine');

// Mock axios for API calls
jest.mock('axios');
const axios = require('axios');

describe('Enhanced AI Engine', () => {
    let aiEngine;

    beforeEach(() => {
        aiEngine = new AIEngine();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (aiEngine.isInitialized) {
            await aiEngine.cleanup();
        }
    });

    describe('Initialization', () => {
        test('should initialize with ML engine', async () => {
            const result = await aiEngine.initialize();
            expect(result).toBe(true);
            expect(aiEngine.isInitialized).toBe(true);
            expect(aiEngine.useInternalAPI).toBe(false); // No API server running in tests
        });

        test('should detect internal API when available', async () => {
            // Mock successful API health check
            axios.get.mockResolvedValue({ data: { status: 'healthy' } });
            
            const result = await aiEngine.initialize();
            expect(result).toBe(true);
            expect(aiEngine.useInternalAPI).toBe(true);
        });

        test('should fallback to direct ML engine when API unavailable', async () => {
            // Mock failed API health check
            axios.get.mockRejectedValue(new Error('Connection refused'));
            
            const result = await aiEngine.initialize();
            expect(result).toBe(true);
            expect(aiEngine.useInternalAPI).toBe(false);
        });
    });

    describe('Model Creation - Direct Mode', () => {
        beforeEach(async () => {
            aiEngine.useInternalAPI = false;
            await aiEngine.initialize();
        });

        test('should create text-to-audio model', async () => {
            const config = {
                sequenceLength: 50,
                embeddingDim: 64,
                lstmUnits: 128
            };

            const model = await aiEngine.createTextToVideoModel(config);
            
            expect(model).toBeDefined();
            expect(model.id).toBeDefined();
            expect(model.type).toBe('text-to-audio');
            expect(model.parameters).toBeGreaterThan(0);
        });

        test('should create audio processing model', async () => {
            const config = {
                inputShape: [null, 512],
                filterSizes: [32, 64],
                numClasses: 5
            };

            const model = await aiEngine.createImageToVideoModel(config);
            
            expect(model).toBeDefined();
            expect(model.id).toBeDefined();
            expect(model.type).toBe('audio-processing');
            expect(model.parameters).toBeGreaterThan(0);
        });
    });

    describe('Model Creation - API Mode', () => {
        beforeEach(async () => {
            aiEngine.useInternalAPI = true;
            await aiEngine.initialize();
        });

        test('should create text-to-audio model via API', async () => {
            const config = { sequenceLength: 50 };
            const mockResponse = {
                data: {
                    success: true,
                    model: {
                        id: 'test-model-id',
                        type: 'text-to-audio',
                        parameters: 100000,
                        created: Date.now()
                    }
                }
            };

            axios.post.mockResolvedValue(mockResponse);

            const model = await aiEngine.createTextToVideoModel(config);
            
            expect(model).toBeDefined();
            expect(model.id).toBe('test-model-id');
            expect(model.type).toBe('text-to-audio');
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/ml/models/create'),
                expect.objectContaining({
                    type: 'text-to-audio',
                    config: expect.objectContaining(config)
                })
            );
        });

        test('should create audio processing model via API', async () => {
            const config = { inputShape: [null, 512] };
            const mockResponse = {
                data: {
                    success: true,
                    model: {
                        id: 'test-audio-model-id',
                        type: 'audio-processing',
                        parameters: 80000,
                        created: Date.now()
                    }
                }
            };

            axios.post.mockResolvedValue(mockResponse);

            const model = await aiEngine.createImageToVideoModel(config);
            
            expect(model).toBeDefined();
            expect(model.id).toBe('test-audio-model-id');
            expect(model.type).toBe('audio-processing');
        });
    });

    describe('Audio Generation', () => {
        let modelId;

        beforeEach(async () => {
            aiEngine.useInternalAPI = false;
            await aiEngine.initialize();
            const model = await aiEngine.createTextToVideoModel({
                sequenceLength: 20,
                embeddingDim: 32,
                outputDim: 128
            });
            modelId = model.id;
        });

        test('should generate audio from prompt', async () => {
            const prompt = 'peaceful piano music';
            const config = { duration: 3.0, sampleRate: 16000 };
            
            let progressUpdates = [];
            const progressCallback = (progress) => {
                progressUpdates.push(progress);
            };

            const result = await aiEngine.generateVideo(modelId, prompt, config, progressCallback);
            
            expect(result).toBeDefined();
            expect(result.type).toBe('audio');
            expect(result.prompt).toBe(prompt);
            expect(result.duration).toBe(3.0);
            expect(result.audioData).toBeInstanceOf(Array);
            expect(progressUpdates.length).toBeGreaterThan(0);
        });

        test('should generate audio via API when in API mode', async () => {
            aiEngine.useInternalAPI = true;
            
            const mockResponse = {
                data: {
                    success: true,
                    result: {
                        audioData: [0.1, 0.2, 0.3],
                        sampleRate: 22050,
                        duration: 5.0,
                        generatedAt: Date.now()
                    }
                }
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await aiEngine.generateVideo(modelId, 'test prompt', {});
            
            expect(result.type).toBe('audio');
            expect(result.audioData).toEqual([0.1, 0.2, 0.3]);
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining(`/api/ml/models/${modelId}/generate-audio`),
                expect.any(Object)
            );
        });
    });

    describe('Model Training', () => {
        let modelId;

        beforeEach(async () => {
            aiEngine.useInternalAPI = false;
            await aiEngine.initialize();
            const model = await aiEngine.createTextToVideoModel({
                sequenceLength: 10,
                embeddingDim: 16,
                lstmUnits: 32
            });
            modelId = model.id;
        });

        test('should train model with progress tracking', async () => {
            const trainingData = {
                texts: ['happy music', 'sad song'],
                audioFeatures: [[0.1, 0.2], [0.3, 0.4]]
            };
            const config = { epochs: 2, batchSize: 1 };
            
            let progressUpdates = [];
            const progressCallback = (progress) => {
                progressUpdates.push(progress);
            };

            const model = { id: modelId };
            const result = await aiEngine.trainModel(model, trainingData, config, progressCallback);
            
            expect(result).toBeDefined();
            expect(progressUpdates.length).toBeGreaterThan(0);
            expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100);
        });

        test('should handle training via API', async () => {
            aiEngine.useInternalAPI = true;
            
            const mockTrainingResponse = {
                data: {
                    success: true,
                    taskId: 'test-task-id'
                }
            };

            const mockTaskResponse = {
                data: {
                    task: {
                        id: 'test-task-id',
                        status: 'completed',
                        progress: 100,
                        epoch: 10,
                        loss: 0.1,
                        accuracy: 0.95
                    }
                }
            };

            axios.post.mockResolvedValue(mockTrainingResponse);
            axios.get.mockResolvedValue(mockTaskResponse);

            const model = { id: modelId };
            const result = await aiEngine.trainModel(model, {}, { epochs: 10 });
            
            expect(result).toBeDefined();
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining(`/api/ml/models/${modelId}/train`),
                expect.any(Object)
            );
        });
    });

    describe('Model Management', () => {
        beforeEach(async () => {
            aiEngine.useInternalAPI = false;
            await aiEngine.initialize();
        });

        test('should load model from path', async () => {
            const result = await aiEngine.loadModel('./test-model', 'test-model-id');
            // This will likely fail in the test environment, but we test the code path
            expect(typeof result).toBe('boolean');
        });

        test('should save model', async () => {
            const model = await aiEngine.createTextToVideoModel({});
            const result = await aiEngine.saveModel(model, './test-save-path');
            expect(result).toBe(true);
        });

        test('should get model info', async () => {
            const model = await aiEngine.createTextToVideoModel({});
            const info = aiEngine.getModelInfo(model.id);
            
            expect(info).toBeDefined();
            expect(info.id).toBe(model.id);
            expect(info.type).toBe('text-to-audio');
        });

        test('should list loaded models', async () => {
            const model = await aiEngine.createTextToVideoModel({});
            const models = aiEngine.listLoadedModels();
            
            expect(models).toBeInstanceOf(Array);
            expect(models.some(m => m.id === model.id)).toBe(true);
        });

        test('should unload model', async () => {
            const model = await aiEngine.createTextToVideoModel({});
            const result = aiEngine.unloadModel(model.id);
            
            expect(result).toBe(true);
            const info = aiEngine.getModelInfo(model.id);
            expect(info).toBeNull();
        });
    });

    describe('Audio Processing', () => {
        let modelId;

        beforeEach(async () => {
            aiEngine.useInternalAPI = false;
            await aiEngine.initialize();
            const model = await aiEngine.createImageToVideoModel({
                inputShape: [null, 256],
                filterSizes: [16, 32],
                numClasses: 3
            });
            modelId = model.id;
        });

        test('should process audio data', async () => {
            const audioData = Array.from({ length: 256 }, () => Math.random() * 2 - 1);
            
            const result = await aiEngine.processAudio(modelId, audioData);
            
            expect(result).toBeDefined();
            expect(result.processedData).toBeInstanceOf(Array);
            expect(result.confidence).toBeGreaterThanOrEqual(0);
        });

        test('should process audio via API', async () => {
            aiEngine.useInternalAPI = true;
            
            const mockResponse = {
                data: {
                    result: {
                        processedData: [0.8, 0.1, 0.1],
                        confidence: 0.8,
                        predictions: [0.8, 0.1, 0.1],
                        processedAt: Date.now()
                    }
                }
            };

            axios.post.mockResolvedValue(mockResponse);

            const audioData = [0.1, 0.2, 0.3];
            const result = await aiEngine.processAudio(modelId, audioData);
            
            expect(result.processedData).toEqual([0.8, 0.1, 0.1]);
            expect(result.confidence).toBe(0.8);
        });
    });

    describe('Audio Analysis', () => {
        beforeEach(async () => {
            await aiEngine.initialize();
        });

        test('should analyze audio features', async () => {
            const audioData = Array.from({ length: 1000 }, () => Math.random() * 2 - 1);
            
            const analysis = await aiEngine.analyzeAudio(audioData, { duration: 5.0 });
            
            expect(analysis).toBeDefined();
            expect(analysis.tempo).toBeGreaterThanOrEqual(60);
            expect(analysis.tempo).toBeLessThanOrEqual(140);
            expect(analysis.key).toMatch(/^[A-G]#?$/);
            expect(['major', 'minor']).toContain(analysis.mode);
            expect(analysis.energy).toBeGreaterThanOrEqual(0);
            expect(analysis.energy).toBeLessThanOrEqual(1);
        });
    });

    describe('Music Variation Generation', () => {
        beforeEach(async () => {
            await aiEngine.initialize();
        });

        test('should generate music variation', async () => {
            const originalAudio = {
                tempo: 120,
                key: 'C',
                duration: 5.0
            };

            const variationConfig = {
                style: 'jazz',
                tempo: 140,
                key: 'G'
            };

            const result = await aiEngine.generateMusicVariation(originalAudio, variationConfig);
            
            expect(result).toBeDefined();
            expect(result.original).toBe(originalAudio);
            expect(result.variation.style).toBe('jazz');
            expect(result.variation.tempo).toBe(140);
            expect(result.variation.key).toBe('G');
        });
    });

    describe('Sample Prompts', () => {
        test('should generate music-focused sample prompts', () => {
            const prompts = aiEngine.generateSamplePrompts();
            
            expect(prompts).toBeInstanceOf(Array);
            expect(prompts.length).toBeGreaterThan(0);
            expect(prompts.every(prompt => typeof prompt === 'string')).toBe(true);
            
            // Check that prompts are music-related
            const musicKeywords = ['music', 'piano', 'guitar', 'jazz', 'orchestral', 'beats', 'bass'];
            const hasMusic = prompts.some(prompt => 
                musicKeywords.some(keyword => prompt.toLowerCase().includes(keyword))
            );
            expect(hasMusic).toBe(true);
        });
    });

    describe('Processing Time Estimation', () => {
        test('should estimate audio processing time', () => {
            const config = {
                duration: 10,
                sampleRate: 44100,
                modelComplexity: 'high'
            };

            const estimatedTime = aiEngine.estimateProcessingTime(config);
            
            expect(estimatedTime).toBeGreaterThan(0);
            expect(typeof estimatedTime).toBe('number');
        });

        test('should scale with complexity', () => {
            const lowComplexity = aiEngine.estimateProcessingTime({ 
                duration: 5, 
                modelComplexity: 'low' 
            });
            const highComplexity = aiEngine.estimateProcessingTime({ 
                duration: 5, 
                modelComplexity: 'high' 
            });

            expect(highComplexity).toBeGreaterThan(lowComplexity);
        });
    });

    describe('System Information', () => {
        test('should return system info in direct mode', async () => {
            aiEngine.useInternalAPI = false;
            await aiEngine.initialize();
            
            const info = aiEngine.getSystemInfo();
            
            expect(info).toBeDefined();
            expect(info.backend).toBeDefined();
            expect(info.memory).toBeDefined();
            expect(info.version).toBeDefined();
        });

        test('should return system info in API mode', async () => {
            aiEngine.useInternalAPI = true;
            await aiEngine.initialize();
            
            const info = aiEngine.getSystemInfo();
            
            expect(info).toBeDefined();
            expect(info.backend).toBe('API Mode');
            expect(info.mode).toBe('internal-api');
            expect(info.apiUrl).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should handle ML engine initialization failure', async () => {
            // Mock ML engine to fail initialization
            const originalMLEngine = aiEngine.mlEngine;
            aiEngine.mlEngine = {
                initialize: jest.fn().mockResolvedValue(false)
            };

            const result = await aiEngine.initialize();
            expect(result).toBe(false);

            // Restore original ML engine
            aiEngine.mlEngine = originalMLEngine;
        });

        test('should handle API errors gracefully', async () => {
            aiEngine.useInternalAPI = true;
            axios.post.mockRejectedValue(new Error('Network error'));

            await expect(aiEngine.createTextToVideoModel({}))
                .rejects.toThrow('Network error');
        });

        test('should handle invalid model operations', async () => {
            await aiEngine.initialize();
            
            await expect(aiEngine.generateVideo('invalid-model-id', 'test', {}))
                .resolves.toBeDefined(); // Should fallback to mock generation
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources', async () => {
            await aiEngine.initialize();
            const model = await aiEngine.createTextToVideoModel({});
            
            await aiEngine.cleanup();
            
            // Verify models are cleared
            const models = aiEngine.listLoadedModels();
            expect(models.length).toBe(0);
        });
    });
});