// Global variables
let currentAvatarType = 'photo';
let uploadedFile = null;
let uploadedAudio = null;
let processingInterval = null;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const photoUpload = document.getElementById('photo-upload');
const videoUpload = document.getElementById('video-upload');
const audioUploadArea = document.getElementById('audio-upload');
const photoInput = document.getElementById('photo-input');
const videoInput = document.getElementById('video-input');
const audioInput = document.getElementById('audio-input');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    showTab('photo'); // Default to photo tab
});

// Event Listeners
function initializeEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
        });
    });

    // Photo upload
    photoUpload.addEventListener('click', () => photoInput.click());
    photoUpload.addEventListener('dragover', handleDragOver);
    photoUpload.addEventListener('drop', (e) => handleFileDrop(e, 'photo'));
    photoInput.addEventListener('change', (e) => handleFileSelect(e, 'photo'));

    // Video upload
    videoUpload.addEventListener('click', () => videoInput.click());
    videoUpload.addEventListener('dragover', handleDragOver);
    videoUpload.addEventListener('drop', (e) => handleFileDrop(e, 'video'));
    videoInput.addEventListener('change', (e) => handleFileSelect(e, 'video'));

    // Audio upload
    audioUploadArea.addEventListener('click', () => audioInput.click());
    audioUploadArea.addEventListener('dragover', handleDragOver);
    audioUploadArea.addEventListener('drop', (e) => handleFileDrop(e, 'audio'));
    audioInput.addEventListener('change', (e) => handleFileSelect(e, 'audio'));
}

// Tab management
function showTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update tab content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    currentAvatarType = tabName;
    
    // Reset content creation section when switching tabs
    hideSection('content-creation');
    hideSection('processing-section');
    hideSection('results-section');
}

// File handling
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleFileDrop(e, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0], type);
    }
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (file) {
        processFile(file, type);
    }
}

function processFile(file, type) {
    if (type === 'photo') {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        processPhotoFile(file);
    } else if (type === 'video') {
        if (!file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }
        processVideoFile(file);
    } else if (type === 'audio') {
        if (!file.type.startsWith('audio/')) {
            alert('Please select a valid audio file (MP3).');
            return;
        }
        processAudioFile(file);
    }
}

function processPhotoFile(file) {
    window.uploadedFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `
            <img src="${e.target.result}" alt="Uploaded photo">
            <p><strong>File:</strong> ${file.name}</p>
            <p><strong>Size:</strong> ${formatFileSize(file.size)}</p>
        `;
        preview.classList.remove('hidden');
        showSection('content-creation');
    };
    reader.readAsDataURL(file);
}

function processVideoFile(file) {
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        alert('Video file is too large. Please select a file under 50MB.');
        return;
    }

    window.uploadedFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const video = document.createElement('video');
        video.src = e.target.result;
        video.onloadedmetadata = function() {
            const duration = video.duration;
            
            // Validate duration (3-5 seconds)
            if (duration < 3 || duration > 5) {
                alert(`Video must be between 3-5 seconds long. Your video is ${duration.toFixed(1)} seconds.`);
                return;
            }

            const preview = document.getElementById('video-preview');
            preview.innerHTML = `
                <video src="${e.target.result}" controls style="max-width: 100%; max-height: 300px;">
                    Your browser does not support the video tag.
                </video>
                <p><strong>File:</strong> ${file.name}</p>
                <p><strong>Duration:</strong> ${duration.toFixed(1)} seconds</p>
                <p><strong>Size:</strong> ${formatFileSize(file.size)}</p>
                <p class="text-center" style="color: #28a745; font-weight: bold;">✓ Video meets requirements</p>
            `;
            preview.classList.remove('hidden');
            showSection('content-creation');
        };
    };
    reader.readAsDataURL(file);
}

