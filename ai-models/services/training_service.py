"""
Training Service - Handles personal avatar model training
"""

import asyncio
import uuid
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class TrainingService:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}
    
    async def start_training(self, session_id: str, images: List[str]) -> Dict[str, Any]:
        """
        Start training a personal avatar model
        
        In a real implementation, this would:
        1. Load and preprocess the training images
        2. Fine-tune a base model (like DreamBooth for Stable Diffusion)
        3. Save the trained model
        
        For now, we simulate the training process
        """
        job_id = str(uuid.uuid4())
        
        self.jobs[job_id] = {
            "session_id": session_id,
            "status": "processing",
            "progress": 0,
            "images_count": len(images),
            "created_at": asyncio.get_event_loop().time(),
            "estimated_time": 900  # 15 minutes in seconds
        }
        
        # Start background training simulation
        asyncio.create_task(self._simulate_training(job_id))
        
        logger.info(f"Started training job {job_id} for session {session_id} with {len(images)} images")
        
        return {
            "job_id": job_id,
            "status": "processing",
            "estimated_time": "10-15 phút"
        }
    
    async def get_status(self, job_id: str) -> Dict[str, Any]:
        """Get training job status"""
        if job_id not in self.jobs:
            raise ValueError(f"Job {job_id} not found")
        
        job = self.jobs[job_id]
        return {
            "job_id": job_id,
            "status": job["status"],
            "progress": job["progress"],
            "message": self._get_progress_message(job["progress"]),
            "estimated_time_remaining": self._calculate_remaining_time(job)
        }
    
    async def _simulate_training(self, job_id: str):
        """Simulate the training process"""
        job = self.jobs[job_id]
        
        try:
            # Simulate training steps
            steps = [
                (10, "Đang tiền xử lý hình ảnh..."),
                (25, "Đang khởi tạo mô hình..."),
                (40, "Đang huấn luyện epoch 1/5..."),
                (55, "Đang huấn luyện epoch 2/5..."),
                (70, "Đang huấn luyện epoch 3/5..."),
                (85, "Đang huấn luyện epoch 4/5..."),
                (95, "Đang hoàn thiện mô hình..."),
                (100, "Hoàn thành!")
            ]
            
            for progress, message in steps:
                job["progress"] = progress
                job["current_message"] = message
                
                # Simulate processing time
                await asyncio.sleep(60)  # 1 minute per step
                
                if job["status"] == "cancelled":
                    return
            
            job["status"] = "completed"
            job["model_path"] = f"models/trained/{job_id}.safetensors"
            
            logger.info(f"Training job {job_id} completed successfully")
            
        except Exception as e:
            job["status"] = "failed"
            job["error"] = str(e)
            logger.error(f"Training job {job_id} failed: {e}")
    
    def _get_progress_message(self, progress: int) -> str:
        """Get progress message based on completion percentage"""
        if progress < 10:
            return "Đang chuẩn bị..."
        elif progress < 25:
            return "Đang tiền xử lý hình ảnh..."
        elif progress < 40:
            return "Đang khởi tạo mô hình..."
        elif progress < 95:
            epoch = ((progress - 40) // 11) + 1
            return f"Đang huấn luyện epoch {epoch}/5..."
        elif progress < 100:
            return "Đang hoàn thiện mô hình..."
        else:
            return "Hoàn thành!"
    
    def _calculate_remaining_time(self, job: Dict[str, Any]) -> str:
        """Calculate estimated remaining time"""
        if job["status"] == "completed":
            return "0 phút"
        
        progress = job["progress"]
        if progress == 0:
            return "15 phút"
        
        # Simple linear estimation
        remaining_percent = 100 - progress
        estimated_minutes = int((remaining_percent / 100) * 15)
        
        return f"{estimated_minutes} phút"