# Creator AI - API Documentation

## Overview

Creator AI provides a comprehensive internal API for AI-powered music and audio content creation. The system is designed to run completely offline with no external dependencies.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API runs on localhost without authentication. In production environments, implement proper authentication and HTTPS.

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "timestamp": string,
  "error": string (only on errors)
}
```

## Health Check

### GET /health

Check the health status of the API and ML engine.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "heapUsed": 50000000,
    "heapTotal": 100000000
  },
  "mlEngine": {
    "backend": "cpu",
    "modelsLoaded": 2,
    "version": "4.10.0"
  }
}
```

## ML Engine Endpoints

### POST /api/ml/initialize

Initialize the ML engine with optional configuration.

**Request Body:**
```json
{
  "backend": "cpu" | "webgl" | "tensorflow",
  "config": {
    "memoryLimit": "2GB",
    "optimization": "speed" | "memory"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "ML Engine initialized"
}
```

### GET /api/ml/models

List all loaded models.

**Response:**
```json
{
  "models": [
    {
      "id": "model-uuid",
      "type": "text-to-audio",
      "parameters": 1500000,
      "created": "2024-01-01T00:00:00.000Z",
      "inputShape": [null, 100],
      "outputShape": [1024]
    }
  ]
}
```

### GET /api/ml/models/:id

Get detailed information about a specific model.

**Response:**
```json
{
  "model": {
    "id": "model-uuid",
    "type": "text-to-audio",
    "parameters": 1500000,
    "created": "2024-01-01T00:00:00.000Z",
    "inputShape": [null, 100],
    "outputShape": [1024],
    "config": {
      "sequenceLength": 100,
      "embeddingDim": 128,
      "lstmUnits": 256
    }
  }
}
```

### POST /api/ml/models/create

Create a new AI model.

