"""
Video Service - Handles final video creation with audio sync
"""

import asyncio
import uuid
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.available_voices = [
            "vi-female-1", "vi-male-1", "vi-female-2", "en-female-1"
        ]
    
    async def create_video(
        self,
        source_id: str,
        audio_type: str,  # 'tts', 'upload', 'music'
        tts_text: Optional[str] = None,
        voice: Optional[str] = None,
        audio_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create final video with audio synchronization
        
        In a real implementation, this would:
        1. Load the 4K animation/image
        2. Process audio (TTS, uploaded file, or music)
        3. Use Wav2Lip for lip synchronization
        4. Use voice cloning models if needed
        5. Render final video with audio
        
        For now, we simulate the video creation process
        """
        
        job_id = str(uuid.uuid4())
        
        # Validate inputs based on audio type
        if audio_type == "tts":
            if not tts_text or not tts_text.strip():
                raise ValueError("TTS text is required for text-to-speech")
            if voice and voice not in self.available_voices:
                raise ValueError(f"Unsupported voice: {voice}")
        elif audio_type == "upload":
            if not audio_file:
                raise ValueError("Audio file is required for upload type")
        
        self.jobs[job_id] = {
            "id": job_id,
            "source_id": source_id,
            "audio_type": audio_type,
            "tts_text": tts_text,
            "voice": voice or "vi-female-1",
            "audio_file": audio_file,
            "status": "processing",
            "progress": 0,
            "created_at": asyncio.get_event_loop().time(),
            "estimated_time": self._get_estimated_time(audio_type)
        }
        
        # Start background video processing
        asyncio.create_task(self._process_video(job_id))
        
        logger.info(f"Started video creation job {job_id} with audio type {audio_type}")
        
        return {
            "id": job_id,
            "status": "processing",
            "estimated_time": self._get_estimated_time_string(audio_type)
        }
    
    async def get_status(self, job_id: str) -> Dict[str, Any]:
        """Get video creation job status"""
        if job_id not in self.jobs:
            raise ValueError(f"Video job {job_id} not found")
        
        job = self.jobs[job_id]
        return {
            "job_id": job_id,
            "status": job["status"],
            "progress": job["progress"],
            "message": self._get_progress_message(job),
            "estimated_time_remaining": self._calculate_remaining_time(job),
            "current_step": job.get("current_step", "Đang chuẩn bị...")
        }
    
    async def _process_video(self, job_id: str):
        """Process video creation in background"""
        job = self.jobs[job_id]
        audio_type = job["audio_type"]
        
        try:
            # Step 1: Prepare audio
            await self._prepare_audio(job)
            
            # Step 2: Load and prepare video source
            await self._prepare_video_source(job)
            
            # Step 3: Synchronize audio and video
            await self._synchronize_audio_video(job)
            
            # Step 4: Render final video
            await self._render_final_video(job)
            
            # Complete the job
            job["status"] = "completed"
            job["progress"] = 100
            job["output_url"] = f"/videos/{job_id}.mp4"
            job["thumbnail_url"] = f"/videos/{job_id}_thumb.jpg"
            job["duration"] = self._calculate_duration(job)
            job["file_size"] = self._estimate_file_size(job)
            
            logger.info(f"Video creation job {job_id} completed successfully")
            
        except Exception as e:
            job["status"] = "failed"
            job["error"] = str(e)
            logger.error(f"Video creation job {job_id} failed: {e}")
    
    async def _prepare_audio(self, job: Dict[str, Any]):
        """Prepare audio based on type"""
        audio_type = job["audio_type"]
        
        if audio_type == "tts":
            # Text-to-speech processing
            steps = [
                (5, "Đang phân tích văn bản..."),
                (10, "Đang tạo giọng nói..."),
                (15, "Đang tối ưu âm thanh...")
            ]
            
            for progress, message in steps:
                job["progress"] = progress
                job["current_step"] = message
                await asyncio.sleep(8)
                
        elif audio_type == "upload":
            # Process uploaded audio
            steps = [
                (5, "Đang tải audio file..."),
                (10, "Đang phân tích audio..."),
                (15, "Đang tối ưu chất lượng...")
            ]
            
            for progress, message in steps:
                job["progress"] = progress
                job["current_step"] = message
                await asyncio.sleep(5)
                
        elif audio_type == "music":
            # Process background music
            steps = [
                (5, "Đang chọn nhạc nền..."),
                (10, "Đang mix audio..."),
                (15, "Đang điều chỉnh volume...")
            ]
            
            for progress, message in steps:
                job["progress"] = progress
                job["current_step"] = message
                await asyncio.sleep(5)
    
    async def _prepare_video_source(self, job: Dict[str, Any]):
        """Prepare video source (4K animation)"""
        steps = [
            (20, "Đang tải animation 4K..."),
            (25, "Đang phân tích video frames..."),
            (30, "Đang detect facial landmarks...")
        ]
        
        for progress, message in steps:
            job["progress"] = progress
            job["current_step"] = message
            await asyncio.sleep(10)
    
    async def _synchronize_audio_video(self, job: Dict[str, Any]):
        """Synchronize audio with video using lip sync"""
        # This is the most time-consuming step
        total_frames = 450  # 15 seconds at 30fps
        processed_frames = 0
        
        job["total_frames"] = total_frames
        
        # Initial setup
        job["progress"] = 35
        job["current_step"] = "Đang khởi tạo Wav2Lip model..."
        await asyncio.sleep(15)
        
        # Process frames for lip sync
        while processed_frames < total_frames:
            batch_size = 10
            batch_end = min(processed_frames + batch_size, total_frames)
            
            for frame in range(processed_frames, batch_end):
                # Progress from 40% to 80% during frame processing
                progress = 40 + int((frame / total_frames) * 40)
                job["progress"] = progress
                job["current_step"] = f"Đồng bộ frame {frame + 1}/{total_frames}..."
                
                await asyncio.sleep(0.5)  # Simulate per-frame processing
            
            processed_frames = batch_end
        
        # Final sync adjustments
        final_steps = [
            (82, "Đang tinh chỉnh đồng bộ..."),
            (85, "Đang smooth transitions...")
        ]
        
        for progress, message in final_steps:
            job["progress"] = progress
            job["current_step"] = message
            await asyncio.sleep(10)
    
    async def _render_final_video(self, job: Dict[str, Any]):
        """Render final video with audio"""
        steps = [
            (88, "Đang ghép audio và video..."),
            (92, "Đang encode video 4K..."),
            (96, "Đang tạo thumbnail..."),
            (98, "Đang tối ưu file size...")
        ]
        
        for progress, message in steps:
            job["progress"] = progress
            job["current_step"] = message
            await asyncio.sleep(15)
    
    def _get_estimated_time(self, audio_type: str) -> int:
        """Get estimated processing time in seconds"""
        # Video creation is the most time-consuming process
        base_time = 900  # 15 minutes base
        
        time_additions = {
            "tts": 0,       # TTS is fast
            "upload": 60,   # Audio processing adds 1 minute
            "music": 30     # Music mixing adds 30 seconds
        }
        
        return base_time + time_additions.get(audio_type, 0)
    
    def _get_estimated_time_string(self, audio_type: str) -> str:
        """Get estimated time as human readable string"""
        time_strings = {
            "tts": "15-20 phút",
            "upload": "16-22 phút",
            "music": "15-18 phút"
        }
        return time_strings.get(audio_type, "15-20 phút")
    
    def _get_progress_message(self, job: Dict[str, Any]) -> str:
        """Get current progress message"""
        if "current_step" in job:
            return job["current_step"]
        
        progress = job["progress"]
        if progress < 15:
            return "Đang chuẩn bị audio..."
        elif progress < 35:
            return "Đang chuẩn bị video..."
        elif progress < 85:
            return "Đang đồng bộ audio-video..."
        else:
            return "Đang render video cuối cùng..."
    
    def _calculate_remaining_time(self, job: Dict[str, Any]) -> str:
        """Calculate estimated remaining time"""
        if job["status"] == "completed":
            return "0 phút"
        
        progress = job["progress"]
        total_time = job["estimated_time"]
        
        if progress == 0:
            return self._get_estimated_time_string(job["audio_type"])
        
        remaining_seconds = int((100 - progress) / 100 * total_time)
        remaining_minutes = max(1, remaining_seconds // 60)
        
        return f"{remaining_minutes} phút"
    
    def _calculate_duration(self, job: Dict[str, Any]) -> str:
        """Calculate video duration based on audio"""
        # Simulate duration calculation
        if job["audio_type"] == "tts" and job["tts_text"]:
            # Rough estimation: 150 words per minute
            word_count = len(job["tts_text"].split())
            duration_seconds = int((word_count / 150) * 60)
        else:
            duration_seconds = 15  # Default 15 seconds
        
        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        
        return f"{minutes:02d}:{seconds:02d}"
    
    def _estimate_file_size(self, job: Dict[str, Any]) -> str:
        """Estimate final video file size"""
        # 4K video is large
        return "150-300 MB"