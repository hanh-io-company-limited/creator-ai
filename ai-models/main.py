"""
Creator AI - AI Models Service
Provides AI model integration for avatar and video creation
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import List, Optional
from pydantic import BaseModel

from services.training_service import TrainingService
from services.generation_service import GenerationService
from services.animation_service import AnimationService
from services.upscaling_service import UpscalingService
from services.video_service import VideoService

app = FastAPI(
    title="Creator AI - AI Models API",
    description="AI model integration for avatar and video creation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
training_service = TrainingService()
generation_service = GenerationService()
animation_service = AnimationService()
upscaling_service = UpscalingService()
video_service = VideoService()

# Pydantic models
class TrainingRequest(BaseModel):
    session_id: str
    images: List[str]

class GenerationRequest(BaseModel):
    prompt: str
    style: str = "realistic"
    resolution: str = "512x512"
    model_id: Optional[str] = None

class AnimationRequest(BaseModel):
    image_id: str
    animation_type: str = "lip_sync"
    audio_file: Optional[str] = None

class UpscalingRequest(BaseModel):
    source_id: str
    source_type: str  # 'image' or 'animation'
    target_resolution: str = "4K"
    model: str = "ESRGAN"

class VideoRequest(BaseModel):
    source_id: str
    audio_type: str  # 'tts', 'upload', 'music'
    tts_text: Optional[str] = None
    voice: Optional[str] = None
    audio_file: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Creator AI - AI Models Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "training": "available",
            "generation": "available", 
            "animation": "available",
            "upscaling": "available",
            "video": "available"
        }
    }

# Training endpoints
@app.post("/training/start")
async def start_training(request: TrainingRequest):
    """Start training a personal avatar model"""
    try:
        result = await training_service.start_training(
            request.session_id, 
            request.images
        )
        return {"success": True, "job_id": result["job_id"], "status": "started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/training/status/{job_id}")
async def get_training_status(job_id: str):
    """Get training job status"""
    try:
        status = await training_service.get_status(job_id)
        return {"success": True, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Generation endpoints
@app.post("/generation/generate")
async def generate_image(request: GenerationRequest):
    """Generate image from text prompt"""
    try:
        result = await generation_service.generate_image(
            request.prompt,
            request.style,
            request.resolution,
            request.model_id
        )
        return {"success": True, "image": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Animation endpoints
@app.post("/animation/create")
async def create_animation(request: AnimationRequest):
    """Create animation from image"""
    try:
        result = await animation_service.create_animation(
            request.image_id,
            request.animation_type,
            request.audio_file
        )
        return {"success": True, "animation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/animation/status/{job_id}")
async def get_animation_status(job_id: str):
    """Get animation job status"""
    try:
        status = await animation_service.get_status(job_id)
        return {"success": True, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Upscaling endpoints
@app.post("/upscaling/upscale")
async def upscale_content(request: UpscalingRequest):
    """Upscale image or animation to higher resolution"""
    try:
        result = await upscaling_service.upscale(
            request.source_id,
            request.source_type,
            request.target_resolution,
            request.model
        )
        return {"success": True, "job": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/upscaling/status/{job_id}")
async def get_upscaling_status(job_id: str):
    """Get upscaling job status"""
    try:
        status = await upscaling_service.get_status(job_id)
        return {"success": True, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Video endpoints
@app.post("/video/create")
async def create_video(request: VideoRequest):
    """Create final video with audio sync"""
    try:
        result = await video_service.create_video(
            request.source_id,
            request.audio_type,
            request.tts_text,
            request.voice,
            request.audio_file
        )
        return {"success": True, "video": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/video/status/{job_id}")
async def get_video_status(job_id: str):
    """Get video creation job status"""
    try:
        status = await video_service.get_status(job_id)
        return {"success": True, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )