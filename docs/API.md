# Creator AI API Documentation

## Overview

Creator AI provides a comprehensive REST API for AI-powered content creation. All operations run locally without external dependencies, ensuring complete privacy and control over your data.

## Base URL

- **Local Development**: `http://localhost:3000/api`
- **Docker**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:8080`

## Authentication

Currently, no authentication is required for local development. For production deployments, consider implementing API keys or other authentication mechanisms.

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string | null,
  "timestamp": string
}
```

## Health and System

### GET /health

Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "engine": "Real AI Engine"
}
```

### GET /system

Get detailed system information.

**Response:**
```json
{
  "success": true,
  "data": {
    "backend": "JavaScript CPU",
    "memory": {
      "numTensors": 81,
      "numDataBuffers": 36,
      "numBytes": 904973,
      "unreliable": false
    },
    "version": "4.15.0",
    "gpuAcceleration": "Browser WebGL",
    "modelDirectory": "/app/models",
    "outputDirectory": "/app/output"
  }
}
```

## Model Management

### GET /models

List all loaded models.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "text-to-video-1",
      "type": "text-to-video",
      "parameters": 750000,
      "size": "45.2 MB",
      "loaded": true,
      "created": "2024-01-01T00:00:00.000Z",
      "architecture": "transformer-diffusion"
    }
  ]
}
```

### GET /models/:modelId

Get detailed information about a specific model.

**Parameters:**
- `modelId` (string): Unique model identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "text-to-video-1",
    "type": "text-to-video",
    "parameters": 750000,
    "size": "45.2 MB",
    "loaded": true,
    "created": "2024-01-01T00:00:00.000Z",
    "architecture": "transformer-diffusion"
  }
}
```

### POST /models/load

Load a model from file or create a new model.

**Body (form-data):**
- `modelFile` (file, optional): Model file to load
- `modelId` (string): Unique identifier for the model
- `modelPath` (string, optional): Path to model file

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-model-1",
    "path": "/app/models/new-model-1.json",
    "type": "custom",
    "loaded": true,
    "loadTime": 1704067200000
  }
}
```

### DELETE /models/:modelId

Unload a model from memory.

**Parameters:**
- `modelId` (string): Unique model identifier

**Response:**
```json
{
  "success": true,
  "message": "Model text-to-video-1 unloaded successfully"
}
```

## Training

### POST /training/create-model

Create a new model for training.

**Body:**
```json
{
  "type": "text-to-video",
  "config": {
    "name": "my-custom-model",
    "epochs": 100,
    "batchSize": 32,
    "learningRate": 0.001
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "text-to-video",
    "config": {
      "name": "my-custom-model",
      "epochs": 100,
      "batchSize": 32,
      "learningRate": 0.001
    },
    "created": 1704067200000,
    "parameters": 750000,
    "architecture": "transformer-diffusion"
  }
}
```

### POST /training/start

Start training a model with provided data.

**Body (form-data):**
- `trainingData` (files): Training data files
- `modelId` (string): Model to train
- `config` (string): JSON configuration

**Configuration Options:**
```json
{
  "epochs": 100,
  "batchSize": 32,
  "learningRate": 0.001,
  "validationSplit": 0.2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-1234",
    "message": "Training started"
  }
}
```

### GET /training/status/:jobId

Get training job status.

**Parameters:**
- `jobId` (string): Training job identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job-uuid-1234",
    "type": "training",
    "status": "running",
    "progress": 45.5,
    "epoch": 46,
    "totalEpochs": 100,
    "loss": 0.245,
    "accuracy": 0.78,
    "startTime": 1704067200000
  }
}
```

## Video Generation

### POST /generation/video

Generate video content from text prompt.

**Body:**
```json
{
  "modelId": "text-to-video-1",
  "prompt": "A serene mountain landscape with flowing waterfalls",
  "config": {
    "duration": 10,
    "resolution": "1920x1080",
    "fps": 24,
    "style": "cinematic"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "gen-uuid-5678",
    "message": "Generation started"
  }
}
```

### GET /generation/status/:jobId

Get video generation job status.

**Parameters:**
- `jobId` (string): Generation job identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "gen-uuid-5678",
    "type": "video-generation",
    "status": "completed",
    "progress": 100,
    "stage": "encoding",
    "frame": 240,
    "totalFrames": 240,
    "result": {
      "success": true,
      "outputPath": "/app/output/video_uuid.mp4",
      "metadata": {
        "duration": 10,
        "resolution": "1920x1080",
        "fps": 24,
        "frames": 240,
        "prompt": "A serene mountain landscape",
        "created": 1704067200000
      }
    }
  }
}
```

### GET /generation/sample-prompts

Get sample prompts for inspiration.