function processAudioFile(file) {
    window.uploadedAudio = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('audio-preview');
        preview.innerHTML = `
            <audio src="${e.target.result}" controls style="width: 100%;">
                Your browser does not support the audio tag.
            </audio>
            <p><strong>File:</strong> ${file.name}</p>
            <p><strong>Size:</strong> ${formatFileSize(file.size)}</p>
        `;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Content generation functions
function generateFromScript() {
    const script = document.getElementById('script-input').value.trim();
    
    if (!window.uploadedFile) {
        alert(`Please upload a ${currentAvatarType} first.`);
        return;
    }
    
    if (!script) {
        alert('Please enter a script.');
        return;
    }

    startProcessing('script', { script });
}

function syncWithAudio() {
    if (!window.uploadedFile) {
        alert(`Please upload a ${currentAvatarType} first.`);
        return;
    }
    
    if (!window.uploadedAudio) {
        alert('Please upload an audio file first.');
        return;
    }

    startProcessing('audio', { audio: window.uploadedAudio });
}

function generateWithVoice() {
    const script = document.getElementById('voice-script').value.trim();
    const emotion = document.getElementById('emotion-select').value;
    
    if (!window.uploadedFile) {
        alert(`Please upload a ${currentAvatarType} first.`);
        return;
    }
    
    if (!script) {
        alert('Please enter text for voice generation.');
        return;
    }

    startProcessing('voice', { script, emotion });
}

// Processing simulation
function startProcessing(type, options) {
    hideSection('content-creation');
    showSection('processing-section');
    
    const progressFill = document.getElementById('progress-fill');
    const processingText = document.getElementById('processing-text');
    
    const steps = [
        'Analyzing uploaded content...',
        'Generating avatar model...',
        'Processing facial features...',
        'Synchronizing lip movements...',
        'Applying emotion mapping...',
        'Rendering video in 1080p...',
        'Finalizing output...'
    ];
    
    let currentStep = 0;
    let progress = 0;
    
    processingInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress increment
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(processingInterval);
            setTimeout(() => {
                hideSection('processing-section');
                showResults(type, options);
            }, 1000);
        }
        
        // Update step text
        if (currentStep < steps.length - 1 && progress > (currentStep + 1) * (100 / steps.length)) {
            currentStep++;
        }
        
        progressFill.style.width = `${progress}%`;
        processingText.textContent = steps[currentStep];
    }, 500);
}

function showResults(type, options) {
    showSection('results-section');
    
    // Create a demo video URL (placeholder)
    const demoVideoUrl = createDemoVideo(type, options);
    const resultVideo = document.getElementById('result-video');
    const resultDuration = document.getElementById('result-duration');
    
    resultVideo.src = demoVideoUrl;
    
    // Calculate estimated duration based on input
    let estimatedDuration = '10-15 seconds';
    if (type === 'audio' && uploadedAudio) {
        estimatedDuration = 'Match audio length';
    } else if (type === 'script') {
        const script = options.script;
        const words = script.split(' ').length;
        const duration = Math.ceil(words / 2.5); // ~2.5 words per second
        estimatedDuration = `${duration} seconds`;
    }
    
    resultDuration.textContent = estimatedDuration;
}

function createDemoVideo(type, options) {
    // In a real implementation, this would return the actual generated video URL
    // For demo purposes, we'll create a placeholder
    return 'data:video/mp4;base64,'; // Empty video data URL for demo
}

// Utility functions
function showSection(sectionId) {
    document.getElementById(sectionId).classList.remove('hidden');
}

function hideSection(sectionId) {
    document.getElementById(sectionId).classList.add('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadVideo() {
    // In a real implementation, this would download the generated video
    alert('Download functionality would be implemented here. In a real application, this would download the generated 1080p video file.');
}

function createNew() {
    // Reset the application to start over
    window.uploadedFile = null;
    window.uploadedAudio = null;
    
    // Clear all previews
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('video-preview').classList.add('hidden');
    document.getElementById('audio-preview').classList.add('hidden');
    
    // Clear form inputs
    document.getElementById('script-input').value = '';
    document.getElementById('voice-script').value = '';
    document.getElementById('emotion-select').value = 'neutral';
    
    // Reset file inputs
    photoInput.value = '';
    videoInput.value = '';
    audioInput.value = '';
    
    // Hide sections
    hideSection('content-creation');
    hideSection('processing-section');
    hideSection('results-section');
    
    // Clear any running intervals
    if (processingInterval) {
        clearInterval(processingInterval);
    }
    
    // Reset progress
    document.getElementById('progress-fill').style.width = '0%';
}

// Add drag and drop visual feedback
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    // Remove dragover class from all upload areas
    document.querySelectorAll('.upload-area, .audio-upload-area').forEach(area => {
        area.classList.remove('dragover');
    });
});

// Add drag enter/leave events for better UX
document.querySelectorAll('.upload-area, .audio-upload-area').forEach(area => {
    area.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    });
    
    area.addEventListener('dragleave', (e) => {
        e.preventDefault();
        // Only remove dragover if we're leaving the element entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('dragover');
        }
    });
});