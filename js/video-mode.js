// Creator AI - Video Mode Module

class VideoMode {
    constructor() {
        this.uploadedVideo = null;
        this.maxDuration = 5; // 5 seconds
        this.isConverting = false;
        this.isProcessing = false;
        this.avatarReady = false;
        
        this.init();
    }
    
    init() {
        this.initElements();
        this.initEventListeners();
        this.loadSavedData();
    }
    
    initElements() {
        this.uploadArea = document.getElementById('videoUploadArea');
        this.fileInput = document.getElementById('videoInput');
        this.previewGrid = document.getElementById('videoPreviewGrid');
        this.conversionProgress = document.getElementById('videoConversionProgress');
        this.progressFill = document.getElementById('videoProgressFill');
        this.progressText = document.getElementById('videoProgressText');
        this.audioInput = document.getElementById('videoAudioInput');
        this.scriptInput = document.getElementById('videoScript');
        this.voiceInput = document.getElementById('videoVoiceInput');
        this.generatedContent = document.getElementById('videoGeneratedContent');
        
        // Buttons
        this.convertBtn = document.getElementById('videoConvertBtn');
        this.syncBtn = document.getElementById('videoSyncBtn');
        this.cloneVoiceBtn = document.getElementById('videoCloneVoiceBtn');
        this.createContentBtn = document.getElementById('videoCreateContentBtn');
        this.exportBtn = document.getElementById('videoExportBtn');
    }
    
    initEventListeners() {
        // File input
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        // Button clicks
        this.convertBtn.addEventListener('click', this.convertToAvatar.bind(this));
        this.syncBtn.addEventListener('click', this.syncExpression.bind(this));
        this.cloneVoiceBtn.addEventListener('click', this.cloneVoice.bind(this));
        this.createContentBtn.addEventListener('click', this.createContent.bind(this));
        this.exportBtn.addEventListener('click', this.exportVideo.bind(this));
        
        // Auto-save inputs
        this.scriptInput.addEventListener('input', Utils.debounce(() => {
            this.saveData();
        }, 500));
    }
    
    handleFileSelect(file) {
        if (!file) return;
        
        const validation = Utils.validateFile(file, 'video');
        if (!validation.valid) {
            Utils.showNotification(validation.error, 'error');
            return;
        }
        
        // Check video duration (simplified - in real app would use video element)
        this.validateAndAddVideo(file);
    }
    
    async validateAndAddVideo(file) {
        try {
            // Create video element to check duration
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            
            video.addEventListener('loadedmetadata', () => {
                if (video.duration > this.maxDuration) {
                    Utils.showNotification(`Video quá dài. Thời lượng tối đa: ${this.maxDuration} giây`, 'error');
                    URL.revokeObjectURL(video.src);
                    return;
                }
                
                this.addVideo(file);
                URL.revokeObjectURL(video.src);
            });
            
            video.addEventListener('error', () => {
                Utils.showNotification('Không thể đọc file video', 'error');
                URL.revokeObjectURL(video.src);
            });
            
        } catch (error) {
            Utils.showNotification('Lỗi khi xử lý video', 'error');
        }
    }
    
    addVideo(file) {
        // Remove previous video if exists
        if (this.uploadedVideo) {
            URL.revokeObjectURL(this.uploadedVideo.url);
            this.previewGrid.innerHTML = '';
        }
        
        this.uploadedVideo = {
            id: Utils.generateId(),
            file: file,
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file)
        };
        
        // Create preview
        const preview = Utils.createFilePreview(file, this.previewGrid, () => {
            this.removeVideo();
        });
        
        this.updateUI();
        this.saveData();
        
