# Creator AI Deployment Guide

This guide provides comprehensive instructions for deploying the Creator AI self-contained system.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Docker Deployment](#docker-deployment)
4. [Manual Setup](#manual-setup)
5. [API Documentation](#api-documentation)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **RAM**: 8 GB (16 GB recommended)
- **Storage**: 5 GB free space (more for models and output)
- **CPU**: Multi-core processor (4+ cores recommended)
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)

### Recommended Requirements
- **RAM**: 16+ GB
- **Storage**: SSD with 20+ GB free space
- **CPU**: 8+ core processor
- **GPU**: Dedicated GPU with 4+ GB VRAM (optional, for acceleration)

## Installation Methods

### Option 1: Docker Deployment (Recommended)

Docker deployment provides the most reliable and portable setup.

#### Prerequisites
- Docker Engine 20.10+
- Docker Compose v2.0+

#### Quick Start
```bash
# Clone the repository
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai

# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
```

#### Access the Application
- **API Server**: http://localhost:3000
- **WebSocket**: ws://localhost:8080
- **Web Interface**: Open the Electron app or access via API

### Option 2: Electron Desktop Application

#### Prerequisites
- Node.js 18+
- npm 8+

#### Installation
```bash
# Clone the repository
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai

# Install dependencies
npm install

# Start the application
npm start

# Or run in development mode
npm run dev
```

## Docker Deployment

### Standard Deployment

```bash
# Build and start the services
docker-compose up -d

# View logs
docker-compose logs -f creator-ai

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d --force-recreate
```

### Production Deployment

For production use, modify `docker-compose.yml`:

```yaml
version: '3.8'

services:
  creator-ai:
    build: .
    ports:
      - "3000:3000"
      - "8080:8080"
    volumes:
      - ./models:/app/models
      - ./output:/app/output
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - API_PORT=3000
      - WS_PORT=8080
      - MAX_MEMORY=8GB
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
        reservations:
          memory: 4G
          cpus: '2'

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - creator-ai
    restart: unless-stopped
```

### Custom Configuration

Create a `.env` file for environment-specific settings:

```env
# API Configuration
API_PORT=3000
WS_PORT=8080
NODE_ENV=production

# Resource Limits
MAX_MEMORY=8GB
MAX_UPLOAD_SIZE=100MB
MAX_CONCURRENT_JOBS=3

# Model Settings
MODEL_CACHE_SIZE=2GB
DEFAULT_MODEL_TYPE=text-to-video

# Audio Settings
AUDIO_SAMPLE_RATE=44100
AUDIO_CHANNELS=2
AUDIO_BITRATE=320k

# Security
ENABLE_CORS=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15
```

## Manual Setup

### 1. Environment Setup

```bash
# Install Node.js dependencies
npm install

# Create necessary directories
mkdir -p models uploads output output/audio

# Set environment variables
export NODE_ENV=production
export API_PORT=3000
export WS_PORT=8080
```

### 2. Start Services

```bash
# Start API server only
npm run api

# Start Electron application
npm start

# Start both (development)
npm run dev
```

### 3. Health Check

```bash
# Check API health
curl http://localhost:3000/api/health

# Check system status
curl http://localhost:3000/api/system
```

## API Documentation

### Core Endpoints

#### Health and System
```bash
GET /api/health                 # Service health check
GET /api/system                 # System information
```

#### Model Management
```bash
GET /api/models                 # List all models
GET /api/models/:id             # Get model details
POST /api/models/load           # Load a model
DELETE /api/models/:id          # Unload a model
```

#### Training
```bash
POST /api/training/create-model # Create new model
POST /api/training/start        # Start training
GET /api/training/status/:jobId # Training status
```

#### Video Generation
```bash
POST /api/generation/video      # Generate video
GET /api/generation/status/:jobId # Generation status
GET /api/generation/sample-prompts # Sample prompts
```

#### Audio Processing
```bash
POST /api/audio/text-to-speech  # Text to speech
POST /api/audio/generate-music  # Generate music
POST /api/audio/process         # Process audio
POST /api/audio/analyze         # Analyze audio
POST /api/audio/detect-beats    # Beat detection
POST /api/audio/mix             # Mix audio tracks
POST /api/audio/convert         # Convert audio format
GET /api/audio/formats          # Supported formats
```

#### Data Management
```bash
POST /api/data/upload           # Upload files
GET /api/data/files             # List uploaded files
```

### WebSocket Events

Connect to `ws://localhost:8080` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8080');

// Subscribe to job updates
ws.send(JSON.stringify({
  type: 'subscribe',
  jobId: 'your-job-id'
}));

// Listen for updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'job-update') {
    console.log('Job progress:', data.data.progress);
  }
};
```

### Example API Usage

#### Generate Video
```bash
curl -X POST http://localhost:3000/api/generation/video \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "text-to-video-1",
    "prompt": "A serene landscape with mountains",
    "config": {
      "duration": 10,
      "resolution": "1920x1080",
      "fps": 24
    }
  }'
