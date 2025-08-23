# Creator AI API Documentation

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### 1. Image Upload and Training

#### Upload Images
**POST** `/upload`

Upload training images for personal avatar model.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `images` field (max 10 files)

**Response:**
```json
{
  "success": true,
  "message": "Tải lên thành công",
  "sessionId": "uuid",
  "filesCount": 5,
  "files": [
    {
      "id": "file_id",
      "originalName": "image.jpg",
      "size": 1024000,
      "url": "/uploads/filename.jpg"
    }
  ]
}
```

#### Get Training Session
**GET** `/upload/session/{sessionId}`

Get information about uploaded images.

#### Start Training
**POST** `/training/start/{sessionId}`

Start training the personal avatar model.

**Response:**
```json
{
  "success": true,
  "message": "Bắt đầu huấn luyện mô hình",
  "sessionId": "uuid",
  "status": "processing",
  "estimatedTime": "10-15 phút"
}
```

#### Get Training Status
**GET** `/training/status/{sessionId}`

Get current training progress.

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid",
  "status": "processing",
  "progress": 65,
  "message": "Đang huấn luyện mô hình diện mạo...",
  "estimatedTimeRemaining": "5 phút"
}
```

### 2. Image Generation

#### Generate Image from Prompt
**POST** `/generation/generate`

Generate image from text description.

**Request:**
```json
{
  "prompt": "Chân dung chuyên nghiệp của một người với nụ cười tự tin",
  "style": "realistic",
  "resolution": "512x512",
  "modelId": "optional_model_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo hình ảnh thành công",
  "image": {
    "id": "img_id",
    "prompt": "...",
    "url": "/uploads/generated-image.jpg",
    "resolution": "512x512",
    "style": "realistic",
    "createdAt": "2023-01-01T00:00:00Z"
  },
  "processingTime": "12.5 giây"
}
```

#### Get Available Styles
**GET** `/generation/styles`

Get list of available generation styles.

### 3. Animation Creation

#### Create Animation
**POST** `/animation/create`

Convert image to animation.

**Request:**
```json
{
  "imageId": "img_id",
  "animationType": "lip_sync",
  "audioFile": "optional_audio_file"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bắt đầu tạo animation",
  "animation": {
    "id": "anim_id",
    "status": "processing",
    "estimatedTime": "3-5 phút"
  }
}
```

#### Get Animation Status
**GET** `/animation/status/{animationId}`

Get animation processing status.

#### Get Animation Types
**GET** `/animation/types`

Get available animation types.

### 4. Upscaling

#### Upscale Content
**POST** `/upscaling/upscale`

Upscale image or animation to higher resolution.

**Request:**
```json
{
  "sourceId": "source_id",
  "sourceType": "image",
  "targetResolution": "4K",
  "model": "ESRGAN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bắt đầu nâng cấp chất lượng",
  "job": {
    "id": "job_id",
    "status": "processing",
    "estimatedTime": "2-3 phút"
  }
}
```

#### Get Upscaling Status
**GET** `/upscaling/status/{jobId}`

Get upscaling progress.

### 5. Video Creation

#### Create Video
**POST** `/video/create`

Create final video with audio sync.

**Request:**
```json
{
  "sourceId": "animation_id",
  "audioType": "tts",
  "ttsText": "Xin chào, tôi là AI avatar",
  "voice": "vi-female-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bắt đầu tạo video",
  "job": {
    "id": "job_id",
    "status": "processing",
    "estimatedTime": "15-20 phút"
  }
}
```

#### Text-to-Speech
**POST** `/video/tts`

Generate audio from text.

**Request:**
```json
{
  "text": "Xin chào, tôi là AI avatar",
  "voice": "vi-female-1",
  "language": "vi-VN",
  "speed": 1.0
}
```

#### Get Available Voices
**GET** `/video/voices`

Get list of available TTS voices.

#### Get Video Status
**GET** `/video/status/{jobId}`

Get video creation progress.

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message in Vietnamese"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Rate Limiting

- Upload: 10 files per session
- Generation: 10 requests per minute
- Processing: 3 concurrent jobs per user