**Request Body:**
```json
{
  "type": "text-to-audio" | "audio-processing",
  "config": {
    // Text-to-Audio Model Config
    "sequenceLength": 100,
    "embeddingDim": 128,
    "lstmUnits": 256,
    "denseUnits": 512,
    "outputDim": 1024,
    "learningRate": 0.001,
    
    // Audio Processing Model Config
    "inputShape": [null, 1024],
    "filterSizes": [64, 128, 256],
    "kernelSizes": [3, 3, 3],
    "poolSizes": [2, 2, 2],
    "numClasses": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "model": {
    "id": "new-model-uuid",
    "type": "text-to-audio",
    "parameters": 1500000,
    "created": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/ml/models/:id/train

Train a model with provided data.

**Request Body:**
```json
{
  "trainingData": {
    "texts": ["happy piano music", "sad violin melody"],
    "audioFeatures": [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
  },
  "validationData": {
    "texts": ["test music"],
    "audioFeatures": [[0.7, 0.8, 0.9]]
  },
  "config": {
    "epochs": 50,
    "batchSize": 32,
    "validationSplit": 0.2,
    "patience": 10,
    "saveBestOnly": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "training-task-uuid",
  "message": "Training started"
}
```

### POST /api/ml/models/:id/generate-audio

Generate audio from text prompt.

**Request Body:**
```json
{
  "prompt": "peaceful piano music with nature sounds",
  "config": {
    "sampleRate": 22050,
    "duration": 5.0,
    "temperature": 0.8
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "audioData": [0.1, 0.2, -0.1, 0.3, ...],
    "sampleRate": 22050,
    "duration": 5.0,
    "prompt": "peaceful piano music with nature sounds",
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "model": "model-uuid"
  }
}
```

### POST /api/ml/models/:id/process-audio

Process audio data for analysis or transformation.

**Request Body:**
```json
{
  "audioData": [0.1, 0.2, -0.1, 0.3, ...],
  "config": {
    "analysisType": "classification" | "feature_extraction",
    "normalize": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "processedData": [0.8, 0.1, 0.1],
    "confidence": 0.8,
    "predictions": [0.8, 0.1, 0.1],
    "processedAt": "2024-01-01T00:00:00.000Z",
    "model": "model-uuid"
  }
}
```

### POST /api/ml/models/:id/save

Save a model to disk.

**Request Body:**
```json
{
  "path": "./models/my-custom-model"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Model saved successfully"
}
```

### DELETE /api/ml/models/:id

Unload a model from memory.

**Response:**
```json
{
  "success": true,
  "message": "Model unloaded"
}
```

## Task Management

### GET /api/tasks

List all active and completed tasks.

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-uuid",
      "type": "training" | "preprocessing" | "audio-conversion",
      "status": "running" | "completed" | "failed",
      "progress": 75,
      "startedAt": "2024-01-01T00:00:00.000Z",
      "completedAt": "2024-01-01T00:05:00.000Z",
      "modelId": "model-uuid",
      "epoch": 15,
      "loss": 0.25,
      "accuracy": 0.85
    }
  ]
}
```

### GET /api/tasks/:id

Get detailed information about a specific task.

**Response:**
```json
{
  "task": {
    "id": "task-uuid",
    "type": "training",
    "status": "running",
    "progress": 75,
    "startedAt": "2024-01-01T00:00:00.000Z",
    "modelId": "model-uuid",
    "epoch": 15,
    "totalEpochs": 20,
    "loss": 0.25,
    "accuracy": 0.85,
    "valLoss": 0.30,
    "valAccuracy": 0.80
  }
}
```

### DELETE /api/tasks/:id

Delete a task from the task list.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

## Data Management

### POST /api/data/upload

Upload training data files.

**Request:** Multipart form data with files

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "originalname": "training_audio.wav",
      "filename": "1234567890-uuid-training_audio.wav",
      "path": "./uploads/1234567890-uuid-training_audio.wav",
      "size": 1048576,
      "mimetype": "audio/wav"
    }
  ],
  "message": "1 file(s) uploaded successfully"
}
```

### POST /api/data/preprocess

Start preprocessing of uploaded data.

**Request Body:**
```json
{
  "files": ["file1.wav", "file2.wav"],
  "type": "audio",
  "config": {
    "sampleRate": 22050,
    "normalize": true,
    "augmentation": {
      "timeStretch": true,
      "pitchShift": true,
      "addNoise": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "preprocessing-task-uuid",
  "message": "Preprocessing started"
}
```

## Audio Utilities

### POST /api/audio/convert

Convert audio files between formats.

**Request Body:**
```json
{
  "inputPath": "./uploads/input.wav",
  "outputPath": "./output/output.mp3",
  "format": "mp3",
  "config": {
    "bitrate": "192k",
    "sampleRate": 44100,
    "channels": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "conversion-task-uuid",
  "message": "Audio conversion started"
}
```

## System Information

### GET /api/system/info

Get comprehensive system information.

**Response:**
```json
{
  "system": {
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "v20.0.0",
    "uptime": 3600,
    "memory": {
      "heapUsed": 50000000,
      "heapTotal": 100000000,
      "external": 5000000
    },
    "cpu": {
      "user": 1000000,
      "system": 500000
    }
  },
  "mlEngine": {
    "backend": "cpu",
    "memory": {
      "numTensors": 10,
      "numDataBuffers": 5,
      "numBytes": 1000000
    },
    "version": "4.10.0",
    "modelsLoaded": 2,
    "gpuAcceleration": "Not Available"
  },
  "activeTasks": 2
}
```

### POST /api/system/cleanup

Perform system cleanup (remove old models, clear cache, etc.).

**Response:**
```json
{
  "success": true,
  "message": "System cleanup completed"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid input data |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error - Server-side error |

## Error Response Format

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    "field": "Specific field that caused the error",
    "value": "Invalid value"
  }
}
```

## Rate Limiting

Currently, no rate limiting is implemented for localhost usage. In production, implement appropriate rate limiting based on your needs.

## WebSocket Events (Future Implementation)

For real-time updates on training progress and task status:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('training-progress', (data) => {
  console.log('Training progress:', data);
});

ws.on('task-completed', (data) => {
  console.log('Task completed:', data);
});
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class CreatorAIClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async createTextToAudioModel(config) {
    const response = await axios.post(`${this.baseURL}/ml/models/create`, {
      type: 'text-to-audio',
      config
    });
    return response.data;
  }

  async generateAudio(modelId, prompt, config = {}) {
    const response = await axios.post(`${this.baseURL}/ml/models/${modelId}/generate-audio`, {
      prompt,
      config
    });
    return response.data.result;
  }

  async getTaskStatus(taskId) {
    const response = await axios.get(`${this.baseURL}/tasks/${taskId}`);
    return response.data.task;
  }
}

// Usage
const client = new CreatorAIClient();
const model = await client.createTextToAudioModel({
  sequenceLength: 100,
  embeddingDim: 128
});
const audio = await client.generateAudio(model.model.id, 'peaceful piano music');
```

### Python

```python
import requests
import json

class CreatorAIClient:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url
    
    def create_text_to_audio_model(self, config):
        response = requests.post(f'{self.base_url}/ml/models/create', json={
            'type': 'text-to-audio',
            'config': config
        })
        return response.json()
    
    def generate_audio(self, model_id, prompt, config=None):
        if config is None:
            config = {}
        response = requests.post(f'{self.base_url}/ml/models/{model_id}/generate-audio', json={
            'prompt': prompt,
            'config': config
        })
        return response.json()['result']

# Usage
client = CreatorAIClient()
model = client.create_text_to_audio_model({
    'sequenceLength': 100,
    'embeddingDim': 128
})
audio = client.generate_audio(model['model']['id'], 'peaceful piano music')
```