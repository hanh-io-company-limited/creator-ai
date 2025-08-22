// Creator AI - JavaScript Functionality
class CreatorAI {
    constructor() {
        this.currentLanguage = 'vi';
        this.uploadedFiles = [];
        this.maxFiles = 10;
        this.processingQueue = [];
        this.isProcessing = false;
        this.cloudConnected = false;
        this.logs = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragDrop();
        this.setupLanguage();
        this.loadSettings();
        this.hideLoadingScreen();
        this.addInitialLogs();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1500);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Language toggle
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }

        // File input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }

        // Option buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const group = e.currentTarget.closest('.option-group');
                group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.filterLogs(e.currentTarget.dataset.filter);
            });
        });

        // Settings
        document.querySelectorAll('input[type="checkbox"], select').forEach(input => {
            input.addEventListener('change', () => {
                this.saveSettings();
            });
        });
    }

    setupDragDrop() {
        const uploadZone = document.getElementById('upload-zone');
        if (!uploadZone) return;

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
    }

    setupLanguage() {
        this.translations = {
            vi: {
                'nav.home': 'Trang chủ',
                'nav.avatar': 'Tạo Avatar',
                'nav.enhance': 'Nâng cấp 4K',
                'nav.sync': 'Đồng bộ',
                'nav.logs': 'Nhật ký',
                'nav.settings': 'Cài đặt',
                'hero.title': 'Trí tuệ nhân tạo sáng tạo thông minh',
                'hero.subtitle': 'Tạo avatar từ hình ảnh và video với công nghệ AI tiên tiến. Nâng cấp chất lượng lên 4K và đồng bộ toàn bộ dữ liệu lên đám mây.',
                'hero.start': 'Bắt đầu tạo Avatar',
                'hero.enhance': 'Nâng cấp 4K',
                'features.avatar.title': 'Tạo Avatar thông minh',
                'features.avatar.desc': 'Tạo avatar sống động từ 1-10 ảnh chân dung hoặc video ngắn 3-5 giây với công nghệ AI tiên tiến',
                'features.enhance.title': 'Nâng cấp 4K',
                'features.enhance.desc': 'Tăng cường chất lượng hình ảnh lên 4K và xuất video chất lượng cao 1080p',
                'features.voice.title': 'Đồng bộ giọng nói',
                'features.voice.desc': 'Hỗ trợ đầu vào văn bản và file MP3 để tạo video với khẩu hình và giọng nói đồng bộ',
                'features.cloud.title': 'Đồng bộ đám mây',
                'features.cloud.desc': 'Tự động đồng bộ tất cả mô hình và dữ liệu lên OneDrive để quản lý hiệu quả',
                'features.ai.title': 'AI tự học',
                'features.ai.desc': 'Hệ thống AI học và phát triển không giới hạn từ dữ liệu người dùng',
                'features.analytics.title': 'Theo dõi chi tiết',
                'features.analytics.desc': 'Ghi lại mọi hoạt động và cung cấp báo cáo chi tiết về quá trình xử lý'
            },
            en: {
                'nav.home': 'Home',
                'nav.avatar': 'Create Avatar',
                'nav.enhance': '4K Enhance',
                'nav.sync': 'Cloud Sync',
                'nav.logs': 'Activity Logs',
                'nav.settings': 'Settings',
                'hero.title': 'Intelligent Creative AI',
                'hero.subtitle': 'Create avatars from images and videos with advanced AI technology. Enhance quality to 4K and sync all data to the cloud.',
                'hero.start': 'Start Creating Avatar',
                'hero.enhance': 'Enhance to 4K',
                'features.avatar.title': 'Smart Avatar Creation',
                'features.avatar.desc': 'Create vivid avatars from 1-10 portrait images or 3-5 second videos with advanced AI technology',
                'features.enhance.title': '4K Enhancement',
                'features.enhance.desc': 'Enhance image quality to 4K and export high-quality 1080p videos',
                'features.voice.title': 'Voice Synchronization',
                'features.voice.desc': 'Support text input and MP3 files to create videos with synchronized lip-sync and voice',
                'features.cloud.title': 'Cloud Synchronization',
                'features.cloud.desc': 'Automatically sync all models and data to OneDrive for efficient management',
                'features.ai.title': 'Self-Learning AI',
                'features.ai.desc': 'AI system learns and develops limitlessly from user data',
                'features.analytics.title': 'Detailed Analytics',
                'features.analytics.desc': 'Record all activities and provide detailed reports on processing'
            }
        };

        this.updateLanguageDisplay();
    }

    navigateToSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Log navigation
        this.addLog('navigation', `Navigated to ${sectionId} section`, 'info');
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'vi' ? 'en' : 'vi';
        this.updateLanguageDisplay();
        this.addLog('system', `Language changed to ${this.currentLanguage.toUpperCase()}`, 'info');
    }

    updateLanguageDisplay() {
        const flag = this.currentLanguage === 'vi' ? '🇻🇳' : '🇺🇸';
        const text = this.currentLanguage.toUpperCase();
        
        const toggle = document.getElementById('language-toggle');
        if (toggle) {
            toggle.querySelector('.flag').textContent = flag;
            toggle.querySelector('.lang-text').textContent = text;
        }

        // Update all translatable elements
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.dataset.lang;
            const translation = this.translations[this.currentLanguage][key];
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    handleFileSelect(files) {
        const fileArray = Array.from(files);
        
        if (this.uploadedFiles.length + fileArray.length > this.maxFiles) {
            this.showToast('error', 'File Limit Exceeded', `Maximum ${this.maxFiles} files allowed`);
            return;
        }

        fileArray.forEach(file => {
            if (this.validateFile(file)) {
                this.uploadedFiles.push(file);
                this.createPreview(file);
                this.addLog('upload', `Uploaded ${file.name} (${this.formatFileSize(file.size)})`, 'success');
            }
        });

        this.updateUploadUI();
    }

    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi'];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!validTypes.includes(file.type)) {
            this.showToast('error', 'Invalid File Type', `${file.name} is not supported`);
            return false;
        }

        if (file.size > maxSize) {
            this.showToast('error', 'File Too Large', `${file.name} exceeds 100MB limit`);
            return false;
        }

        // Video duration check for videos
        if (file.type.startsWith('video/')) {
            // This would need proper video duration checking in a real implementation
            // For now, we'll assume it's valid
        }

        return true;
    }

    createPreview(file) {
        const preview = document.getElementById('upload-preview');
        if (!preview) return;

        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.filename = file.name;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'preview-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => this.removeFile(file.name);

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            previewItem.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.onloadedmetadata = () => {
                // Check video duration
                if (video.duration > 5) {
                    this.showToast('warning', 'Video Duration', 'Videos longer than 5 seconds may take longer to process');
                }
            };
            previewItem.appendChild(video);
        }

        previewItem.appendChild(removeBtn);
        preview.appendChild(previewItem);
    }

    removeFile(filename) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== filename);
        
        const previewItem = document.querySelector(`[data-filename="${filename}"]`);
        if (previewItem) {
            previewItem.remove();
        }

        this.updateUploadUI();
        this.addLog('upload', `Removed ${filename}`, 'info');
    }

    updateUploadUI() {
        const createBtn = document.getElementById('create-avatar-btn');
        if (createBtn) {
            createBtn.disabled = this.uploadedFiles.length === 0;
        }
    }

    async startAvatarCreation() {
        if (this.uploadedFiles.length === 0) {
            this.showToast('error', 'No Files', 'Please upload at least one image or video');
            return;
        }

        this.isProcessing = true;
        this.showProcessingArea();
        this.addLog('processing', 'Started avatar creation process', 'info');

        // Simulate AI processing
        const steps = [
            { step: 'analysis', duration: 3000, text: 'Analyzing facial features...' },
            { step: 'training', duration: 5000, text: 'Training neural network...' },
            { step: 'generation', duration: 4000, text: 'Generating avatar...' },
            { step: 'enhancement', duration: 3000, text: 'Enhancing quality to 4K...' }
        ];

        let progress = 0;
        for (let i = 0; i < steps.length; i++) {
            const currentStep = steps[i];
            this.updateProcessingStep(currentStep.step, currentStep.text);
            
            await this.animateProgress(progress, progress + (100 / steps.length), currentStep.duration);
            progress += 100 / steps.length;
            
            this.addLog('processing', currentStep.text, 'info');
        }

        this.completeProcessing();
    }

    showProcessingArea() {
        const processingArea = document.getElementById('processing-area');
        if (processingArea) {
            processingArea.style.display = 'block';
        }
    }

    updateProcessingStep(step, text) {
        // Update timeline
        document.querySelectorAll('.timeline-step').forEach(el => {
            el.classList.remove('active');
        });
        
        const stepMapping = {
            'analysis': 0,
            'training': 1,
            'generation': 2,
            'enhancement': 3
        };
        
        const activeIndex = stepMapping[step];
        if (activeIndex !== undefined) {
            const steps = document.querySelectorAll('.timeline-step');
            for (let i = 0; i <= activeIndex; i++) {
                if (steps[i]) {
                    steps[i].classList.add('active');
                }
            }
        }

        // Update processing text
        const processingStep = document.querySelector('.processing-step');
        if (processingStep) {
            processingStep.textContent = text;
        }
    }

    async animateProgress(startPercent, endPercent, duration) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const progressCircle = document.querySelector('.progress-circle');
            const progressInner = document.querySelector('.progress-percent');
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentPercent = startPercent + (endPercent - startPercent) * progress;
                
                if (progressCircle) {
                    const degrees = (currentPercent / 100) * 360;
                    progressCircle.style.background = `conic-gradient(var(--primary-purple) ${degrees}deg, var(--gray-200) ${degrees}deg)`;
                }
                
                if (progressInner) {
                    progressInner.textContent = `${Math.round(currentPercent)}%`;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    completeProcessing() {
        this.isProcessing = false;
        this.showToast('success', 'Avatar Created', 'Your avatar has been successfully created and enhanced to 4K!');
        this.addLog('processing', 'Avatar creation completed successfully', 'success');
        
        // Auto-sync if enabled
        if (document.getElementById('auto-sync')?.checked) {
            setTimeout(() => this.syncToCloud(), 2000);
        }

        // Hide processing area after delay
        setTimeout(() => {
            const processingArea = document.getElementById('processing-area');
            if (processingArea) {
                processingArea.style.display = 'none';
            }
        }, 3000);
    }

    async connectOneDrive() {
        this.showToast('info', 'Connecting', 'Connecting to OneDrive...');
        this.addLog('sync', 'Attempting to connect to OneDrive', 'info');
        
        // Simulate connection process
        setTimeout(() => {
            this.cloudConnected = true;
            this.updateSyncStatus();
            this.showToast('success', 'Connected', 'Successfully connected to OneDrive');
            this.addLog('sync', 'Connected to OneDrive successfully', 'success');
        }, 2000);
    }

    updateSyncStatus() {
        const syncDetails = document.querySelector('.sync-details h3');
        const syncUpdate = document.querySelector('.sync-last-update');
        const connectBtn = document.querySelector('[onclick="connectOneDrive()"]');
        
        if (this.cloudConnected) {
            if (syncDetails) syncDetails.textContent = 'Connected to OneDrive';
            if (syncUpdate) syncUpdate.textContent = `Last sync: ${new Date().toLocaleString()}`;
            if (connectBtn) {
                connectBtn.textContent = 'Sync Now';
                connectBtn.onclick = () => this.syncToCloud();
            }
        }
    }

    async syncToCloud() {
        if (!this.cloudConnected) {
            this.showToast('error', 'Not Connected', 'Please connect to OneDrive first');
            return;
        }

        this.showToast('info', 'Syncing', 'Uploading data to OneDrive...');
        this.addLog('sync', 'Started cloud synchronization', 'info');
        
        // Simulate sync process
        setTimeout(() => {
            this.showToast('success', 'Sync Complete', 'All data synchronized to OneDrive');
            this.addLog('sync', 'Cloud synchronization completed', 'success');
            this.updateSyncStatus();
        }, 3000);
    }

    openImageEnhancer() {
        this.showToast('info', 'Image Enhancer', 'Opening 4K image enhancement tool...');
        this.addLog('enhancement', 'Opened image enhancement tool', 'info');
        // In a real implementation, this would open a dedicated image enhancement interface
    }

    openVideoEnhancer() {
        this.showToast('info', 'Video Enhancer', 'Opening 1080p video enhancement tool...');
        this.addLog('enhancement', 'Opened video enhancement tool', 'info');
        // In a real implementation, this would open a dedicated video enhancement interface
    }

    addTextInput() {
        this.showToast('info', 'Text Input', 'Adding text-to-speech capability...');
        this.addLog('input', 'Added text input for voice synthesis', 'info');
        // In a real implementation, this would add a text input interface
    }

    addAudioInput() {
        this.showToast('info', 'Audio Input', 'Adding MP3 audio input...');
        this.addLog('input', 'Added audio input for lip-sync', 'info');
        // In a real implementation, this would add an audio file input interface
    }

    addLog(category, message, type = 'info') {
        const log = {
            id: Date.now(),
            timestamp: new Date(),
            category,
            message,
            type
        };
        
        this.logs.unshift(log);
        this.updateLogsDisplay();
        
        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs = this.logs.slice(0, 100);
        }
    }

    addInitialLogs() {
        const initialLogs = [
            { category: 'system', message: 'Creator AI system initialized', type: 'success' },
            { category: 'ai', message: 'AI learning capabilities enabled', type: 'info' },
            { category: 'system', message: 'Unlimited creativity mode activated', type: 'info' },
            { category: 'system', message: 'Multi-language support loaded', type: 'info' }
        ];

        initialLogs.forEach(log => {
            this.addLog(log.category, log.message, log.type);
        });
    }

    filterLogs(filter) {
        const filteredLogs = filter === 'all' ? this.logs : 
                           this.logs.filter(log => log.category === filter || log.type === filter);
        this.displayLogs(filteredLogs);
    }

    updateLogsDisplay() {
        this.displayLogs(this.logs);
    }

    displayLogs(logs) {
        const container = document.getElementById('logs-container');
        if (!container) return;

        container.innerHTML = '';

        if (logs.length === 0) {
            container.innerHTML = '<div class="log-entry"><div class="log-content">No logs found</div></div>';
            return;
        }

        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            const icon = this.getLogIcon(log.category, log.type);
            
            logEntry.innerHTML = `
                <div class="log-icon">${icon}</div>
                <div class="log-content">
                    <div class="log-title">${log.message}</div>
                    <div class="log-details">${log.category} • ${log.type}</div>
                </div>
                <div class="log-time">${log.timestamp.toLocaleTimeString()}</div>
            `;
            
            container.appendChild(logEntry);
        });
    }

    getLogIcon(category, type) {
        const icons = {
            system: '⚙️',
            upload: '📤',
            processing: '🔄',
            sync: '☁️',
            enhancement: '✨',
            ai: '🤖',
            navigation: '🧭',
            input: '🎤',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        return icons[type] || icons[category] || 'ℹ️';
    }

    showToast(type, title, message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `;

        toast.addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    saveSettings() {
        const settings = {
            aiLearning: document.getElementById('ai-learning')?.checked,
            aiUnlimited: document.getElementById('ai-unlimited')?.checked,
            defaultQuality: document.getElementById('default-quality')?.value,
            autoSync: document.getElementById('auto-sync')?.checked,
            language: this.currentLanguage
        };

        localStorage.setItem('creatorAI_settings', JSON.stringify(settings));
        this.addLog('system', 'Settings saved', 'info');
    }

    loadSettings() {
        const saved = localStorage.getItem('creatorAI_settings');
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);
            
            if (settings.aiLearning !== undefined) {
                const checkbox = document.getElementById('ai-learning');
                if (checkbox) checkbox.checked = settings.aiLearning;
            }
            
            if (settings.aiUnlimited !== undefined) {
                const checkbox = document.getElementById('ai-unlimited');
                if (checkbox) checkbox.checked = settings.aiUnlimited;
            }
            
            if (settings.defaultQuality) {
                const select = document.getElementById('default-quality');
                if (select) select.value = settings.defaultQuality;
            }
            
            if (settings.autoSync !== undefined) {
                const checkbox = document.getElementById('auto-sync');
                if (checkbox) checkbox.checked = settings.autoSync;
            }
            
            if (settings.language && settings.language !== this.currentLanguage) {
                this.currentLanguage = settings.language;
                this.updateLanguageDisplay();
            }
            
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Global functions for onclick handlers
function navigateToSection(sectionId) {
    if (window.creatorAI) {
        window.creatorAI.navigateToSection(sectionId);
    }
}

function startAvatarCreation() {
    if (window.creatorAI) {
        window.creatorAI.startAvatarCreation();
    }
}

function addTextInput() {
    if (window.creatorAI) {
        window.creatorAI.addTextInput();
    }
}

function addAudioInput() {
    if (window.creatorAI) {
        window.creatorAI.addAudioInput();
    }
}

function connectOneDrive() {
    if (window.creatorAI) {
        window.creatorAI.connectOneDrive();
    }
}

function openImageEnhancer() {
    if (window.creatorAI) {
        window.creatorAI.openImageEnhancer();
    }
}

function openVideoEnhancer() {
    if (window.creatorAI) {
        window.creatorAI.openVideoEnhancer();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.creatorAI = new CreatorAI();
});

// Service Worker Registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}