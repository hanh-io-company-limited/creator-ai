// DOM elements
const videoUploadArea = document.getElementById('videoUploadArea');
const videoInput = document.getElementById('videoInput');
const videoPreview = document.getElementById('videoPreview');
const uploadedVideo = document.getElementById('uploadedVideo');
const videoFileName = document.getElementById('videoFileName');
const videoDuration = document.getElementById('videoDuration');

const audioUploadArea = document.getElementById('audioUploadArea');
const audioInput = document.getElementById('audioInput');
const audioPreview = document.getElementById('audioPreview');
const uploadedAudio = document.getElementById('uploadedAudio');
const audioFileName = document.getElementById('audioFileName');
const audioDuration = document.getElementById('audioDuration');

const scriptText = document.getElementById('scriptText');
const useUploadedVoice = document.getElementById('useUploadedVoice');
const voiceSelect = document.getElementById('voiceSelect');
const qualitySelect = document.getElementById('qualitySelect');
const generateBtn = document.getElementById('generateBtn');

const statusSection = document.getElementById('statusSection');
const progressFill = document.getElementById('progressFill');
const statusText = document.getElementById('statusText');
const outputSection = document.getElementById('outputSection');
const outputVideo = document.getElementById('outputVideo');

// State management
let uploadedVideoFile = null;
let uploadedAudioFile = null;
let isProcessing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateGenerateButton();
});

function setupEventListeners() {
    // Video upload events
    videoUploadArea.addEventListener('click', () => videoInput.click());
    videoUploadArea.addEventListener('dragover', handleDragOver);
    videoUploadArea.addEventListener('dragleave', handleDragLeave);
    videoUploadArea.addEventListener('drop', (e) => handleDrop(e, 'video'));
    videoInput.addEventListener('change', (e) => handleFileSelect(e, 'video'));

    // Audio upload events
    audioUploadArea.addEventListener('click', () => audioInput.click());
    audioUploadArea.addEventListener('dragover', handleDragOver);
    audioUploadArea.addEventListener('dragleave', handleDragLeave);
    audioUploadArea.addEventListener('drop', (e) => handleDrop(e, 'audio'));
    audioInput.addEventListener('change', (e) => handleFileSelect(e, 'audio'));

    // Form events
    scriptText.addEventListener('input', updateGenerateButton);
    useUploadedVoice.addEventListener('change', updateGenerateButton);
    generateBtn.addEventListener('click', startProcessing);

    // Output actions
    document.querySelector('.download-btn')?.addEventListener('click', downloadVideo);
    document.querySelector('.share-btn')?.addEventListener('click', shareVideo);
    document.querySelector('.restart-btn')?.addEventListener('click', restartProcess);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        processFile(file, type);
    }
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (file) {
        processFile(file, type);
    }
}

function processFile(file, type) {
    if (type === 'video') {
        processVideoFile(file);
    } else if (type === 'audio') {
        processAudioFile(file);
    }
}

function processVideoFile(file) {
    // Validate file type
    if (!file.type.startsWith('video/')) {
        showError('Please select a valid video file.');
        return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
        showError('Video file size must be less than 50MB.');
        return;
    }

    uploadedVideoFile = file;
    
    // Create video preview
    const videoURL = URL.createObjectURL(file);
    uploadedVideo.src = videoURL;
    videoFileName.textContent = file.name;
    
    // Get video duration
    uploadedVideo.addEventListener('loadedmetadata', function() {
        const duration = uploadedVideo.duration;
        videoDuration.textContent = `Duration: ${formatDuration(duration)}`;
        
        // Validate duration (3-5 seconds)
        if (duration < 3 || duration > 5) {
            showError('Video must be between 3-5 seconds long.');
            uploadedVideoFile = null;
            videoPreview.style.display = 'none';
            updateGenerateButton();
            return;
        }
        
        videoPreview.style.display = 'block';
        videoPreview.classList.add('fade-in');
        updateGenerateButton();
    });
}

function processAudioFile(file) {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
        showError('Please select a valid audio file.');
        return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
        showError('Audio file size must be less than 20MB.');
        return;
    }

    uploadedAudioFile = file;
    
    // Create audio preview
    const audioURL = URL.createObjectURL(file);
    uploadedAudio.src = audioURL;
    audioFileName.textContent = file.name;
    
    // Get audio duration
    uploadedAudio.addEventListener('loadedmetadata', function() {
        const duration = uploadedAudio.duration;
        audioDuration.textContent = `Duration: ${formatDuration(duration)}`;
        
        audioPreview.style.display = 'block';
        audioPreview.classList.add('fade-in');
        updateGenerateButton();
    });
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateGenerateButton() {
    const hasVideo = uploadedVideoFile !== null;
    const hasContent = uploadedAudioFile !== null || scriptText.value.trim() !== '';
    
    generateBtn.disabled = !hasVideo || !hasContent || isProcessing;
    
    if (!hasVideo) {
        generateBtn.textContent = 'Upload video to continue';
    } else if (!hasContent) {
        generateBtn.textContent = 'Add audio or script to continue';
    } else if (isProcessing) {
        generateBtn.textContent = 'Processing...';
    } else {
        generateBtn.textContent = 'Generate AI Video Avatar';
    }
}

