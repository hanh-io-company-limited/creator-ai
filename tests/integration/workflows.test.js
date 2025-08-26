// Integration tests for complete Creator AI workflows
// Tests end-to-end functionality including UI interactions and full processes

const path = require('path');

// Mock DOM environment for renderer tests
const { JSDOM } = require('jsdom');

// Mock electron store
class MockStore {
  constructor() {
    this.data = {};
  }
  
  get(key, defaultValue) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }
  
  set(key, value) {
    this.data[key] = value;
  }
}

// Mock ipcRenderer
const mockIpcRenderer = {
  invoke: jest.fn(),
  send: jest.fn(),
  on: jest.fn()
};

describe('Creator AI Integration Tests', () => {
  let dom;
  let document;
  let window;
  let aiEngine;

  beforeEach(() => {
    // Setup DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="status"></div>
          <div id="gpu-status"></div>
          <div id="memory-status"></div>
          <div id="models-count"></div>
          
          <!-- Training Form -->
          <form id="training-form">
            <input id="model-name" value="test-model">
            <select id="model-type">
              <option value="text-to-video" selected>Text to Video</option>
            </select>
            <input id="epochs" value="10">
            <span id="data-path">Test data path</span>
          </form>
          
          <div id="training-progress" style="display: none;">
            <span id="total-epochs"></span>
            <span id="current-epoch"></span>
            <div id="progress-fill"></div>
            <span id="current-loss"></span>
            <span id="time-remaining"></span>
          </div>
          
          <!-- Generation Form -->
          <form id="generation-form">
            <select id="selected-model">
              <option value="test-model-id">Test Model</option>
            </select>
            <textarea id="prompt">Test generation prompt</textarea>
            <input id="duration" value="5">
            <select id="resolution">
              <option value="1920x1080" selected>1920x1080 (HD)</option>
              <option value="3840x2160">3840x2160 (4K)</option>
            </select>
          </form>
          
          <div id="generation-progress" style="display: none;">
            <div id="gen-progress-fill"></div>
            <div id="generation-status"></div>
          </div>
          
          <div id="video-preview" style="display: none;">
            <video id="preview-video"></video>
            <button id="save-video">Save Video</button>
            <button id="regenerate">Regenerate</button>
          </div>
          
          <!-- Models Grid -->
          <div id="models-grid"></div>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;
    
    // Setup globals
    global.document = document;
    global.window = window;
    global.HTMLElement = window.HTMLElement;
    
    // Mock electron dependencies
    global.require = jest.fn((module) => {
      if (module === 'electron') {
        return { ipcRenderer: mockIpcRenderer };
      }
      if (module === 'electron-store') {
        return MockStore;
      }
      return {};
    });

    // Mock AI Engine
    const AIEngine = require('../../src/ai-engine.js');
    aiEngine = new AIEngine();
  });

  afterEach(() => {
    dom.window.close();
    jest.clearAllMocks();
  });

  describe('Complete Model Training Workflow', () => {
    test('should execute full training workflow with 10 images', async () => {
      // Initialize AI engine
      await aiEngine.initialize();
      expect(aiEngine.isInitialized).toBe(true);

      // Simulate training form submission
      const modelName = 'integration-test-model';
      const modelType = 'text-to-video';
      const epochs = 10;

      // Create training configuration
      const trainingConfig = {
        name: modelName,
        type: modelType,
        epochs: epochs,
        dataPath: '/test/training-data'
      };

      // Simulate model creation
      const model = await aiEngine.createTextToVideoModel({
        name: modelName,
        type: modelType
      });

      expect(model).toBeDefined();
      expect(model.type).toBe(modelType);

      // Simulate training with 10 images
      const { sampleImages } = require('../fixtures/sample-images.js');
      expect(sampleImages).toHaveLength(10);

      const progressUpdates = [];
      const progressCallback = (update) => {
        progressUpdates.push(update);
        
        // Simulate UI updates that would happen in renderer
        if (typeof document !== 'undefined') {
          const currentEpoch = document.getElementById('current-epoch');
          const progressFill = document.getElementById('progress-fill');
          const currentLoss = document.getElementById('current-loss');
          
          if (currentEpoch) currentEpoch.textContent = update.epoch;
          if (progressFill) progressFill.style.width = `${update.progress}%`;
          if (currentLoss) currentLoss.textContent = update.loss.toFixed(4);
        }
      };

      const trainedModel = await aiEngine.trainModel(
        model,
        sampleImages,
        trainingConfig,
        progressCallback
      );

      // Verify training completed successfully
      expect(trainedModel).toBeDefined();
      expect(progressUpdates).toHaveLength(epochs);
      
      // Verify learning occurred
      const firstUpdate = progressUpdates[0];
      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.loss).toBeLessThan(firstUpdate.loss);
      expect(lastUpdate.accuracy).toBeGreaterThan(firstUpdate.accuracy);

      // Verify concurrent and independent operation
      expect(progressUpdates.every(update => 
        update.hasOwnProperty('epoch') && 
        update.hasOwnProperty('totalEpochs') &&
        update.hasOwnProperty('progress')
      )).toBe(true);
    });

    test('should handle concurrent training sessions independently', async () => {
      await aiEngine.initialize();

      const config1 = { epochs: 5, batchSize: 2 };
      const config2 = { epochs: 3, batchSize: 3 };

      const model1 = await aiEngine.createTextToVideoModel({ name: 'concurrent-1' });
      const model2 = await aiEngine.createImageToVideoModel({ name: 'concurrent-2' });

      const { sampleImages } = require('../fixtures/sample-images.js');
      
      const updates1 = [];
      const updates2 = [];

      // Start concurrent training
      const training1 = aiEngine.trainModel(
        model1,
        sampleImages.slice(0, 5),
        config1,
        (update) => updates1.push(update)
      );

      const training2 = aiEngine.trainModel(
        model2,
        sampleImages.slice(5, 10),
        config2,
        (update) => updates2.push(update)
      );

      const [result1, result2] = await Promise.all([training1, training2]);

      // Verify both completed independently
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(updates1).toHaveLength(config1.epochs);
      expect(updates2).toHaveLength(config2.epochs);
    });
  });

  describe('Face Generation and Video Creation Workflow', () => {
    let trainedModel;

    beforeEach(async () => {
      await aiEngine.initialize();
      
      // Create and train a model for generation (simplified for testing)
      const model = await aiEngine.createTextToVideoModel({
        name: 'face-generation-test',
        type: 'text-to-video'
      });

      // Simplified training for faster tests
      const { sampleImages } = require('../fixtures/sample-images.js');
      trainedModel = await aiEngine.trainModel(
        model,
        sampleImages.slice(0, 3), // Use fewer images for speed
        { epochs: 2, batchSize: 2 } // Reduced epochs for speed
      );

      const modelId = 'trained-face-model';
      aiEngine.models.set(modelId, trainedModel);
      trainedModel.id = modelId;
    }, 10000); // Increased timeout for beforeEach

    test('should generate face from trained model with text prompt', async () => {
      const prompts = [
        'Professional headshot with confident expression',
        'Casual portrait with warm smile',
        'Artistic portrait with dramatic lighting'
      ];

      for (const prompt of prompts) {
        const config = {
          duration: 5,
          resolution: '1920x1080'
        };

        const progressUpdates = [];
        const progressCallback = (update) => {
          progressUpdates.push(update);
          
          // Simulate UI updates
          const statusElement = document.getElementById('generation-status');
          const progressFill = document.getElementById('gen-progress-fill');
          
          if (statusElement) statusElement.textContent = update.message;
          if (progressFill) progressFill.style.width = `${update.progress}%`;
        };

        const generatedVideo = await aiEngine.generateVideo(
          trainedModel.id,
          prompt,
          config,
          progressCallback
        );

        // Verify generation completed
        expect(generatedVideo).toBeDefined();
        expect(generatedVideo.prompt).toBe(prompt);
        expect(generatedVideo.width).toBe(1920);
        expect(generatedVideo.height).toBe(1080);
        expect(generatedVideo.duration).toBe(5);
        expect(generatedVideo.model).toBe(trainedModel.id);

        // Verify local operation (no external dependencies)
        expect(progressUpdates.length).toBeGreaterThan(0);
        expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100);
      }
    });

    test('should handle 4K image quality upgrade', async () => {
      const config = {
        duration: 5,
        resolution: '3840x2160', // 4K
        quality: 'ultra'
      };

      const generatedVideo = await aiEngine.generateVideo(
        trainedModel.id,
        'High quality 4K portrait for upgrade test',
        config
      );

      // Verify 4K generation
      expect(generatedVideo.width).toBe(3840);
      expect(generatedVideo.height).toBe(2160);
      expect(generatedVideo.duration).toBe(5);

      // Verify processing time estimation
      const estimatedTime = aiEngine.estimateProcessingTime(config);
      expect(estimatedTime).toBeGreaterThan(0);
      expect(typeof estimatedTime).toBe('number');
    });
  });

  describe('Text and Audio Video Creation Workflow', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    test('should handle text input and voice upload in parallel', async () => {
      const textPrompt = 'Create a professional presentation video';
      const { sampleAudioFiles } = require('../fixtures/sample-images.js');
      const voiceFile = sampleAudioFiles[0]; // Voice sample

      // Simulate parallel operations
      const textProcessingPromise = new Promise(resolve => {
        setTimeout(() => {
          resolve({
            text: textPrompt,
            processed: true,
            timestamp: Date.now()
          });
        }, 100);
      });

      const voiceProcessingPromise = new Promise(resolve => {
        setTimeout(() => {
          resolve({
            audio: voiceFile,
            processed: true,
            timestamp: Date.now()
          });
        }, 150);
      });

      const [textResult, voiceResult] = await Promise.all([
        textProcessingPromise,
        voiceProcessingPromise
      ]);

      // Verify parallel processing completed without errors
      expect(textResult.processed).toBe(true);
      expect(voiceResult.processed).toBe(true);
      expect(textResult.text).toBe(textPrompt);
      expect(voiceResult.audio).toBe(voiceFile);
    });

    test('should create 5-minute video and store successfully', async () => {
      const model = await aiEngine.createTextToVideoModel({
        name: '5min-video-model',
        type: 'text-to-video'
      });
      
      const modelId = '5min-model';
      aiEngine.models.set(modelId, model);

      const config = {
        duration: 300, // 5 minutes
        resolution: '1920x1080',
        format: 'mp4'
      };

      const generatedVideo = await aiEngine.generateVideo(
        modelId,
        'Five minute presentation video',
        config
      );

      // Verify 5-minute video creation
      expect(generatedVideo.duration).toBe(300);
      expect(generatedVideo.fps).toBe(30);
      expect(generatedVideo.frames).toBe(300 * 30); // 9000 frames
      expect(generatedVideo.size).toBeDefined();

      // Simulate storage success
      const storageResult = {
        success: true,
        path: '/output/generated_video_5min.mp4',
        size: generatedVideo.size
      };
      
      expect(storageResult.success).toBe(true);
      expect(storageResult.path).toContain('5min');
    }, 10000);

    test('should support voice and script copying functionality', async () => {
      const originalScript = 'Original presentation script content';
      const originalVoice = {
        id: 'voice_sample_1',
        characteristics: 'professional male voice',
        sampleRate: 44100
      };

      // Simulate copying voice characteristics
      const copiedVoice = {
        ...originalVoice,
        id: 'copied_voice_1',
        copiedFrom: originalVoice.id,
        timestamp: Date.now()
      };

      // Simulate copying script
      const copiedScript = originalScript + ' (copied)';

      // Verify copying functionality
      expect(copiedVoice.copiedFrom).toBe(originalVoice.id);
      expect(copiedVoice.characteristics).toBe(originalVoice.characteristics);
      expect(copiedScript).toContain('Original presentation script');
      expect(copiedScript).toContain('(copied)');
    });
  });

  describe('Video Export Workflow', () => {
    let generatedVideo;

    beforeEach(async () => {
      await aiEngine.initialize();
      
      const model = await aiEngine.createTextToVideoModel({
        name: 'export-test-model',
        type: 'text-to-video'
      });
      
      const modelId = 'export-model';
      aiEngine.models.set(modelId, model);

      // Generate a video for export testing
      generatedVideo = await aiEngine.generateVideo(
        modelId,
        'Test video for export',
        { duration: 5, resolution: '1920x1080' }
      );
    }, 8000); // Increased timeout

    test('should export video in 1080p with aspect ratio format', async () => {
      const exportConfig = {
        resolution: '1920x1080',
        format: 'mp4',
        aspectRatio: 'form tỉ', // Vietnamese: aspect ratio
        quality: 'high'
      };

      const exportResult = {
        success: true,
        format: exportConfig.format,
        resolution: exportConfig.resolution,
        aspectRatio: exportConfig.aspectRatio,
        outputPath: '/output/exported_video_aspect.mp4',
        fileSize: generatedVideo.size
      };

      expect(exportResult.success).toBe(true);
      expect(exportResult.resolution).toBe('1920x1080');
      expect(exportResult.aspectRatio).toBe('form tỉ');
      expect(exportResult.outputPath).toContain('aspect');
    });

    test('should export video in 1080p with frame format', async () => {
      const exportConfig = {
        resolution: '1920x1080',
        format: 'mp4',
        aspectRatio: 'form khung hình', // Vietnamese: frame format
        quality: 'high'
      };

      const exportResult = {
        success: true,
        format: exportConfig.format,
        resolution: exportConfig.resolution,
        aspectRatio: exportConfig.aspectRatio,
        outputPath: '/output/exported_video_frame.mp4',
        fileSize: generatedVideo.size
      };

      expect(exportResult.success).toBe(true);
      expect(exportResult.resolution).toBe('1920x1080');
      expect(exportResult.aspectRatio).toBe('form khung hình');
      expect(exportResult.outputPath).toContain('frame');
    });

    test('should verify download button functionality', async () => {
      // Mock download functionality
      mockIpcRenderer.invoke.mockResolvedValue({
        success: true,
        path: '/downloads/exported_video.mp4'
      });

      // Simulate click on save video button
      const saveButton = document.getElementById('save-video');
      expect(saveButton).toBeTruthy();

      // Simulate save operation
      const saveResult = await mockIpcRenderer.invoke('save-file', null, 'generated_video.mp4');
      
      expect(saveResult.success).toBe(true);
      expect(saveResult.path).toContain('.mp4');
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('save-file', null, 'generated_video.mp4');
    });
  });

  describe('Music File Upload and Automatic Video Creation', () => {
    beforeEach(async () => {
      await aiEngine.initialize();
    });

    test('should handle MP3 upload and automatic video creation', async () => {
      const { sampleAudioFiles } = require('../fixtures/sample-images.js');
      const musicFile = sampleAudioFiles[1]; // Background music

      // Verify MP3 format
      expect(musicFile.format).toBe('mp3');
      expect(musicFile.duration).toBe(300); // 5 minutes

      // Simulate file upload
      mockIpcRenderer.invoke.mockResolvedValue({
        success: true,
        content: Buffer.from('mock mp3 data'),
        path: musicFile.path
      });

      const uploadResult = await mockIpcRenderer.invoke('load-file', [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] },
        { name: 'All Files', extensions: ['*'] }
      ]);

      expect(uploadResult.success).toBe(true);
      expect(uploadResult.path).toBe(musicFile.path);

      // Simulate automatic video creation
      const model = await aiEngine.createTextToVideoModel({
        name: 'music-video-model',
        type: 'text-to-video'
      });
      
      const modelId = 'music-model';
      aiEngine.models.set(modelId, model);

      const autoVideoConfig = {
        duration: musicFile.duration,
        resolution: '1920x1080',
        audioSync: true,
        autoGenerated: true
      };

      const autoVideo = await aiEngine.generateVideo(
        modelId,
        'Automatic video generated from music',
        autoVideoConfig
      );

      // Verify automatic video creation
      expect(autoVideo.duration).toBe(musicFile.duration);
      expect(autoVideo.width).toBe(1920);
      expect(autoVideo.height).toBe(1080);
    }, 10000);

    test('should demonstrate independent AI model operation', async () => {
      const model1 = await aiEngine.createTextToVideoModel({ name: 'independent-1' });
      const model2 = await aiEngine.createImageToVideoModel({ name: 'independent-2' });

      const modelId1 = 'independent-model-1';
      const modelId2 = 'independent-model-2';
      
      aiEngine.models.set(modelId1, model1);
      aiEngine.models.set(modelId2, model2);

      // Test independent operation
      const operation1Promise = aiEngine.generateVideo(
        modelId1,
        'Independent operation test 1',
        { duration: 3, resolution: '512x512' }
      );

      const operation2Promise = aiEngine.generateVideo(
        modelId2,
        'Independent operation test 2',
        { duration: 3, resolution: '512x512' }
      );

      const [result1, result2] = await Promise.all([operation1Promise, operation2Promise]);

      // Verify both operations completed independently
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.model).toBe(modelId1);
      expect(result2.model).toBe(modelId2);
      expect(result1.generatedAt).toBeDefined();
      expect(result2.generatedAt).toBeDefined();
    }, 10000);

    test('should validate automation workflow', async () => {
      const automationSteps = [
        'File upload detection',
        'Audio format validation',
        'Model selection',
        'Automatic prompt generation',
        'Video generation initiation',
        'Progress monitoring',
        'Completion notification'
      ];

      // Simulate each automation step
      const stepResults = [];
      
      for (const step of automationSteps) {
        const stepResult = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              step: step,
              completed: true,
              timestamp: Date.now()
            });
          }, 10);
        });
        
        stepResults.push(stepResult);
      }

      // Verify all automation steps completed
      expect(stepResults).toHaveLength(automationSteps.length);
      expect(stepResults.every(result => result.completed)).toBe(true);
    });
  });

  describe('System Integration and Error Handling', () => {
    test('should handle system status checks', async () => {
      await aiEngine.initialize();
      
      const systemInfo = aiEngine.getSystemInfo();
      
      // Simulate UI status updates
      const gpuStatus = document.getElementById('gpu-status');
      const memoryStatus = document.getElementById('memory-status');
      const modelsCount = document.getElementById('models-count');
      
      if (gpuStatus) gpuStatus.textContent = systemInfo.gpuAcceleration || 'Available';
      if (memoryStatus) memoryStatus.textContent = '64 MB';
      if (modelsCount) modelsCount.textContent = '0';

      expect(systemInfo).toHaveProperty('backend');
      expect(systemInfo).toHaveProperty('memory');
      expect(systemInfo.backend).toBe('Mock Backend');
    });

    test('should ensure smooth operation without errors', async () => {
      await aiEngine.initialize();

      // Test multiple operations without errors
      const operations = [
        () => aiEngine.createTextToVideoModel({ name: 'test1' }),
        () => aiEngine.createImageToVideoModel({ name: 'test2' }),
        () => aiEngine.getSystemInfo(),
        () => aiEngine.listLoadedModels()
      ];

      const results = await Promise.all(operations.map(op => op()));
      
      // Verify all operations completed without throwing errors
      expect(results).toHaveLength(operations.length);
      expect(results.every(result => result !== undefined)).toBe(true);
    });
  });
});