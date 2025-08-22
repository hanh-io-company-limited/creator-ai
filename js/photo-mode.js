// Creator AI - Photo Mode Module

class PhotoMode {
    constructor() {
        this.uploadedPhotos = [];
        this.maxPhotos = 10;
        this.isTraining = false;
        this.isGenerating = false;
        this.generatedAvatars = [];
        
        this.init();
    }
    
    init() {
        this.initElements();
        this.initEventListeners();
        this.loadSavedData();
    }
    
    initElements() {
        this.uploadArea = document.getElementById('photoUploadArea');
        this.fileInput = document.getElementById('photoInput');
        this.previewGrid = document.getElementById('photoPreviewGrid');
        this.trainingProgress = document.getElementById('photoTrainingProgress');
        this.progressFill = document.getElementById('photoProgressFill');
        this.progressText = document.getElementById('photoProgressText');
        this.promptInput = document.getElementById('photoPrompt');
        this.audioInput = document.getElementById('photoAudioInput');
        this.scriptInput = document.getElementById('photoScript');
        this.voiceInput = document.getElementById('photoVoiceInput');
        this.generatedContent = document.getElementById('photoGeneratedContent');
        
        // Buttons
        this.trainBtn = document.getElementById('photoTrainBtn');
        this.generateBtn = document.getElementById('photoGenerateBtn');
        this.animateBtn = document.getElementById('photoAnimateBtn');
        this.upscaleBtn = document.getElementById('photoUpscaleBtn');
        this.createVideoBtn = document.getElementById('photoCreateVideoBtn');
    }
    
    initEventListeners() {
        // File input
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        // Button clicks
        this.trainBtn.addEventListener('click', this.startTraining.bind(this));
        this.generateBtn.addEventListener('click', this.generateAvatars.bind(this));
        this.animateBtn.addEventListener('click', this.animateAvatars.bind(this));
        this.upscaleBtn.addEventListener('click', this.upscaleImages.bind(this));
        this.createVideoBtn.addEventListener('click', this.createVideo.bind(this));
        
        // Auto-save inputs
        this.promptInput.addEventListener('input', Utils.debounce(() => {
            this.saveData();
        }, 500));
        
        this.scriptInput.addEventListener('input', Utils.debounce(() => {
            this.saveData();
        }, 500));
    }
    
    handleFileSelect(files) {
        const fileArray = Array.from(files);
        
        // Check if adding these files would exceed the limit
        if (this.uploadedPhotos.length + fileArray.length > this.maxPhotos) {
            Utils.showNotification(
                `Chỉ có thể tải lên tối đa ${this.maxPhotos} ảnh. Hiện tại bạn đã có ${this.uploadedPhotos.length} ảnh.`,
                'error'
            );
            return;
        }
        
        fileArray.forEach(file => {
            const validation = Utils.validateFile(file, 'image');
            if (validation.valid) {
                this.addPhoto(file);
            } else {
                Utils.showNotification(`${file.name}: ${validation.error}`, 'error');
            }
        });
        
        this.updateUI();
    }
    
    addPhoto(file) {
        const photo = {
            id: Utils.generateId(),
            file: file,
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file)
        };
        
        this.uploadedPhotos.push(photo);
        
        // Create preview
        const preview = Utils.createFilePreview(file, this.previewGrid, () => {
            this.removePhoto(photo.id);
        });
        
        preview.dataset.photoId = photo.id;
        