function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fed7d7;
        color: #c53030;
        padding: 15px 20px;
        border-radius: 8px;
        border-left: 4px solid #e53e3e;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function startProcessing() {
    if (isProcessing) return;
    
    isProcessing = true;
    updateGenerateButton();
    
    // Show status section
    statusSection.style.display = 'block';
    statusSection.classList.add('fade-in');
    
    // Hide output section if visible
    outputSection.style.display = 'none';
    
    // Start the processing simulation
    simulateProcessing();
}

function simulateProcessing() {
    const steps = [
        { id: 'step1', text: 'Analyzing video avatar...', duration: 2000 },
        { id: 'step2', text: 'Processing audio features...', duration: 3000 },
        { id: 'step3', text: 'Generating lip sync...', duration: 4000 },
        { id: 'step4', text: 'Rendering final video...', duration: 3000 }
    ];
    
    let currentStep = 0;
    let totalProgress = 0;
    
    function processStep() {
        if (currentStep >= steps.length) {
            completeProcessing();
            return;
        }
        
        const step = steps[currentStep];
        const stepElement = document.getElementById(step.id);
        
        // Mark current step as active
        stepElement.classList.add('active');
        statusText.textContent = step.text;
        
        // Animate progress
        const stepProgress = 100 / steps.length;
        const startProgress = totalProgress;
        const endProgress = totalProgress + stepProgress;
        
        let progress = startProgress;
        const progressInterval = setInterval(() => {
            progress += (endProgress - startProgress) / (step.duration / 50);
            if (progress >= endProgress) {
                progress = endProgress;
                clearInterval(progressInterval);
                
                // Mark step as completed
                stepElement.classList.remove('active');
                stepElement.classList.add('completed');
                
                totalProgress = endProgress;
                currentStep++;
                
                // Process next step after a short delay
                setTimeout(processStep, 500);
            }
            
            progressFill.style.width = `${progress}%`;
        }, 50);
    }
    
    processStep();
}

function completeProcessing() {
    isProcessing = false;
    
    // Complete progress bar
    progressFill.style.width = '100%';
    statusText.textContent = 'Video generation complete!';
    
    // Show success message
    setTimeout(() => {
        // Hide status section
        statusSection.style.display = 'none';
        
        // Show output section
        showGeneratedVideo();
        updateGenerateButton();
    }, 2000);
}

function showGeneratedVideo() {
    // For demo purposes, we'll use the uploaded video as the "generated" output
    // In a real implementation, this would be the processed video from the AI
    if (uploadedVideoFile) {
        const videoURL = URL.createObjectURL(uploadedVideoFile);
        outputVideo.src = videoURL;
    }
    
    outputSection.style.display = 'block';
    outputSection.classList.add('fade-in');
    
    // Scroll to output section
    outputSection.scrollIntoView({ behavior: 'smooth' });
}

function downloadVideo() {
    if (uploadedVideoFile) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(uploadedVideoFile);
        link.download = `creator-ai-generated-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function shareVideo() {
    if (navigator.share && uploadedVideoFile) {
        navigator.share({
            title: 'Creator AI Generated Video',
            text: 'Check out this AI-generated video avatar!',
            files: [new File([uploadedVideoFile], 'creator-ai-video.mp4', { type: 'video/mp4' })]
        });
    } else {
        // Fallback: copy video URL to clipboard
        if (outputVideo.src) {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showSuccess('Video link copied to clipboard!');
            });
        }
    }
}

function restartProcess() {
    // Reset all states
    isProcessing = false;
    uploadedVideoFile = null;
    uploadedAudioFile = null;
    
    // Reset form
    videoInput.value = '';
    audioInput.value = '';
    scriptText.value = '';
    useUploadedVoice.checked = false;
    qualitySelect.value = '1080p';
    
    // Hide previews and sections
    videoPreview.style.display = 'none';
    audioPreview.style.display = 'none';
    statusSection.style.display = 'none';
    outputSection.style.display = 'none';
    
    // Reset progress
    progressFill.style.width = '0%';
    
    // Reset steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    // Update button
    updateGenerateButton();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #c6f6d5;
        color: #22543d;
        padding: 15px 20px;
        border-radius: 8px;
        border-left: 4px solid #38a169;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Additional utility functions
function validateFileType(file, allowedTypes) {
    return allowedTypes.some(type => file.type.startsWith(type));
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                if (!generateBtn.disabled) {
                    e.preventDefault();
                    startProcessing();
                }
                break;
            case 'r':
                if (outputSection.style.display === 'block') {
                    e.preventDefault();
                    restartProcess();
                }
                break;
        }
    }
});

// Add some helpful tooltips and accessibility features
function addAccessibilityFeatures() {
    // Add ARIA labels
    videoUploadArea.setAttribute('aria-label', 'Upload video file area');
    audioUploadArea.setAttribute('aria-label', 'Upload audio file area');
    generateBtn.setAttribute('aria-label', 'Generate AI video avatar');
    
    // Add keyboard navigation for upload areas
    videoUploadArea.setAttribute('tabindex', '0');
    audioUploadArea.setAttribute('tabindex', '0');
    
    videoUploadArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            videoInput.click();
        }
    });
    
    audioUploadArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            audioInput.click();
        }
    });
}

// Initialize accessibility features
addAccessibilityFeatures();