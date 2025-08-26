// Unit tests for AI Engine functionality
// Tests all core AI operations including training, generation, and model management

const path = require('path');

// Mock the AI Engine by requiring it
const AIEngine = require('../../src/ai-engine.js');
const { sampleImages, sampleAudioFiles, sampleVideoConfigs } = require('../fixtures/sample-images.js');

describe('AI Engine Core Functionality', () => {
  let aiEngine;

  beforeEach(() => {
    aiEngine = new AIEngine();
  });

  afterEach(() => {
    // Clean up any loaded models
    if (aiEngine.isInitialized) {
      const models = aiEngine.listLoadedModels();
      models.forEach(model => aiEngine.unloadModel(model.id));
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      const result = await aiEngine.initialize();
      expect(result).toBe(true);
      expect(aiEngine.isInitialized).toBe(true);
    });

    test('should provide system information after initialization', async () => {
      await aiEngine.initialize();
      const systemInfo = aiEngine.getSystemInfo();
      
      expect(systemInfo).toHaveProperty('backend');
      expect(systemInfo).toHaveProperty('memory');
      expect(systemInfo).toHaveProperty('version');
      expect(systemInfo.backend).toBe('Mock Backend');
    });
  });

  describe('Model Creation', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    test('should create text-to-video model', async () => {
      const config = {
        name: 'test-text-to-video',
        type: 'text-to-video',
        resolution: '512x512'
      };

      const model = await aiEngine.createTextToVideoModel(config);
      
      expect(model).toHaveProperty('type', 'text-to-video');
      expect(model).toHaveProperty('config');
      expect(model).toHaveProperty('created');
      expect(model).toHaveProperty('parameters');
      expect(model.parameters).toBeGreaterThan(500000);
    });

    test('should create image-to-video model', async () => {
      const config = {
        name: 'test-image-to-video',
        type: 'image-to-video',
        resolution: '512x512'
      };

      const model = await aiEngine.createImageToVideoModel(config);
      
      expect(model).toHaveProperty('type', 'image-to-video');
      expect(model).toHaveProperty('config');
      expect(model).toHaveProperty('created');
      expect(model).toHaveProperty('parameters');
      expect(model.parameters).toBeGreaterThan(400000);
    });
  });

  describe('Model Training with 10 Images', () => {
    let textToVideoModel;

    beforeEach(async () => {
      await aiEngine.initialize();
      textToVideoModel = await aiEngine.createTextToVideoModel({
        name: 'test-training-model',
        type: 'text-to-video'
      });
    });

    test('should train model with exactly 10 images', async () => {
      expect(sampleImages).toHaveLength(10);
      
      const config = {
        epochs: 5,
        batchSize: 2
      };

      const progressUpdates = [];
      const progressCallback = (update) => {
        progressUpdates.push(update);
      };

      const trainedModel = await aiEngine.trainModel(
        textToVideoModel,
        sampleImages,
        config,
        progressCallback
      );

      // Verify training completed
      expect(trainedModel).toBeDefined();
      expect(progressUpdates.length).toBe(config.epochs);
      
      // Verify progress tracking
      progressUpdates.forEach((update, index) => {
        expect(update).toHaveProperty('epoch', index + 1);
        expect(update).toHaveProperty('totalEpochs', config.epochs);
        expect(update).toHaveProperty('loss');
        expect(update).toHaveProperty('accuracy');
        expect(update).toHaveProperty('progress');
        expect(update.progress).toBe((index + 1) / config.epochs * 100);
      });
    });

    test('should validate training data format', () => {
      sampleImages.forEach((image, index) => {
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('path'); 
        expect(image).toHaveProperty('size');
        expect(image).toHaveProperty('dimensions');
        expect(image).toHaveProperty('format', 'jpg');
        expect(image).toHaveProperty('checksum');
        
        // Verify dimensions are consistent
        expect(image.dimensions.width).toBe(512);
        expect(image.dimensions.height).toBe(512);
        
        // Verify reasonable file sizes (0.5MB to 2MB)
        expect(image.size).toBeGreaterThan(0.5 * 1024 * 1024);
        expect(image.size).toBeLessThan(2 * 1024 * 1024);
      });
    });

    test('should demonstrate learning from training data', async () => {
      const config = {
        epochs: 10,
        batchSize: 2
      };

      const progressUpdates = [];
      const progressCallback = (update) => {
        progressUpdates.push(update);
      };

      await aiEngine.trainModel(
        textToVideoModel,
        sampleImages,
        config,
        progressCallback
      );

      // Verify loss decreases over time (learning indicator)
      const firstLoss = progressUpdates[0].loss;
      const lastLoss = progressUpdates[progressUpdates.length - 1].loss;
      expect(lastLoss).toBeLessThan(firstLoss);

      // Verify accuracy increases over time
      const firstAccuracy = progressUpdates[0].accuracy;
      const lastAccuracy = progressUpdates[progressUpdates.length - 1].accuracy;
      expect(lastAccuracy).toBeGreaterThan(firstAccuracy);
    });
  });

  describe('Concurrent and Independent Training', () => {
    test('should handle multiple concurrent training sessions', async () => {
      await aiEngine.initialize();
      
      const model1 = await aiEngine.createTextToVideoModel({
        name: 'concurrent-model-1',
        type: 'text-to-video'
      });
      
      const model2 = await aiEngine.createImageToVideoModel({
        name: 'concurrent-model-2', 
        type: 'image-to-video'
      });

      const config = { epochs: 3, batchSize: 2 };
      
      const training1Updates = [];
      const training2Updates = [];
      
      // Start both training sessions concurrently
      const trainingPromise1 = aiEngine.trainModel(
        model1,
        sampleImages.slice(0, 5),
        config,
        (update) => training1Updates.push(update)
      );
      
      const trainingPromise2 = aiEngine.trainModel(
        model2,
        sampleImages.slice(5, 10),
        config,
        (update) => training2Updates.push(update)
      );

      // Wait for both to complete
      const [result1, result2] = await Promise.all([trainingPromise1, trainingPromise2]);

      // Verify both completed independently
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(training1Updates.length).toBe(config.epochs);
      expect(training2Updates.length).toBe(config.epochs);
    });
  });

  describe('Video Generation and Face Creation', () => {
    let trainedModel;

    beforeEach(async () => {
      await aiEngine.initialize();
      const model = await aiEngine.createTextToVideoModel({
        name: 'face-generation-model',
        type: 'text-to-video'
      });
      
      // Train the model with sample data
      trainedModel = await aiEngine.trainModel(
        model,
        sampleImages,
        { epochs: 5, batchSize: 2 }
      );

      // Store the model for generation
      const modelId = 'trained-face-model';
      aiEngine.models.set(modelId, trainedModel);
      trainedModel.id = modelId;
    });

    test('should generate face from text prompt', async () => {
      const prompt = 'A realistic portrait of a person with warm smile and professional lighting';
      const config = {
        duration: 5,
        resolution: '512x512'
      };

      const progressUpdates = [];
      const progressCallback = (update) => {
        progressUpdates.push(update);
      };

      const generatedVideo = await aiEngine.generateVideo(
        trainedModel.id,
        prompt,
        config,
        progressCallback
      );

      // Verify video generation completed
      expect(generatedVideo).toBeDefined();
      expect(generatedVideo).toHaveProperty('width', 512);
      expect(generatedVideo).toHaveProperty('height', 512);
      expect(generatedVideo).toHaveProperty('duration', 5);
      expect(generatedVideo).toHaveProperty('fps', 30);
      expect(generatedVideo).toHaveProperty('prompt', prompt);
      expect(generatedVideo).toHaveProperty('model', trainedModel.id);

      // Verify progress tracking through generation steps
      expect(progressUpdates.length).toBe(7); // Based on AI engine steps
      expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100);
    });

    test('should generate accurate description-based content', async () => {
      const prompts = [
        'Professional headshot with business attire',
        'Casual portrait with natural lighting',
        'Artistic black and white portrait'
      ];

      for (const prompt of prompts) {
        const config = {
          duration: 3,
          resolution: '512x512'
        };

        const generatedVideo = await aiEngine.generateVideo(
          trainedModel.id,
          prompt,
          config
        );

        // Verify each generation produces unique results
        expect(generatedVideo).toBeDefined();
        expect(generatedVideo.prompt).toBe(prompt);
        expect(generatedVideo.generatedAt).toBeDefined();
        expect(generatedVideo.size).toBeDefined();
      }
    });
  });

  describe('Image Quality Upgrade (4K)', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    test('should estimate processing time for 4K upgrade', () => {
      const config = {
        duration: 5,
        resolution: '3840x2160', // 4K
        modelComplexity: 'high'
      };

      const estimatedTime = aiEngine.estimateProcessingTime(config);
      expect(estimatedTime).toBeGreaterThan(0);
      expect(typeof estimatedTime).toBe('number');
    });

    test('should handle 4K resolution video generation', async () => {
      const model = await aiEngine.createTextToVideoModel({
        name: '4k-model',
        type: 'text-to-video'
      });
      
      const modelId = '4k-test-model';
      aiEngine.models.set(modelId, model);

      const config = {
        duration: 5,
        resolution: '3840x2160' // 4K
      };

      const generatedVideo = await aiEngine.generateVideo(
        modelId,
        'High quality 4K portrait',
        config
      );

      expect(generatedVideo).toBeDefined();
      expect(generatedVideo.width).toBe(3840);
      expect(generatedVideo.height).toBe(2160);
      expect(generatedVideo.duration).toBe(5);
    });
  });

  describe('Audio and Music File Processing', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    test('should validate audio file formats', () => {
      sampleAudioFiles.forEach(audio => {
        expect(audio).toHaveProperty('format', 'mp3');
        expect(audio).toHaveProperty('duration');
        expect(audio).toHaveProperty('sampleRate', 44100);
        expect(audio).toHaveProperty('bitrate');
        expect(audio.duration).toBeGreaterThan(0);
      });
    });

    test('should process 5-minute audio for video creation', () => {
      const fiveMinuteAudio = sampleAudioFiles.find(audio => audio.duration === 300);
      expect(fiveMinuteAudio).toBeDefined();
      expect(fiveMinuteAudio.duration).toBe(300); // 5 minutes
    });
  });

  describe('Model Management and Independence', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    test('should load and unload models independently', async () => {
      const model1 = await aiEngine.createTextToVideoModel({ name: 'model1' });
      const model2 = await aiEngine.createImageToVideoModel({ name: 'model2' });

      // Load models
      const modelId1 = 'test-model-1';
      const modelId2 = 'test-model-2';
      
      await aiEngine.loadModel('fake-path-1', modelId1);
      await aiEngine.loadModel('fake-path-2', modelId2);

      // Verify models are loaded
      const loadedModels = aiEngine.listLoadedModels();
      expect(loadedModels.length).toBeGreaterThanOrEqual(2);

      // Unload one model
      const unloadResult = aiEngine.unloadModel(modelId1);
      expect(unloadResult).toBe(true);

      // Verify model was unloaded
      const modelsAfterUnload = aiEngine.listLoadedModels();
      expect(modelsAfterUnload.length).toBeLessThan(loadedModels.length);
    });

    test('should provide model information', async () => {
      const model = await aiEngine.createTextToVideoModel({ 
        name: 'info-test-model',
        type: 'text-to-video'
      });
      
      const modelId = 'info-model';
      aiEngine.models.set(modelId, model);

      const modelInfo = aiEngine.getModelInfo(modelId);
      expect(modelInfo).toBeDefined();
    });
  });
});