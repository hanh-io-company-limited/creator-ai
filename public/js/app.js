class CreatorAIBackup {
    constructor() {
        this.isAuthenticated = false;
        this.statusCheckInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.startStatusUpdates();
        this.checkUrlParams();
    }

    setupEventListeners() {
        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        
        // File upload
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        // Manual sync
        document.getElementById('manualSyncBtn').addEventListener('click', () => this.manualSync());
        
        // Refresh files
        document.getElementById('refreshFilesBtn').addEventListener('click', () => this.loadFiles());
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth') === 'success') {
            this.showToast('Đăng nhập OneDrive thành công!', 'success');
            this.isAuthenticated = true;
            this.showDashboard();
            // Remove auth param from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('auth') === 'error') {
            this.showToast('Đăng nhập OneDrive thất bại!', 'error');
            // Remove auth param from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            
            this.updateStatusIndicator(status);
            
            if (status.isAuthenticated) {
                this.isAuthenticated = true;
                this.showDashboard();
                this.loadFiles();
            } else {
                this.showAuthSection();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.updateStatusIndicator({ status: 'Lỗi kết nối', isAuthenticated: false });
        }
    }

    async login() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/auth/login');
            const data = await response.json();
            
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                this.showToast('Không thể tạo URL xác thực', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Lỗi đăng nhập', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleFileSelect(files) {
        if (files.length === 0) return;
        
        const formData = new FormData();
        for (let file of files) {
            formData.append('files', file);
        }
        
        try {
            this.showUploadProgress(true);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast(result.message, 'success');
                this.loadFiles();
                this.checkAuthStatus(); // Update status
            } else {
                this.showToast('Tải lên thất bại', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showToast('Lỗi tải lên', 'error');
        } finally {
            this.showUploadProgress(false);
        }
    }

    async manualSync() {
        if (!this.isAuthenticated) {
            this.showToast('Cần đăng nhập OneDrive trước', 'warning');
            return;
        }
        
        try {
            const btn = document.getElementById('manualSyncBtn');
            btn.disabled = true;
            btn.textContent = 'Đang đồng bộ...';
            
            const response = await fetch('/api/sync', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                this.showToast(result.message, 'success');
                this.checkAuthStatus(); // Update status
            } else {
                this.showToast('Đồng bộ thất bại', 'error');
            }
        } catch (error) {
            console.error('Sync error:', error);
            this.showToast('Lỗi đồng bộ', 'error');
        } finally {
            const btn = document.getElementById('manualSyncBtn');
            btn.disabled = false;
            btn.textContent = 'Đồng bộ Ngay';
        }
    }

    async loadFiles() {
        try {
            const response = await fetch('/api/files');
            const files = await response.json();
            
            this.renderFilesList(files);
        } catch (error) {
            console.error('Error loading files:', error);
            document.getElementById('filesList').innerHTML = 
                '<div class="loading">Lỗi tải danh sách tệp</div>';
        }
    }

    renderFilesList(files) {
        const container = document.getElementById('filesList');
        
        if (files.length === 0) {
            container.innerHTML = '<div class="loading">Chưa có tệp nào được sao lưu</div>';
            return;
        }
        
        const filesHtml = files.map(file => `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">📄 ${file.name}</div>
                    <div class="file-meta">
                        ${this.formatFileSize(file.size)} • 
                        ${this.formatDate(file.modified)}
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-small btn-secondary" onclick="app.downloadFile('${file.name}')">
                        Tải xuống
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = filesHtml;
    }

    async downloadFile(filename) {
        try {
            const response = await fetch(`/api/download/${encodeURIComponent(filename)}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showToast(`Đã tải xuống ${filename}`, 'success');
            } else {
                this.showToast('Tải xuống thất bại', 'error');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Lỗi tải xuống', 'error');
        }
    }

    showAuthSection() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    }

    showUploadProgress(show) {
        const progress = document.getElementById('uploadProgress');
        if (show) {
            progress.style.display = 'block';
            // Simulate progress
            const fill = document.getElementById('progressFill');
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 15;
                if (width >= 100) {
                    width = 100;
                    clearInterval(interval);
                }
                fill.style.width = width + '%';
            }, 200);
        } else {
            progress.style.display = 'none';
            document.getElementById('progressFill').style.width = '0%';
        }
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
    }

    updateStatusIndicator(status) {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');
        
        text.textContent = status.status || 'Không xác định';
        
        dot.className = 'status-dot';
        if (status.isAuthenticated) {
            dot.classList.add('connected');
        } else if (status.status && status.status.includes('Lỗi')) {
            dot.classList.add('error');
        }
        
        // Update sync info if dashboard is visible
        if (document.getElementById('dashboard').style.display !== 'none') {
            document.getElementById('syncStatus').textContent = status.status || 'Không xác định';
            document.getElementById('lastSync').textContent = 
                status.lastSync ? this.formatDate(status.lastSync) : 'Chưa có';
            document.getElementById('filesCount').textContent = status.filesCount || 0;
        }
    }

    startStatusUpdates() {
        // Update status every 10 seconds
        this.statusCheckInterval = setInterval(() => {
            this.checkAuthStatus();
        }, 10000);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                container.removeChild(toast);
            }
        }, 5000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
    }
}

// Initialize the application
const app = new CreatorAIBackup();

// Make app globally available for onclick handlers
window.app = app;