```

#### Generate Music
```bash
curl -X POST http://localhost:3000/api/audio/generate-music \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Upbeat electronic music for a tech demo",
    "options": {
      "genre": "electronic",
      "mood": "energetic",
      "duration": 60,
      "tempo": 128,
      "key": "C"
    }
  }'
```

#### Text to Speech
```bash
curl -X POST http://localhost:3000/api/audio/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Creator AI, your offline content creation tool",
    "voice": "professional",
    "options": {
      "tempo": 120,
      "pitch": 0,
      "style": "neutral"
    }
  }'
```

## Configuration

### Model Configuration

Models are stored in the `models/` directory. Each model includes:
- Model weights and architecture
- Metadata (`.meta.json`)
- Configuration settings

### Audio Configuration

Audio settings in `audio-config.json`:
```json
{
  "sampleRate": 44100,
  "channels": 2,
  "bitrate": "320k",
  "formats": ["wav", "mp3", "m4a", "flac"],
  "effects": {
    "reverb": { "enabled": true, "presets": ["hall", "room", "plate"] },
    "delay": { "enabled": true, "maxDelay": 2000 },
    "chorus": { "enabled": true, "voices": 4 }
  }
}
```

### Performance Tuning

#### Memory Management
```env
# Limit memory usage
MAX_MEMORY=8GB
MODEL_CACHE_SIZE=2GB
UPLOAD_BUFFER_SIZE=50MB
```

#### Concurrency
```env
# Control concurrent operations
MAX_CONCURRENT_JOBS=3
TRAINING_WORKERS=2
GENERATION_WORKERS=2
```

## Troubleshooting

### Common Issues

#### API Server Won't Start
```bash
# Check port availability
netstat -an | grep :3000
lsof -i :3000

# Check logs
docker-compose logs creator-ai
```

#### Memory Issues
```bash
# Monitor memory usage
docker stats creator-ai

# Adjust memory limits
docker-compose down
# Edit docker-compose.yml memory limits
docker-compose up -d
```

#### Model Loading Errors
```bash
# Check model directory
ls -la models/

# Verify model format
file models/your-model.json

# Check API logs
curl http://localhost:3000/api/models
```

#### Audio Processing Issues
```bash
# Check supported formats
curl http://localhost:3000/api/audio/formats

# Verify file upload
curl -X POST -F "audioFile=@test.wav" http://localhost:3000/api/audio/analyze
```

### Performance Issues

#### Slow Training
- Increase CPU allocation in Docker
- Use GPU acceleration if available
- Reduce model complexity or batch size

#### Slow Generation
- Check available system memory
- Reduce output resolution/duration
- Monitor disk I/O for bottlenecks

#### Audio Latency
- Adjust audio buffer sizes
- Use lower sample rates for real-time processing
- Optimize audio processing pipeline

### Debugging

#### Enable Debug Logging
```env
DEBUG=creator-ai:*
LOG_LEVEL=debug
```

#### Docker Debug
```bash
# Access container shell
docker-compose exec creator-ai bash

# View detailed logs
docker-compose logs -f --tail=100 creator-ai

# Monitor resources
docker stats
```

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/hanh-io-company-limited/creator-ai/issues
- **Documentation**: https://github.com/hanh-io-company-limited/creator-ai/docs
- **Email**: support@hanh-io.com

## Security Considerations

### Network Security
- Use HTTPS in production
- Implement proper firewall rules
- Restrict API access as needed

### Data Security
- Models and data are stored locally
- No external API calls by default
- Implement backup strategies for important data

### Access Control
- Consider adding authentication for production use
- Implement rate limiting
- Monitor for unusual activity