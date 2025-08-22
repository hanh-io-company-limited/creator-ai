// Creator AI JavaScript - Video Processing and UI Management

class CreatorAI {
    constructor() {
        this.currentVideo = null;
        this.currentAspectRatio = '16:9';
        this.maxDuration = 300; // 5 minutes in seconds
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Video input handling
        const videoInput = document.getElementById('videoInput');
        videoInput.addEventListener('change', this.handleVideoUpload.bind(this));

        // Drag and drop functionality
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // Duration controls
        const maxDurationSelect = document.getElementById('maxDuration');
        maxDurationSelect.addEventListener('change', this.updateMaxDuration.bind(this));

        // Trim controls
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        startTime.addEventListener('input', this.updateTrimDisplay.bind(this));
        endTime.addEventListener('input', this.updateTrimDisplay.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('video/')) {
            this.processVideoFile(files[0]);
        }
    }

    async handleVideoUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            this.processVideoFile(file);
        }
    }

    async processVideoFile(file) {
        try {
            // Create video element for processing
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            video.src = url;

            video.addEventListener('loadedmetadata', () => {
                this.currentVideo = video;
                this.displayVideoPreview(video, file);
                this.validateVideoDuration(video.duration);
                this.showControls();
                this.updateCropPreview();
            });

            video.load();
        } catch (error) {
            console.error('Error processing video file:', error);
            alert('Error processing video file. Please try again.');
        }
    }

    displayVideoPreview(video, file) {
        // Update preview video
        const previewVideo = document.getElementById('previewVideo');
        previewVideo.src = video.src;
        
        // Show video info
        const duration = this.formatTime(video.duration);
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        
        document.getElementById('videoDuration').textContent = `Duration: ${duration}`;
        document.getElementById('videoResolution').textContent = `Resolution: ${resolution}`;
        
        // Show preview section
        document.getElementById('videoPreview').style.display = 'block';
        
        // Update trim controls max values
        this.updateTrimControls(video.duration);
    }

    validateVideoDuration(duration) {
        if (duration > this.maxDuration) {
            const maxFormatted = this.formatTime(this.maxDuration);
            const currentFormatted = this.formatTime(duration);
            alert(`Video duration (${currentFormatted}) exceeds maximum allowed duration (${maxFormatted}). Please trim the video or select a longer duration limit.`);
        }
    }

    updateMaxDuration(e) {
        this.maxDuration = parseInt(e.target.value);
        if (this.currentVideo) {
            this.validateVideoDuration(this.currentVideo.duration);
        }
    }

    updateTrimControls(videoDuration) {
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        
        startTime.max = videoDuration;
        endTime.max = videoDuration;
        endTime.value = Math.min(videoDuration, this.maxDuration);
        
        this.updateTrimDisplay();
    }

    updateTrimDisplay() {
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        const startTimeDisplay = document.getElementById('startTimeDisplay');
        const endTimeDisplay = document.getElementById('endTimeDisplay');
        
        const startSeconds = parseFloat(startTime.value);
        const endSeconds = parseFloat(endTime.value);
        
        // Ensure end time is not before start time
        if (endSeconds <= startSeconds) {
            endTime.value = startSeconds + 1;
        }
        
        startTimeDisplay.textContent = this.formatTime(startSeconds);
        endTimeDisplay.textContent = this.formatTime(parseFloat(endTime.value));
        
        // Update video preview time if available
        if (this.currentVideo) {
            this.currentVideo.currentTime = startSeconds;
        }
    }

    showControls() {
        document.getElementById('controlsSection').style.display = 'block';
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateCropPreview() {
        if (!this.currentVideo) return;

        const canvas = document.getElementById('cropCanvas');
        const ctx = canvas.getContext('2d');
        
        // Wait for video to be ready
        this.currentVideo.addEventListener('loadeddata', () => {
            this.drawCropPreview(canvas, ctx);
        });
        
        if (this.currentVideo.readyState >= 2) {
            this.drawCropPreview(canvas, ctx);
        }
    }

    drawCropPreview(canvas, ctx) {
        const video = this.currentVideo;
        const [ratioW, ratioH] = this.currentAspectRatio.split(':').map(Number);
        
        // Calculate dimensions for preview
        const maxWidth = 400;
        const maxHeight = 300;
        
        let previewWidth, previewHeight;
        
        if (video.videoWidth / video.videoHeight > maxWidth / maxHeight) {
            previewWidth = maxWidth;
            previewHeight = (maxWidth * video.videoHeight) / video.videoWidth;
        } else {
            previewHeight = maxHeight;
            previewWidth = (maxHeight * video.videoWidth) / video.videoHeight;
        }
        
        canvas.width = previewWidth;
        canvas.height = previewHeight;
        
        // Draw the video frame
        ctx.drawImage(video, 0, 0, previewWidth, previewHeight);
        
        // Calculate crop area for selected aspect ratio
        const targetRatio = ratioW / ratioH;
        const currentRatio = previewWidth / previewHeight;
        
        let cropX, cropY, cropWidth, cropHeight;
        
        if (currentRatio > targetRatio) {
            // Video is wider than target ratio
            cropHeight = previewHeight;
            cropWidth = previewHeight * targetRatio;
            cropX = (previewWidth - cropWidth) / 2;
            cropY = 0;
        } else {
            // Video is taller than target ratio
            cropWidth = previewWidth;
            cropHeight = previewWidth / targetRatio;
            cropX = 0;
            cropY = (previewHeight - cropHeight) / 2;
        }
        
        // Draw crop overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, previewWidth, previewHeight);
        ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
        
        // Draw crop border
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    }

    async processVideo() {
        if (!this.currentVideo) {
            alert('Please upload a video first.');
            return;
        }

        const processBtn = document.getElementById('processBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        // Disable process button and show progress
        processBtn.disabled = true;
        progressContainer.style.display = 'block';
        
        try {
            // Simulate AI processing with progress updates
            const steps = [
                'Analyzing video content...',
                'Applying aspect ratio adjustments...',
                'Processing expression synchronization...',
                'Optimizing lip synchronization...',
                'Applying emotion synchronization...',
                'Finalizing video output...'
            ];
            
            for (let i = 0; i < steps.length; i++) {
                const progress = ((i + 1) / steps.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${steps[i]} ${Math.round(progress)}%`;
                
                // Simulate processing time
                await this.delay(1000 + Math.random() * 2000);
            }
            
            // Create processed video output
            this.createOutputVideo();
            
        } catch (error) {
            console.error('Error processing video:', error);
            alert('Error processing video. Please try again.');
        } finally {
            processBtn.disabled = false;
            progressContainer.style.display = 'none';
        }
    }

    createOutputVideo() {
        const outputCanvas = document.getElementById('outputCanvas');
        const ctx = outputCanvas.getContext('2d');
        const video = this.currentVideo;
        
        // Get trim settings
        const startTime = parseFloat(document.getElementById('startTime').value);
        const endTime = parseFloat(document.getElementById('endTime').value);
        
        // Calculate output dimensions based on aspect ratio
        const [ratioW, ratioH] = this.currentAspectRatio.split(':').map(Number);
        const targetRatio = ratioW / ratioH;
        
        let outputWidth, outputHeight;
        const maxOutputSize = 800;
        
        if (targetRatio > 1) {
            outputWidth = maxOutputSize;
            outputHeight = maxOutputSize / targetRatio;
        } else {
            outputHeight = maxOutputSize;
            outputWidth = maxOutputSize * targetRatio;
        }
        
        outputCanvas.width = outputWidth;
        outputCanvas.height = outputHeight;
        
        // Set video to start time and draw frame
        video.currentTime = startTime;
        video.addEventListener('seeked', () => {
            this.drawCroppedFrame(ctx, video, outputWidth, outputHeight);
        }, { once: true });
        
        // Show output section
        document.getElementById('outputSection').style.display = 'block';
        
        // Scroll to output
        document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
    }

    drawCroppedFrame(ctx, video, outputWidth, outputHeight) {
        const [ratioW, ratioH] = this.currentAspectRatio.split(':').map(Number);
        const targetRatio = ratioW / ratioH;
        const currentRatio = video.videoWidth / video.videoHeight;
        
        let sourceX, sourceY, sourceWidth, sourceHeight;
        
        if (currentRatio > targetRatio) {
            // Video is wider than target ratio - crop sides
            sourceHeight = video.videoHeight;
            sourceWidth = video.videoHeight * targetRatio;
            sourceX = (video.videoWidth - sourceWidth) / 2;
            sourceY = 0;
        } else {
            // Video is taller than target ratio - crop top/bottom
            sourceWidth = video.videoWidth;
            sourceHeight = video.videoWidth / targetRatio;
            sourceX = 0;
            sourceY = (video.videoHeight - sourceHeight) / 2;
        }
        
        // Draw the cropped video frame
        ctx.drawImage(
            video,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, outputWidth, outputHeight
        );
        
        // Add processing indicators (simulating AI features)
        this.addProcessingIndicators(ctx, outputWidth, outputHeight);
    }

    addProcessingIndicators(ctx, width, height) {
        // Add subtle indicators that AI processing has been applied
        const features = this.getEnabledFeatures();
        
        if (features.length > 0) {
            ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            // Add watermark-style indicator
            ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
            ctx.font = '12px Arial';
            ctx.fillText(`AI Enhanced: ${features.join(', ')}`, 10, height - 10);
        }
    }

    getEnabledFeatures() {
        const features = [];
        if (document.getElementById('expressionSync').checked) features.push('Expression Sync');
        if (document.getElementById('lipSync').checked) features.push('Lip Sync');
        if (document.getElementById('voiceCloning').checked) features.push('Voice Clone');
        if (document.getElementById('emotionSync').checked) features.push('Emotion Sync');
        return features;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    downloadVideo() {
        const canvas = document.getElementById('outputCanvas');
        
        // Create download link
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `creator-ai-video-${this.currentAspectRatio.replace(':', 'x')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        
        // Note: In a real implementation, this would generate an actual video file
        // This demo creates a PNG snapshot of the processed frame
        alert('Video frame downloaded! In a full implementation, this would generate a complete video file.');
    }

    resetInterface() {
        // Reset all sections
        document.getElementById('videoPreview').style.display = 'none';
        document.getElementById('controlsSection').style.display = 'none';
        document.getElementById('outputSection').style.display = 'none';
        
        // Reset form
        document.getElementById('videoInput').value = '';
        
        // Reset video
        this.currentVideo = null;
        
        // Reset aspect ratio to default
        this.selectAspectRatio('16:9');
        
        // Reset duration
        document.getElementById('maxDuration').value = '300';
        this.maxDuration = 300;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    selectAspectRatio(ratio) {
        this.currentAspectRatio = ratio;
        
        // Update UI
        document.querySelectorAll('.ratio-option').forEach(option => {
            option.classList.remove('active');
        });
        
        document.querySelector(`[data-ratio="${ratio}"]`).classList.add('active');
        
        // Update crop preview if video is loaded
        if (this.currentVideo) {
            this.updateCropPreview();
        }
    }
}

// Global functions for HTML onclick handlers
function selectAspectRatio(ratio) {
    window.creatorAI.selectAspectRatio(ratio);
}

function processVideo() {
    window.creatorAI.processVideo();
}

function downloadVideo() {
    window.creatorAI.downloadVideo();
}

function resetInterface() {
    window.creatorAI.resetInterface();
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.creatorAI = new CreatorAI();
});