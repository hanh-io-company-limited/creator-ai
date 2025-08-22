"""
Animation Service - Handles image to animation conversion using Wav2Lip
"""

import asyncio
import uuid
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class AnimationService:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.available_types = [
            "lip_sync",
            "head_movement", 
            "eye_blink",
            "facial_expression"
        ]
    
    async def create_animation(
        self,
        image_id: str,
        animation_type: str = "lip_sync",
        audio_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create animation from image
        
        In a real implementation, this would:
        1. Load the source image
        2. Use Wav2Lip for lip sync or other models for different animations
        3. Process frame by frame
        4. Generate the output video/gif
        
        For now, we simulate the animation process
        """
        
        if animation_type not in self.available_types:
            raise ValueError(f"Unsupported animation type: {animation_type}")
        
        job_id = str(uuid.uuid4())
        
        self.jobs[job_id] = {
            "id": job_id,
            "image_id": image_id,
            "animation_type": animation_type,
            "status": "processing",
            "progress": 0,
            "created_at": asyncio.get_event_loop().time(),
            "estimated_time": self._get_estimated_time(animation_type),
            "audio_file": audio_file
        }
        
        # Start background animation processing
        asyncio.create_task(self._process_animation(job_id))
        
        logger.info(f"Started animation job {job_id} for image {image_id} with type {animation_type}")
        
        return {
            "id": job_id,
            "status": "processing",
            "estimated_time": self._get_estimated_time_string(animation_type)
        }
    
    async def get_status(self, job_id: str) -> Dict[str, Any]:
        """Get animation job status"""
        if job_id not in self.jobs:
            raise ValueError(f"Animation job {job_id} not found")
        
        job = self.jobs[job_id]
        return {
            "job_id": job_id,
            "status": job["status"],
            "progress": job["progress"],
            "message": self._get_progress_message(job["animation_type"], job["progress"]),
            "estimated_time_remaining": self._calculate_remaining_time(job)
        }
    
    async def _process_animation(self, job_id: str):
        """Process animation in background"""
        job = self.jobs[job_id]
        animation_type = job["animation_type"]
        
        try:
            # Simulate different animation processing steps
            if animation_type == "lip_sync":
                await self._process_lip_sync(job)
            elif animation_type == "head_movement":
                await self._process_head_movement(job)
            elif animation_type == "eye_blink":
                await self._process_eye_blink(job)
            elif animation_type == "facial_expression":
                await self._process_facial_expression(job)
            
            # Complete the job
            job["status"] = "completed"
            job["progress"] = 100
            job["output_url"] = f"/animations/{job_id}.mp4"
            job["preview_url"] = f"/animations/{job_id}_preview.gif"
            
            logger.info(f"Animation job {job_id} completed successfully")
            
        except Exception as e:
            job["status"] = "failed"
            job["error"] = str(e)
            logger.error(f"Animation job {job_id} failed: {e}")
    
    async def _process_lip_sync(self, job: Dict[str, Any]):
        """Process lip synchronization animation"""
        steps = [
            (10, "Đang phân tích khuôn mặt..."),
            (25, "Đang trích xuất landmarks..."),
            (40, "Đang xử lý âm thanh..."),
            (60, "Đang tạo chuyển động môi..."),
            (80, "Đang đồng bộ với âm thanh..."),
            (95, "Đang render video...")
        ]
        
        for progress, message in steps:
            job["progress"] = progress
            job["current_message"] = message
            await asyncio.sleep(20)  # Simulate processing time
    
    async def _process_head_movement(self, job: Dict[str, Any]):
        """Process head movement animation"""
        steps = [
            (15, "Đang phân tích cấu trúc đầu..."),
            (35, "Đang tạo keyframes..."),
            (65, "Đang interpolate chuyển động..."),
            (90, "Đang render animation...")
        ]
        
        for progress, message in steps:
            job["progress"] = progress
            job["current_message"] = message
            await asyncio.sleep(15)
    
    async def _process_eye_blink(self, job: Dict[str, Any]):
        """Process eye blinking animation"""
        steps = [
            (20, "Đang detect mắt..."),
            (50, "Đang tạo blink patterns..."),
            (80, "Đang blend frames..."),
            (95, "Đang export...")
        ]
        
        for progress, message in steps:
            job["progress"] = progress
            job["current_message"] = message
            await asyncio.sleep(10)
    
    async def _process_facial_expression(self, job: Dict[str, Any]):
        """Process facial expression animation"""
        steps = [
            (10, "Đang phân tích facial landmarks..."),
            (30, "Đang tạo expression morphs..."),
            (55, "Đang smooth transitions..."),
            (75, "Đang apply expressions..."),
            (90, "Đang finalize video...")
        ]
        
        for progress, message in steps:
            job["progress"] = progress
            job["current_message"] = message
            await asyncio.sleep(25)
    
    def _get_estimated_time(self, animation_type: str) -> int:
        """Get estimated processing time in seconds"""
        time_estimates = {
            "lip_sync": 300,      # 5 minutes
            "head_movement": 180, # 3 minutes
            "eye_blink": 120,     # 2 minutes
            "facial_expression": 360  # 6 minutes
        }
        return time_estimates.get(animation_type, 300)
    
    def _get_estimated_time_string(self, animation_type: str) -> str:
        """Get estimated time as human readable string"""
        time_strings = {
            "lip_sync": "3-5 phút",
            "head_movement": "2-3 phút", 
            "eye_blink": "1-2 phút",
            "facial_expression": "4-6 phút"
        }
        return time_strings.get(animation_type, "3-5 phút")
    
    def _get_progress_message(self, animation_type: str, progress: int) -> str:
        """Get current progress message"""
        if progress < 10:
            return "Đang khởi tạo..."
        elif animation_type == "lip_sync":
            if progress < 25:
                return "Đang phân tích khuôn mặt..."
            elif progress < 40:
                return "Đang xử lý âm thanh..."
            elif progress < 80:
                return "Đang tạo chuyển động môi..."
            else:
                return "Đang hoàn thiện..."
        else:
            return "Đang xử lý animation..."
    
    def _calculate_remaining_time(self, job: Dict[str, Any]) -> str:
        """Calculate estimated remaining time"""
        if job["status"] == "completed":
            return "0 phút"
        
        progress = job["progress"]
        total_time = job["estimated_time"]
        
        if progress == 0:
            return self._get_estimated_time_string(job["animation_type"])
        
        remaining_seconds = int((100 - progress) / 100 * total_time)
        remaining_minutes = max(1, remaining_seconds // 60)
        
        return f"{remaining_minutes} phút"