// Unit Tests for ML Engine
const MLEngine = require('../src/ai/ml-engine');

describe('MLEngine', () => {
    let mlEngine;

    beforeEach(() => {
        mlEngine = new MLEngine();
    });

    afterEach(async () => {
        if (mlEngine.isInitialized) {
            await mlEngine.cleanup();
        }
    });

    describe('Initialization', () => {
        test('should initialize successfully', async () => {
            const result = await mlEngine.initialize();
            expect(result).toBe(true);
            expect(mlEngine.isInitialized).toBe(true);
        });

        test('should handle initialization errors gracefully', async () => {
            // Test with invalid config
            const result = await mlEngine.initialize({ backend: 'invalid' });
            expect(result).toBe(true); // Should still succeed with default backend
        });
    });

    describe('Model Creation', () => {
        beforeEach(async () => {
            await mlEngine.initialize();
        });

        test('should create text-to-audio model', async () => {
            const config = {
                sequenceLength: 50,
                embeddingDim: 64,
                lstmUnits: 128
            };

            const model = await mlEngine.createTextToAudioModel(config);
            
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

            const model = await mlEngine.createAudioProcessingModel(config);
            
            expect(model).toBeDefined();
            expect(model.id).toBeDefined();
            expect(model.type).toBe('audio-processing');
            expect(model.parameters).toBeGreaterThan(0);
        });
    });

    describe('Model Management', () => {
        let modelId;

        beforeEach(async () => {
            await mlEngine.initialize();
            const model = await mlEngine.createTextToAudioModel({});
            modelId = model.id;
        });

        test('should get model info', () => {
            const info = mlEngine.getModelInfo(modelId);
            expect(info).toBeDefined();
            expect(info.id).toBe(modelId);
            expect(info.type).toBe('text-to-audio');
        });

        test('should list loaded models', () => {
            const models = mlEngine.listLoadedModels();
            expect(models).toBeInstanceOf(Array);
            expect(models.length).toBeGreaterThan(0);
            expect(models.some(m => m.id === modelId)).toBe(true);
        });

        test('should unload model', () => {
            const result = mlEngine.unloadModel(modelId);
            expect(result).toBe(true);
            
            const info = mlEngine.getModelInfo(modelId);
            expect(info).toBeNull();
        });
    });

    describe('Audio Generation', () => {
        let modelId;

        beforeEach(async () => {
            await mlEngine.initialize();
            const model = await mlEngine.createTextToAudioModel({
                sequenceLength: 20, // Smaller for faster tests
                embeddingDim: 32,
                lstmUnits: 64,
                outputDim: 256
            });
            modelId = model.id;
        });

        test('should generate audio from text', async () => {
            const prompt = 'peaceful piano music';
            const config = { sampleRate: 16000, duration: 2.0 };

            const result = await mlEngine.generateAudio(modelId, prompt, config);
            
            expect(result).toBeDefined();
            expect(result.audioData).toBeInstanceOf(Array);
            expect(result.sampleRate).toBe(16000);
            expect(result.duration).toBe(2.0);
            expect(result.prompt).toBe(prompt);
        });

        test('should fail with invalid model ID', async () => {
            await expect(mlEngine.generateAudio('invalid-id', 'test', {}))
                .rejects.toThrow('Model invalid-id not found');
        });
    });

    describe('Audio Processing', () => {
        let modelId;

        beforeEach(async () => {
            await mlEngine.initialize();
            const model = await mlEngine.createAudioProcessingModel({
                inputShape: [null, 256], // Smaller for faster tests
                filterSizes: [16, 32],
                numClasses: 3
            });
            modelId = model.id;
        });

        test('should process audio data', async () => {
            const audioData = Array.from({ length: 256 }, () => Math.random() * 2 - 1);
            const config = {};

            const result = await mlEngine.processAudio(modelId, audioData, config);
            
            expect(result).toBeDefined();
            expect(result.processedData).toBeInstanceOf(Array);
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.predictions).toBeInstanceOf(Array);
        });
    });

    describe('Model Training', () => {
        let modelId;

        beforeEach(async () => {
            await mlEngine.initialize();
            const model = await mlEngine.createTextToAudioModel({
                sequenceLength: 10, // Very small for fast tests
                embeddingDim: 16,
                lstmUnits: 32,
                outputDim: 64
            });
            modelId = model.id;
        });

        test('should train model with progress callback', async () => {
            const trainingData = {
                texts: ['test music', 'happy song'],
                audioFeatures: [[0.1, 0.2], [0.3, 0.4]] // Mock features
            };
            
            const config = { epochs: 2, batchSize: 1 };
            const progressUpdates = [];
            
            const progressCallback = (progress) => {
                progressUpdates.push(progress);
            };

            const result = await mlEngine.trainModel(
                modelId, 
                trainingData, 
                null, 
                config, 
                progressCallback
            );
            
            expect(result).toBeDefined();
            expect(progressUpdates.length).toBeGreaterThan(0);
            expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100);
        });
    });

    describe('Model Persistence', () => {
        let modelId;
        const testModelPath = './test-models/test-model';

        beforeEach(async () => {
            await mlEngine.initialize();
            const model = await mlEngine.createTextToAudioModel({});
            modelId = model.id;
        });

        afterEach(async () => {
            // Clean up test model files
            try {
                const fs = require('fs').promises;
                await fs.rmdir('./test-models', { recursive: true });
            } catch (error) {
                // Ignore cleanup errors
            }
        });

        test('should save model to disk', async () => {
            const result = await mlEngine.saveModel(modelId, testModelPath);
            expect(result).toBe(true);

            // Verify files exist
            const fs = require('fs').promises;
            const modelJsonExists = await fs.access(`${testModelPath}/model.json`)
                .then(() => true).catch(() => false);
            expect(modelJsonExists).toBe(true);
        });

        test('should load model from disk', async () => {
            // First save a model
            await mlEngine.saveModel(modelId, testModelPath);
            
            // Create new engine instance and load the model
            const newEngine = new MLEngine();
            await newEngine.initialize();
            
            const loadResult = await newEngine.loadModelFromPath(testModelPath, 'loaded-model');
            expect(loadResult).toBe(true);
            
            const modelInfo = newEngine.getModelInfo('loaded-model');
            expect(modelInfo).toBeDefined();
            expect(modelInfo.type).toBe('text-to-audio');
            
            await newEngine.cleanup();
        });
    });

    describe('System Information', () => {
        test('should return system info when not initialized', () => {
            const info = mlEngine.getSystemInfo();
            expect(info.backend).toBe('Not initialized');
        });

        test('should return system info when initialized', async () => {
            await mlEngine.initialize();
            const info = mlEngine.getSystemInfo();
            
            expect(info.backend).toBeDefined();
            expect(info.memory).toBeDefined();
            expect(info.version).toBeDefined();
            expect(info.modelsLoaded).toBe(0);
        });
    });

    describe('Data Preparation', () => {
        beforeEach(async () => {
            await mlEngine.initialize();
        });

        test('should prepare text-to-audio training data', () => {
            const data = {
                texts: ['happy music', 'sad song'],
                audioFeatures: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
            };
            
            const result = mlEngine.prepareTrainingData(data, 'text-to-audio');
            
            expect(result.xs).toBeDefined();
            expect(result.ys).toBeDefined();
            
            // Clean up tensors
            result.xs.dispose();
            result.ys.dispose();
        });

        test('should prepare audio processing training data', () => {
            const data = {
                audioFeatures: [[0.1, 0.2], [0.3, 0.4]],
                labels: [[1, 0], [0, 1]]
            };
            
            const result = mlEngine.prepareTrainingData(data, 'audio-processing');
            
            expect(result.xs).toBeDefined();
            expect(result.ys).toBeDefined();
            
            // Clean up tensors
            result.xs.dispose();
            result.ys.dispose();
        });
    });

    describe('Text Tokenization', () => {
        beforeEach(async () => {
            await mlEngine.initialize();
        });

        test('should tokenize text to numbers', () => {
            const text = 'happy music with piano';
            const tokens = mlEngine.textToTokens(text, 10);
            
            expect(tokens).toBeInstanceOf(Array);
            expect(tokens.length).toBe(10);
            expect(tokens.every(token => typeof token === 'number')).toBe(true);
        });

        test('should pad short text', () => {
            const text = 'short';
            const tokens = mlEngine.textToTokens(text, 10);
            
            expect(tokens.length).toBe(10);
            expect(tokens.filter(token => token === 0).length).toBeGreaterThan(0);
        });

        test('should truncate long text', () => {
            const text = 'very long text that should be truncated to fit the maximum length';
            const tokens = mlEngine.textToTokens(text, 5);
            
            expect(tokens.length).toBe(5);
        });
    });
});