        Utils.showNotification('Video đã được tải lên thành công!', 'success');
    }
    
    removeVideo() {
        if (this.uploadedVideo) {
            URL.revokeObjectURL(this.uploadedVideo.url);
            this.uploadedVideo = null;
        }
        
        this.previewGrid.innerHTML = '';
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
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    }
    
    updateUI() {
        // Update button states
        this.convertBtn.disabled = !this.uploadedVideo || this.isConverting;
        
        // Update upload area text
        if (this.uploadedVideo) {
            const uploadText = this.uploadArea.querySelector('.upload-text');
            uploadText.textContent = `Video đã tải lên: ${this.uploadedVideo.name}`;
        }
    }
    
    async convertToAvatar() {
        if (!this.uploadedVideo) {
            Utils.showNotification('Vui lòng tải lên video trước', 'error');
            return;
        }
        
        this.isConverting = true;
        this.convertBtn.disabled = true;
        this.convertBtn.textContent = '🔄 Đang chuyển đổi...';
        
        Utils.showProgress(this.conversionProgress);
        
        // Simulate avatar conversion process
        Utils.simulateProgress(
            this.conversionProgress,
            this.progressText,
            6000, // 6 seconds
            () => {
                this.onConversionComplete();
            }
        );
        
        Utils.showNotification('Bắt đầu chuyển đổi video thành avatar...', 'info');
    }
    
    onConversionComplete() {
        this.isConverting = false;
        this.avatarReady = true;
        
        Utils.hideProgress(this.conversionProgress);
        
        this.convertBtn.textContent = '✅ Đã chuyển đổi';
        this.convertBtn.disabled = true;
        
        // Enable next steps
        this.syncBtn.disabled = false;
        this.cloneVoiceBtn.disabled = false;
        this.createContentBtn.disabled = false;
        
        // Create initial avatar preview
        this.createAvatarPreview();
        
        Utils.showNotification('Chuyển đổi video thành avatar thành công!', 'success');
        this.saveData();
    }
    
    createAvatarPreview() {
        // Clear previous content
        this.generatedContent.innerHTML = '';
        
        // Create avatar preview
        const avatarSrc = Utils.generatePlaceholderVideo();
        const avatarItem = Utils.createGeneratedItem(
            avatarSrc,
            'Avatar được tạo từ video',
            'video'
        );
        
        this.generatedContent.appendChild(avatarItem);
    }
    
    async syncExpression() {
        if (!this.avatarReady) {
            Utils.showNotification('Vui lòng chuyển đổi video thành avatar trước', 'error');
            return;
        }
        
        const hasAudio = this.audioInput.files.length > 0;
        if (!hasAudio) {
            Utils.showNotification('Vui lòng tải file MP3 để đồng bộ biểu cảm', 'error');
            return;
        }
        
        this.syncBtn.disabled = true;
        this.syncBtn.textContent = '🔄 Đang đồng bộ...';
        
        // Simulate expression sync process
        setTimeout(() => {
            this.createSyncedContent();
        }, 4000);
        
        Utils.showNotification('Đang đồng bộ biểu cảm với MP3...', 'info');
    }
    
    createSyncedContent() {
        // Add synced content
        const syncedSrc = Utils.generatePlaceholderVideo();
        const syncedItem = Utils.createGeneratedItem(
            syncedSrc,
            'Video với biểu cảm đồng bộ',
            'video'
        );
        
        this.generatedContent.appendChild(syncedItem);
        
        this.syncBtn.textContent = '✅ Đã đồng bộ';
        this.syncBtn.disabled = true;
        
        // Enable export
        this.exportBtn.disabled = false;
        
        Utils.showNotification('Đồng bộ biểu cảm thành công!', 'success');
    }
    
    async cloneVoice() {
        if (!this.avatarReady) {
            Utils.showNotification('Vui lòng chuyển đổi video thành avatar trước', 'error');
            return;
        }
        
        const hasVoiceFile = this.voiceInput.files.length > 0;
        if (!hasVoiceFile) {
            Utils.showNotification('Vui lòng tải mẫu giọng nói để nhân bản', 'error');
            return;
        }
        
        this.cloneVoiceBtn.disabled = true;
        this.cloneVoiceBtn.textContent = '🔄 Đang nhân bản...';
        
        // Simulate voice cloning process
        setTimeout(() => {
            this.createClonedVoice();
        }, 5000);
        
        Utils.showNotification('Đang nhân bản giọng nói...', 'info');
    }
    
    createClonedVoice() {
        // Add cloned voice content
        const clonedSrc = Utils.generatePlaceholderVideo();
        const clonedItem = Utils.createGeneratedItem(
            clonedSrc,
            'Avatar với giọng nói nhân bản',
            'video'
        );
        
        this.generatedContent.appendChild(clonedItem);
        
        this.cloneVoiceBtn.textContent = '✅ Đã nhân bản';
        this.cloneVoiceBtn.disabled = true;
        
        // Enable export
        this.exportBtn.disabled = false;
        
        Utils.showNotification('Nhân bản giọng nói thành công!', 'success');
    }
    
    async createContent() {
        if (!this.avatarReady) {
            Utils.showNotification('Vui lòng chuyển đổi video thành avatar trước', 'error');
            return;
        }
        
        const hasScript = this.scriptInput.value.trim();
        if (!hasScript) {
            Utils.showNotification('Vui lòng nhập kịch bản', 'error');
            return;
        }
        
        this.createContentBtn.disabled = true;
        this.createContentBtn.textContent = '🔄 Đang tạo nội dung...';
        
        // Simulate content creation process
        setTimeout(() => {
            this.createScriptContent();
        }, 4500);
        
        Utils.showNotification('Đang tạo nội dung từ kịch bản...', 'info');
    }
    
    createScriptContent() {
        // Add script-based content
        const scriptSrc = Utils.generatePlaceholderVideo();
        const scriptItem = Utils.createGeneratedItem(
            scriptSrc,
            'Video từ kịch bản',
            'video'
        );
        
        this.generatedContent.appendChild(scriptItem);
        
        this.createContentBtn.textContent = '✅ Đã tạo nội dung';
        this.createContentBtn.disabled = true;
        
        // Enable export
        this.exportBtn.disabled = false;
        
        Utils.showNotification('Tạo nội dung từ kịch bản thành công!', 'success');
    }
    
    async exportVideo() {
        if (this.generatedContent.children.length === 0) {
            Utils.showNotification('Không có nội dung để xuất', 'error');
            return;
        }
        
        this.exportBtn.disabled = true;
        this.exportBtn.textContent = '🔄 Đang xuất video...';
        
        // Simulate export process
        setTimeout(() => {
            this.createExportedVideo();
        }, 3000);
        
        Utils.showNotification('Đang xuất video 1080p...', 'info');
    }
    
    createExportedVideo() {
        // Add final exported video
        const exportedSrc = Utils.generatePlaceholderVideo();
        const exportedItem = Utils.createGeneratedItem(
            exportedSrc,
            'Video 1080p - Sẵn sàng tải xuống',
            'video'
        );
        
        // Add special styling for exported video
        exportedItem.style.border = '3px solid #28a745';
        exportedItem.style.borderRadius = '10px';
        
        this.generatedContent.appendChild(exportedItem);
        
        this.exportBtn.textContent = '✅ Đã xuất video';
        this.exportBtn.disabled = true;
        
        Utils.showNotification('Xuất video 1080p thành công! Video đã sẵn sàng tải xuống.', 'success');
    }
    
    saveData() {
        const data = {
            scriptText: this.scriptInput.value,
            hasVideo: !!this.uploadedVideo,
            avatarReady: this.avatarReady,
            isConversionComplete: this.convertBtn.textContent.includes('✅'),
            timestamp: new Date().toISOString()
        };
        
        Utils.saveToStorage('videoMode', data);
    }
    
    loadSavedData() {
        const data = Utils.loadFromStorage('videoMode');
        if (data) {
            this.scriptInput.value = data.scriptText || '';
            
            if (data.isConversionComplete) {
                this.avatarReady = true;
                this.convertBtn.textContent = '✅ Đã chuyển đổi';
                this.convertBtn.disabled = true;
                this.syncBtn.disabled = false;
                this.cloneVoiceBtn.disabled = false;
                this.createContentBtn.disabled = false;
            }
        }
    }
    
    reset() {
        // Clear uploaded video
        if (this.uploadedVideo) {
            URL.revokeObjectURL(this.uploadedVideo.url);
            this.uploadedVideo = null;
        }
        
        // Clear UI
        this.previewGrid.innerHTML = '';
        this.generatedContent.innerHTML = '';
        this.scriptInput.value = '';
        this.audioInput.value = '';
        this.voiceInput.value = '';
        
        // Reset buttons
        this.convertBtn.disabled = true;
        this.convertBtn.textContent = '🔄 Chuyển đổi thành Avatar';
        this.syncBtn.disabled = true;
        this.syncBtn.textContent = '🎭 Đồng bộ biểu cảm';
        this.cloneVoiceBtn.disabled = true;
        this.cloneVoiceBtn.textContent = '🗣️ Nhân bản giọng nói';
        this.createContentBtn.disabled = true;
        this.createContentBtn.textContent = '📹 Tạo nội dung';
        this.exportBtn.disabled = true;
        this.exportBtn.textContent = '💾 Xuất video 1080p';
        
        // Reset state
        this.isConverting = false;
        this.isProcessing = false;
        this.avatarReady = false;
        
        // Hide progress
        Utils.hideProgress(this.conversionProgress);
        
        // Clear storage
        Utils.removeFromStorage('videoMode');
        
        this.updateUI();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('video-tab')) {
        window.videoMode = new VideoMode();
    }
});