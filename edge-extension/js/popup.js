/**
 * Creator AI Extension Popup Script
 * Main UI logic and interaction handling
 */

class CreatorAIPopup {
    constructor() {
        this.currentTab = 'generation';
        this.uploadedImage = null;
        this.generationInProgress = false;
        this.animationInProgress = false;
        this.videoInProgress = false;
        
        this.initializeUI();
        this.loadInitialData();
    }

    initializeUI() {
        // Tab navigation
        this.setupTabNavigation();
        
        // Image generation
        this.setupImageGeneration();
        
        // Animation
        this.setupAnimation();
        
        // Video
        this.setupVideo();
        
        // File upload
        this.setupFileUpload();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.nav-tab');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab panel
                tabPanels.forEach(panel => panel.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                this.currentTab = tabId;
            });
        });
    }

    setupImageGeneration() {
        const generateBtn = document.getElementById('generateBtn');
        const promptInput = document.getElementById('promptInput');
        const regenerateBtn = document.getElementById('regenerateBtn');
        const downloadImageBtn = document.getElementById('downloadImageBtn');

        generateBtn.addEventListener('click', () => this.generateImage());
        regenerateBtn?.addEventListener('click', () => this.generateImage());
        downloadImageBtn?.addEventListener('click', () => this.downloadGeneratedImage());

        // Enable/disable generate button based on prompt
        promptInput.addEventListener('input', () => {
            generateBtn.disabled = !promptInput.value.trim() || this.generationInProgress;
        });

        // Quick prompt suggestions
        this.addQuickPrompts();
    }

    setupAnimation() {
        const createAnimationBtn = document.getElementById('createAnimationBtn');
        
        createAnimationBtn.addEventListener('click', () => this.createAnimation());
    }

    setupVideo() {
        const createVideoBtn = document.getElementById('createVideoBtn');
        const textInput = document.getElementById('textInput');
        const videoSourceSelect = document.getElementById('videoSourceSelect');

        createVideoBtn.addEventListener('click', () => this.createVideo());

        // Enable/disable create button
        const updateVideoButton = () => {
            createVideoBtn.disabled = !textInput.value.trim() || 
                                     !videoSourceSelect.value || 
                                     this.videoInProgress;
        };

        textInput.addEventListener('input', updateVideoButton);
        videoSourceSelect.addEventListener('change', updateVideoButton);
    }

    setupFileUpload() {
        const imageUpload = document.getElementById('imageUpload');
        const uploadArea = document.getElementById('imageUploadArea');
        const removeImageBtn = document.getElementById('removeImageBtn');

        // Click to upload
        uploadArea.addEventListener('click', () => imageUpload.click());

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#f8fafc';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = '';
            
            const files = Array.from(e.dataTransfer.files);
            const imageFile = files.find(file => file.type.startsWith('image/'));
            
            if (imageFile) {
                this.handleImageUpload(imageFile);
            }
        });

        // File input change
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        // Remove image
        removeImageBtn?.addEventListener('click', () => this.removeUploadedImage());
    }

    async loadInitialData() {
        try {
            // Load styles for generation
            const styles = await window.creatorAPI.getStyles();
            this.populateStyleSelect(styles);

            // Load voices for video
            const voices = await window.creatorAPI.getVoices();
            this.populateVoiceSelect(voices);

        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    populateStyleSelect(styles) {
        const styleSelect = document.getElementById('styleSelect');
        if (!styles || !Array.isArray(styles)) return;

        styleSelect.innerHTML = '';
        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.id;
            option.textContent = style.name;
            styleSelect.appendChild(option);
        });
    }

    populateVoiceSelect(voices) {
        const voiceSelect = document.getElementById('voiceSelect');
        if (!voices || !Array.isArray(voices)) return;

        // Keep default options and add API voices
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.id;
            option.textContent = voice.name;
            voiceSelect.appendChild(option);
        });
    }

    async generateImage() {
        const promptInput = document.getElementById('promptInput');
        const styleSelect = document.getElementById('styleSelect');
        const resolutionSelect = document.getElementById('resolutionSelect');
        const generateBtn = document.getElementById('generateBtn');

        const prompt = promptInput.value.trim();
        if (!prompt) {
            this.showError('Vui lòng nhập mô tả hình ảnh');
            return;
        }

        this.generationInProgress = true;
        generateBtn.disabled = true;

        try {
            this.showProgress('generationProgress', 'Đang xử lý với AI...');

            const result = await window.creatorAPI.generateImage(
                prompt,
                styleSelect.value,
                resolutionSelect.value
            );

            this.hideProgress('generationProgress');
            this.showGenerationResult(result);

        } catch (error) {
            this.hideProgress('generationProgress');
            this.showError('Lỗi tạo hình ảnh: ' + error.message);
        } finally {
            this.generationInProgress = false;
            generateBtn.disabled = false;
        }
    }

    async handleImageUpload(file) {
        try {
            const result = await window.creatorAPI.uploadImages([file]);
            
            if (result && result.files && result.files.length > 0) {
                this.uploadedImage = result.files[0];
                this.showUploadedImage(file);
                
                // Enable animation button
                document.getElementById('createAnimationBtn').disabled = false;
                
                // Add to video source options
                this.addVideoSource(this.uploadedImage);
            }

        } catch (error) {
            this.showError('Lỗi upload hình ảnh: ' + error.message);
        }
    }

    showUploadedImage(file) {
        const uploadArea = document.getElementById('imageUploadArea');
        const previewContainer = document.getElementById('uploadedImagePreview');
        const previewImage = document.getElementById('previewImage');

        // Hide upload area
        uploadArea.style.display = 'none';

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removeUploadedImage() {
        const uploadArea = document.getElementById('imageUploadArea');
        const previewContainer = document.getElementById('uploadedImagePreview');

        // Show upload area
        uploadArea.style.display = 'block';

        // Hide preview
        previewContainer.style.display = 'none';

        // Reset state
        this.uploadedImage = null;
        document.getElementById('createAnimationBtn').disabled = true;
        document.getElementById('imageUpload').value = '';
    }

    async createAnimation() {
        if (!this.uploadedImage) {
            this.showError('Vui lòng chọn hình ảnh trước');
            return;
        }

        const animationTypeSelect = document.getElementById('animationTypeSelect');
        const createAnimationBtn = document.getElementById('createAnimationBtn');

        this.animationInProgress = true;
        createAnimationBtn.disabled = true;

        try {
            this.showProgress('animationProgress', 'Đang tạo animation...');

            const result = await window.creatorAPI.createAnimation(
                this.uploadedImage.id,
                animationTypeSelect.value
            );

            // Track progress
            await this.trackAnimationProgress(result.jobId);

        } catch (error) {
            this.hideProgress('animationProgress');
            this.showError('Lỗi tạo animation: ' + error.message);
        } finally {
            this.animationInProgress = false;
            createAnimationBtn.disabled = false;
        }
    }

    async trackAnimationProgress(jobId) {
        let progress = 0;
        const progressBar = document.getElementById('animationProgressBar');

        const interval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 10, 90);
            progressBar.style.width = `${progress}%`;
        }, 1000);

        try {
            const result = await new Promise((resolve, reject) => {
                window.creatorAPI.trackProgress(jobId, 'animation', (status) => {
                    if (status.status === 'completed') {
                        clearInterval(interval);
                        progressBar.style.width = '100%';
                        resolve(status);
                    } else if (status.status === 'failed') {
                        clearInterval(interval);
                        reject(new Error(status.error || 'Animation failed'));
                    }
                });
            });

            this.hideProgress('animationProgress');
            this.showAnimationResult(result);

        } catch (error) {
            clearInterval(interval);
            throw error;
        }
    }

    async createVideo() {
        const videoSourceSelect = document.getElementById('videoSourceSelect');
        const voiceSelect = document.getElementById('voiceSelect');
        const textInput = document.getElementById('textInput');
        const createVideoBtn = document.getElementById('createVideoBtn');

        const sourceId = videoSourceSelect.value;
        const text = textInput.value.trim();

        if (!sourceId || !text) {
            this.showError('Vui lòng chọn nguồn video và nhập văn bản');
            return;
        }

        this.videoInProgress = true;
        createVideoBtn.disabled = true;

        try {
            this.showProgress('videoProgress', 'Đang tạo video...');

            const result = await window.creatorAPI.createVideo(sourceId, 'tts', {
                voice: voiceSelect.value,
                text: text
            });

            await this.trackVideoProgress(result.jobId);

        } catch (error) {
            this.hideProgress('videoProgress');
            this.showError('Lỗi tạo video: ' + error.message);
        } finally {
            this.videoInProgress = false;
            createVideoBtn.disabled = false;
        }
    }

    async trackVideoProgress(jobId) {
        let progress = 0;
        const progressBar = document.getElementById('videoProgressBar');

        const interval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 8, 90);
            progressBar.style.width = `${progress}%`;
        }, 1500);

        try {
            const result = await new Promise((resolve, reject) => {
                window.creatorAPI.trackProgress(jobId, 'video', (status) => {
                    if (status.status === 'completed') {
                        clearInterval(interval);
                        progressBar.style.width = '100%';
                        resolve(status);
                    } else if (status.status === 'failed') {
                        clearInterval(interval);
                        reject(new Error(status.error || 'Video creation failed'));
                    }
                });
            });

            this.hideProgress('videoProgress');
            this.showVideoResult(result);

        } catch (error) {
            clearInterval(interval);
            throw error;
        }
    }

    showProgress(progressId, text) {
        const progressSection = document.getElementById(progressId);
        const progressText = progressSection.querySelector('.progress-text');
        
        progressText.textContent = text;
        progressSection.style.display = 'block';
        
        // Reset progress bar
        const progressBar = progressSection.querySelector('.progress-fill');
        progressBar.style.width = '0%';
    }

    hideProgress(progressId) {
        const progressSection = document.getElementById(progressId);
        progressSection.style.display = 'none';
    }

    showGenerationResult(result) {
        const resultSection = document.getElementById('generationResult');
        const generatedImage = document.getElementById('generatedImage');

        if (result && result.imageUrl) {
            generatedImage.src = window.creatorAPI.getLocalFileUrl(result.imageUrl);
            resultSection.style.display = 'block';
            this.lastGeneratedImageUrl = result.imageUrl;
        }
    }

    showAnimationResult(result) {
        const resultSection = document.getElementById('animationResult');
        const animationVideo = document.getElementById('animationVideo');

        if (result && result.videoUrl) {
            animationVideo.src = window.creatorAPI.getLocalFileUrl(result.videoUrl);
            resultSection.style.display = 'block';
            this.lastAnimationUrl = result.videoUrl;
            
            // Add to video sources
            this.addVideoSource({
                id: result.id,
                name: 'Animation: ' + result.name,
                url: result.videoUrl
            });
        }
    }

    showVideoResult(result) {
        const resultSection = document.getElementById('videoResult');
        const finalVideo = document.getElementById('finalVideo');

        if (result && result.videoUrl) {
            finalVideo.src = window.creatorAPI.getLocalFileUrl(result.videoUrl);
            resultSection.style.display = 'block';
            this.lastVideoUrl = result.videoUrl;
        }
    }

    addVideoSource(source) {
        const videoSourceSelect = document.getElementById('videoSourceSelect');
        
        // Check if option already exists
        const existingOption = Array.from(videoSourceSelect.options)
            .find(option => option.value === source.id);
        
        if (!existingOption) {
            const option = document.createElement('option');
            option.value = source.id;
            option.textContent = source.name || `Source ${source.id}`;
            videoSourceSelect.appendChild(option);
        }
    }

    async downloadGeneratedImage() {
        if (this.lastGeneratedImageUrl) {
            try {
                const filename = `creator-ai-generated-${Date.now()}.png`;
                await window.creatorAPI.downloadFile(
                    window.creatorAPI.getLocalFileUrl(this.lastGeneratedImageUrl),
                    filename
                );
            } catch (error) {
                this.showError('Lỗi tải xuống: ' + error.message);
            }
        }
    }

    addQuickPrompts() {
        const quickPrompts = [
            'Một cô gái anime với mắt to và tóc màu hồng',
            'Phong cảnh núi non hùng vĩ với ánh sáng hoàng hôn',
            'Chân dung chuyên nghiệp phong cách hiện đại',
            'Hình ảnh nghệ thuật trừu tượng với màu sắc rực rồ'
        ];

        // Add quick prompt buttons (implementation can be extended)
        console.log('Quick prompts available:', quickPrompts);
    }

    showError(message) {
        // Use the error handler for better UX
        if (window.errorHandler) {
            window.errorHandler.showUserError(message, 'error');
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreatorAIPopup();
});