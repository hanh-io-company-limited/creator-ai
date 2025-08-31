/**
 * Creator AI Extension API Service
 * Handles communication with the local Creator AI server
 */

class ExtensionAPIService {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.serverPort = null;
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        
        // Try different common ports
        this.possiblePorts = [3001, 3000, 8080, 8081, 5000];
        this.currentPortIndex = 0;
        
        this.initializeConnection();
    }

    async initializeConnection() {
        console.log('Initializing connection to Creator AI server...');
        
        // Try to find the running server
        for (let i = 0; i < this.possiblePorts.length; i++) {
            const port = this.possiblePorts[i];
            if (await this.testConnection(port)) {
                this.serverPort = port;
                this.baseURL = `http://localhost:${port}/api`;
                this.isConnected = true;
                console.log(`Connected to Creator AI server on port ${port}`);
                this.updateConnectionStatus('connected', 'Đã kết nối');
                return;
            }
        }
        
        // If no server found, show disconnected status
        this.isConnected = false;
        this.updateConnectionStatus('disconnected', 'Không thể kết nối');
        console.error('Could not connect to Creator AI server');
    }

    async testConnection(port) {
        try {
            const response = await fetch(`http://localhost:${port}/api/health`, {
                method: 'GET',
                timeout: 2000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    updateConnectionStatus(status, text) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    async request(method, endpoint, data = null, options = {}) {
        if (!this.isConnected) {
            throw new Error('Không thể kết nối đến Creator AI server. Vui lòng khởi động ứng dụng desktop trước.');
        }

        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (data && method !== 'GET') {
            if (data instanceof FormData) {
                delete config.headers['Content-Type']; // Let browser set it for FormData
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error);
            
            // Try to reconnect if connection failed
            if (error.message.includes('fetch')) {
                this.isConnected = false;
                this.updateConnectionStatus('disconnected', 'Mất kết nối');
                setTimeout(() => this.initializeConnection(), 3000);
            }
            
            // Use error handler if available
            if (window.errorHandler) {
                window.errorHandler.handleAPIError(error, `${method} ${endpoint}`);
            }
            
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return this.request('GET', '/health');
    }

    // Image Generation
    async generateImage(prompt, style = 'realistic', resolution = '512x512') {
        return this.request('POST', '/generation/create', {
            prompt,
            style,
            resolution
        });
    }

    async getStyles() {
        return this.request('GET', '/generation/styles');
    }

    // File Upload
    async uploadImages(files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        return this.request('POST', '/upload', formData);
    }

    // Animation Services
    async createAnimation(imageId, animationType = 'lip_sync', audioFile = null) {
        return this.request('POST', '/animation/create', {
            imageId,
            animationType,
            audioFile
        });
    }

    async getAnimationStatus(animationId) {
        return this.request('GET', `/animation/status/${animationId}`);
    }

    // Video Services
    async createVideo(sourceId, audioType, options = {}) {
        return this.request('POST', '/video/create', {
            sourceId,
            audioType,
            ...options
        });
    }

    async getVideoStatus(jobId) {
        return this.request('GET', `/video/status/${jobId}`);
    }

    async getVoices() {
        return this.request('GET', '/video/voices');
    }

    // Utility methods
    getLocalFileUrl(relativePath) {
        if (this.serverPort) {
            return `http://localhost:${this.serverPort}${relativePath}`;
        }
        return relativePath;
    }

    // Download helper
    async downloadFile(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            // Create download link
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            throw new Error('Không thể tải file. Vui lòng thử lại.');
        }
    }

    // Progress tracking
    async trackProgress(jobId, type, callback) {
        const checkProgress = async () => {
            try {
                let status;
                if (type === 'animation') {
                    status = await this.getAnimationStatus(jobId);
                } else if (type === 'video') {
                    status = await this.getVideoStatus(jobId);
                }

                if (callback) {
                    callback(status);
                }

                if (status.status === 'completed' || status.status === 'failed') {
                    return status;
                }

                // Continue polling
                setTimeout(checkProgress, 2000);
            } catch (error) {
                console.error('Progress tracking error:', error);
                if (callback) {
                    callback({ status: 'failed', error: error.message });
                }
            }
        };

        checkProgress();
    }
}

// Create global instance
window.creatorAPI = new ExtensionAPIService();