**Response:**
```json
{
  "success": true,
  "data": [
    "A serene landscape with mountains and flowing water",
    "Abstract geometric patterns in vibrant colors",
    "A bustling city street at night with neon lights",
    "Ocean waves crashing against rocky cliffs"
  ]
}
```

## Audio Processing

### POST /audio/text-to-speech

Convert text to speech audio.

**Body:**
```json
{
  "text": "Welcome to Creator AI, your offline content creation tool",
  "voice": "professional",
  "options": {
    "tempo": 120,
    "pitch": 0,
    "style": "neutral",
    "effects": ["reverb"],
    "duration": null
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioId": "tts-uuid-1234",
    "outputPath": "/app/output/audio/tts_uuid.wav",
    "metadata": {
      "text": "Welcome to Creator AI...",
      "voice": "professional",
      "duration": 5.2,
      "sampleRate": 44100,
      "channels": 2,
      "format": "wav"
    }
  }
}
```

### POST /audio/generate-music

Generate background music.

**Body:**
```json
{
  "prompt": "Upbeat electronic music for a tech demo",
  "options": {
    "genre": "electronic",
    "mood": "energetic",
    "duration": 60,
    "tempo": 128,
    "key": "C",
    "instruments": ["synth", "drums", "bass"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "musicId": "music-uuid-5678",
    "outputPath": "/app/output/audio/bgmusic_uuid.wav",
    "metadata": {
      "genre": "electronic",
      "mood": "energetic",
      "duration": 60,
      "tempo": 128,
      "key": "C",
      "instruments": ["synth", "drums", "bass"]
    }
  }
}
```

### POST /audio/process

Process audio file with effects.

**Body (form-data):**
- `audioFile` (file): Audio file to process
- `effects` (string): JSON array of effects
- `options` (string): JSON processing options

**Effects Options:**
```json
{
  "normalize": true,
  "fadeIn": 1.0,
  "fadeOut": 2.0,
  "reverb": 0.3,
  "delay": 0.2,
  "chorus": 0.1,
  "eq": {
    "low": 0,
    "mid": 0,
    "high": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioId": "proc-uuid-9012",
    "outputPath": "/app/output/audio/processed_uuid.wav",
    "metadata": {
      "inputPath": "/app/uploads/original.wav",
      "effects": ["reverb", "normalize"],
      "processed": 1704067200000
    }
  }
}
```

### POST /audio/analyze

Analyze audio file for musical properties.

**Body (form-data):**
- `audioFile` (file): Audio file to analyze

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "duration": 120.5,
      "tempo": 128,
      "key": "C",
      "mode": "major",
      "loudness": -12.3,
      "energy": 0.82,
      "valence": 0.65,
      "danceability": 0.78,
      "acousticness": 0.12,
      "instrumentalness": 0.89,
      "spectralCentroid": 2500,
      "mfcc": [1.2, -0.8, 0.5, ...],
      "chroma": [0.8, 0.2, 0.1, ...]
    }
  }
}
```

### POST /audio/detect-beats

Detect beats and rhythm in audio.

**Body (form-data):**
- `audioFile` (file): Audio file to analyze

**Response:**
```json
{
  "success": true,
  "data": {
    "beats": [
      {
        "time": 0.468,
        "confidence": 0.85,
        "strength": 0.72
      },
      {
        "time": 0.937,
        "confidence": 0.91,
        "strength": 0.68
      }
    ],
    "tempo": 128,
    "timeSignature": "4/4",
    "confidence": 0.87
  }
}
```

### POST /audio/mix

Mix multiple audio tracks.

**Body (form-data):**
- `audioTracks` (files): Multiple audio files to mix
- `options` (string): JSON mixing options

**Mixing Options:**
```json
{
  "masterVolume": 1.0,
  "compression": true,
  "limiting": false,
  "eq": {
    "low": 0,
    "mid": 0,
    "high": 0
  },
  "stereoWidth": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mixId": "mix-uuid-3456",
    "outputPath": "/app/output/audio/mix_uuid.wav",
    "metadata": {
      "tracks": [
        {"path": "/app/uploads/track1.wav", "volume": 1.0},
        {"path": "/app/uploads/track2.wav", "volume": 0.8}
      ],
      "mixed": 1704067200000
    }
  }
}
```

### POST /audio/convert

Convert audio to different format.

**Body (form-data):**
- `audioFile` (file): Audio file to convert
- `outputFormat` (string): Target format (mp3, wav, m4a, flac)
- `options` (string): JSON conversion options

**Conversion Options:**
```json
{
  "bitrate": "320k",
  "sampleRate": 44100,
  "channels": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "convertId": "conv-uuid-7890",
    "outputPath": "/app/output/audio/converted_uuid.mp3",
    "metadata": {
      "format": "mp3",
      "bitrate": "320k",
      "sampleRate": 44100,
      "channels": 2
    }
  }
}
```

### GET /audio/formats

Get supported audio formats.

**Response:**
```json
{
  "success": true,
  "data": [".wav", ".mp3", ".m4a", ".flac", ".ogg"]
}
```

## Data Management

### POST /data/upload

Upload files for training or processing.

**Body (form-data):**
- `files` (files): Multiple files to upload

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "3 files uploaded successfully",
    "files": [
      {
        "originalName": "video1.mp4",
        "filename": "uuid_video1.mp4",
        "path": "/app/uploads/uuid_video1.mp4",
        "size": 10485760,
        "mimetype": "video/mp4"
      }
    ]
  }
}
```