        this.saveData();
    }
    
    removePhoto(photoId) {
        const index = this.uploadedPhotos.findIndex(p => p.id === photoId);
        if (index > -1) {
            // Revoke object URL to free memory
            URL.revokeObjectURL(this.uploadedPhotos[index].url);
            this.uploadedPhotos.splice(index, 1);
        }
        
        this.updateUI();
        this.saveData();
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        if (!this.uploadArea.contains(e.relatedTarget)) {
            this.uploadArea.classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        this.handleFileSelect(files);
    }
    
    updateUI() {
        // Update button states
        this.trainBtn.disabled = this.uploadedPhotos.length === 0 || this.isTraining;
        
        // Update upload area text
        if (this.uploadedPhotos.length > 0) {
            const uploadText = this.uploadArea.querySelector('.upload-text');
            uploadText.textContent = `${this.uploadedPhotos.length}/${this.maxPhotos} ảnh đã tải lên`;
        }
    }
    
    async startTraining() {
        if (this.uploadedPhotos.length === 0) {
            Utils.showNotification('Vui lòng tải lên ít nhất 1 ảnh', 'error');
            return;
        }
        
        this.isTraining = true;
        this.trainBtn.disabled = true;
        this.trainBtn.textContent = '🔄 Đang huấn luyện...';
        
        Utils.showProgress(this.trainingProgress);
        
        // Simulate AI training process
        Utils.simulateProgress(
            this.trainingProgress,
            this.progressText,
            5000, // 5 seconds
            () => {
                this.onTrainingComplete();
            }
        );
        
        Utils.showNotification('Bắt đầu huấn luyện mô hình AI...', 'info');
    }
    
    onTrainingComplete() {
        this.isTraining = false;
        Utils.hideProgress(this.trainingProgress);
        
        this.trainBtn.textContent = '✅ Đã huấn luyện';
        this.trainBtn.disabled = true;
        
        // Enable next step
        this.generateBtn.disabled = false;
        
        Utils.showNotification('Huấn luyện mô hình AI hoàn thành!', 'success');
        this.saveData();
    }
    
    async generateAvatars() {
        if (!this.promptInput.value.trim()) {
            Utils.showNotification('Vui lòng nhập mô tả avatar', 'error');
            return;
        }
        
        this.isGenerating = true;
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = '🔄 Đang tạo avatar...';
        
        // Simulate avatar generation
        setTimeout(() => {
            this.createGeneratedAvatars();
        }, 3000);
        
        Utils.showNotification('Đang tạo 4 avatar AI...', 'info');
    }
    
    createGeneratedAvatars() {
        // Clear previous results
        this.generatedContent.innerHTML = '';
        
        // Generate 4 AI avatars
        for (let i = 1; i <= 4; i++) {
            const avatarSrc = Utils.generatePlaceholderImage(400, 400, `AI Photo ${i}`);
            const avatarItem = Utils.createGeneratedItem(
                avatarSrc,
                `AI Photo ${i}`,
                'image'
            );
            
            this.generatedContent.appendChild(avatarItem);
        }
        
        this.generatedAvatars = Array.from(this.generatedContent.children);
        
        this.isGenerating = false;
        this.generateBtn.textContent = '✅ Đã tạo avatar';
        this.generateBtn.disabled = true;
        
        // Enable next steps
        this.animateBtn.disabled = false;
        this.upscaleBtn.disabled = false;
        
        Utils.showNotification('Tạo avatar thành công! 4 ảnh AI đã được tạo.', 'success');
        this.saveData();
    }
    
    async animateAvatars() {
        if (this.generatedAvatars.length === 0) {
            Utils.showNotification('Vui lòng tạo avatar trước', 'error');
            return;
        }
        
        this.animateBtn.disabled = true;
        this.animateBtn.textContent = '🔄 Đang tạo chuyển động...';
        
        // Simulate animation process
        setTimeout(() => {
            this.createAnimatedVideos();
        }, 4000);
        
        Utils.showNotification('Đang thêm chuyển động vào avatar...', 'info');
    }
    
    createAnimatedVideos() {
        // Add animated videos to generated content
        for (let i = 1; i <= 4; i++) {
            const videoSrc = Utils.generatePlaceholderVideo();
            const videoItem = Utils.createGeneratedItem(
                videoSrc,
                `Video chuyển động ${i}`,
                'video'
            );
            
            this.generatedContent.appendChild(videoItem);
        }
        
        this.animateBtn.textContent = '✅ Đã tạo chuyển động';
        this.animateBtn.disabled = true;
        
        // Enable video creation
        this.createVideoBtn.disabled = false;
        
        Utils.showNotification('Tạo chuyển động thành công! 4 video 5-10 giây đã được tạo.', 'success');
    }
    
    async upscaleImages() {
        if (this.generatedAvatars.length === 0) {
            Utils.showNotification('Vui lòng tạo avatar trước', 'error');
            return;
        }
        
        this.upscaleBtn.disabled = true;
        this.upscaleBtn.textContent = '🔄 Đang nâng cấp 4K...';
        
        // Simulate upscaling process
        setTimeout(() => {
            this.create4KImages();
        }, 3000);
        
        Utils.showNotification('Đang nâng cấp ảnh lên độ phân giải 4K...', 'info');
    }
    
    create4KImages() {
        // Add 4K versions to generated content
        for (let i = 1; i <= 4; i++) {
            const image4K = Utils.generatePlaceholderImage(800, 800, `4K Image ${i}`);
            const imageItem = Utils.createGeneratedItem(
                image4K,
                `Ảnh 4K ${i}`,
                'image'
            );
            
            this.generatedContent.appendChild(imageItem);
        }
        
        this.upscaleBtn.textContent = '✅ Đã nâng cấp 4K';
        this.upscaleBtn.disabled = true;
        
        Utils.showNotification('Nâng cấp 4K thành công!', 'success');
    }
    
    async createVideo() {
        const hasAudio = this.audioInput.files.length > 0;
        const hasScript = this.scriptInput.value.trim();
        const hasVoice = this.voiceInput.files.length > 0;
        
        if (!hasAudio && !hasScript) {
            Utils.showNotification('Vui lòng tải MP3 hoặc nhập kịch bản', 'error');
            return;
        }
        
        this.createVideoBtn.disabled = true;
        this.createVideoBtn.textContent = '🔄 Đang tạo video...';
        
        let mode = '';
        if (hasAudio) {
            mode = 'lip-sync với MP3';
        } else if (hasScript && hasVoice) {
            mode = 'tổng hợp giọng nói';
        } else if (hasScript) {
            mode = 'giọng nói mặc định';
        }
        
        Utils.showNotification(`Đang tạo video với ${mode}...`, 'info');
        
        // Simulate video creation
        setTimeout(() => {
            this.createFinalVideos();
        }, 6000);
    }
    
    createFinalVideos() {
        // Add final videos to generated content
        for (let i = 1; i <= 2; i++) {
            const videoSrc = Utils.generatePlaceholderVideo();
            const videoItem = Utils.createGeneratedItem(
                videoSrc,
                `Video 1080p ${i}`,
                'video'
            );
            
            this.generatedContent.appendChild(videoItem);
        }
        
        this.createVideoBtn.textContent = '✅ Đã tạo video';
        this.createVideoBtn.disabled = true;
        
        Utils.showNotification('Tạo video 1080p thành công!', 'success');
    }
    
    saveData() {
        const data = {
            promptText: this.promptInput.value,
            scriptText: this.scriptInput.value,
            isTrainingComplete: this.trainBtn.textContent.includes('✅'),
            hasGeneratedAvatars: this.generatedAvatars.length > 0,
            timestamp: new Date().toISOString()
        };
        
        Utils.saveToStorage('photoMode', data);
    }
    
    loadSavedData() {
        const data = Utils.loadFromStorage('photoMode');
        if (data) {
            this.promptInput.value = data.promptText || '';
            this.scriptInput.value = data.scriptText || '';
            
            if (data.isTrainingComplete) {
                this.trainBtn.textContent = '✅ Đã huấn luyện';
                this.trainBtn.disabled = true;
                this.generateBtn.disabled = false;
            }
        }
    }
    
    reset() {
        // Clear uploaded photos
        this.uploadedPhotos.forEach(photo => {
            URL.revokeObjectURL(photo.url);
        });
        this.uploadedPhotos = [];
        
        // Clear UI
        this.previewGrid.innerHTML = '';
        this.generatedContent.innerHTML = '';
        this.promptInput.value = '';
        this.scriptInput.value = '';
        this.audioInput.value = '';
        this.voiceInput.value = '';
        
        // Reset buttons
        this.trainBtn.disabled = true;
        this.trainBtn.textContent = '🤖 Huấn luyện mô hình AI';
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = '✨ Tạo Avatar';
        this.animateBtn.disabled = true;
        this.animateBtn.textContent = '🎬 Tạo chuyển động';
        this.upscaleBtn.disabled = true;
        this.upscaleBtn.textContent = '📈 Nâng cấp 4K';
        this.createVideoBtn.disabled = true;
        this.createVideoBtn.textContent = '🎥 Tạo Video';
        
        // Reset state
        this.isTraining = false;
        this.isGenerating = false;
        this.generatedAvatars = [];
        
        // Hide progress
        Utils.hideProgress(this.trainingProgress);
        
        // Clear storage
        Utils.removeFromStorage('photoMode');
        
        this.updateUI();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('photo-tab')) {
        window.photoMode = new PhotoMode();
    }
});