### GET /data/files

List uploaded files.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "uuid_video1.mp4",
      "path": "/app/uploads/uuid_video1.mp4",
      "size": 10485760,
      "created": "2024-01-01T00:00:00.000Z",
      "modified": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## WebSocket API

Connect to `ws://localhost:8080` for real-time updates.

### Subscribe to Job Updates

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  // Subscribe to a specific job
  ws.send(JSON.stringify({
    type: 'subscribe',
    jobId: 'your-job-id'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'job-update':
      console.log('Job progress:', data.data);
      break;
    case 'pong':
      console.log('Ping response received');
      break;
    case 'error':
      console.error('WebSocket error:', data.message);
      break;
  }
};
```

### Ping/Pong

```javascript
// Send ping
ws.send(JSON.stringify({ type: 'ping' }));

// Receive pong
// { type: 'pong', timestamp: 1704067200000 }
```

### Job Update Events

Training job updates:
```javascript
{
  "type": "job-update",
  "jobId": "job-uuid-1234",
  "data": {
    "status": "running",
    "progress": 45.5,
    "epoch": 46,
    "totalEpochs": 100,
    "loss": 0.245,
    "accuracy": 0.78
  }
}
```

Generation job updates:
```javascript
{
  "type": "job-update",
  "jobId": "gen-uuid-5678",
  "data": {
    "status": "running",
    "progress": 75.0,
    "stage": "generating",
    "frame": 180,
    "totalFrames": 240
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Model not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Examples

Model not found:
```json
{
  "success": false,
  "error": "Model text-to-video-1 not found"
}
```

Invalid file format:
```json
{
  "success": false,
  "error": "Invalid file type. Supported formats: .wav, .mp3, .m4a, .flac"
}
```

Training already in progress:
```json
{
  "success": false,
  "error": "Training job already running for this model"
}
```

## Rate Limiting

Default rate limits (configurable):
- General API: 100 requests per 15 minutes
- File uploads: 10 requests per 15 minutes
- Training/Generation: 5 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1704067800
```

## Performance Considerations

### File Size Limits
- Upload files: 100 MB per file
- Training data: 1 GB total per job
- Audio files: 50 MB per file

### Concurrent Operations
- Maximum 3 concurrent jobs
- Training and generation queued if limits exceeded

### Optimization Tips
- Use appropriate resolution for video generation
- Compress audio files before upload
- Monitor system resources during heavy operations

## SDK Examples

### JavaScript/Node.js

```javascript
const CreatorAI = require('./creator-ai-sdk');

const client = new CreatorAI('http://localhost:3000/api');

// Generate video
const job = await client.generateVideo({
  modelId: 'text-to-video-1',
  prompt: 'Beautiful sunset over mountains',
  config: { duration: 10, resolution: '1920x1080' }
});

// Monitor progress
client.onProgress(job.jobId, (progress) => {
  console.log(`Progress: ${progress.progress}%`);
});

// Wait for completion
const result = await client.waitForCompletion(job.jobId);
console.log('Video generated:', result.outputPath);
```

### Python

```python
import requests
import time

class CreatorAI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def generate_video(self, model_id, prompt, config=None):
        response = requests.post(f"{self.base_url}/generation/video", json={
            "modelId": model_id,
            "prompt": prompt,
            "config": config or {}
        })
        return response.json()
    
    def get_job_status(self, job_id):
        response = requests.get(f"{self.base_url}/generation/status/{job_id}")
        return response.json()

# Usage
client = CreatorAI("http://localhost:3000/api")
job = client.generate_video("text-to-video-1", "Peaceful forest scene")
print(f"Job started: {job['data']['jobId']}")
```

## Support

For API support and questions:
- **Documentation**: https://github.com/hanh-io-company-limited/creator-ai/docs
- **Issues**: https://github.com/hanh-io-company-limited/creator-ai/issues
- **Email**: api-support@hanh-io.com