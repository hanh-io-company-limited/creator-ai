// Creator AI - Utility Functions

class Utils {
    // File validation
    static validateFile(file, type = 'image') {
        const validImageTypes = ['image/jpeg', 'image/png'];
        const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
        const validAudioTypes = ['audio/mp3', 'audio/mpeg'];
        
        const maxImageSize = 10 * 1024 * 1024; // 10MB
        const maxVideoSize = 100 * 1024 * 1024; // 100MB
        const maxAudioSize = 50 * 1024 * 1024; // 50MB (5 minutes)
        
        let validTypes, maxSize;
        
        switch (type) {
            case 'image':
                validTypes = validImageTypes;
                maxSize = maxImageSize;
                break;
            case 'video':
                validTypes = validVideoTypes;
                maxSize = maxVideoSize;
                break;
            case 'audio':
                validTypes = validAudioTypes;
                maxSize = maxAudioSize;
                break;
            default:
                return { valid: false, error: 'Loại file không được hỗ trợ' };
        }
        
        if (!validTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: `Định dạng file không hỗ trợ. Chỉ chấp nhận: ${validTypes.join(', ')}` 
            };
        }
        
        if (file.size > maxSize) {
            return { 
                valid: false, 
                error: `File quá lớn. Kích thước tối đa: ${this.formatFileSize(maxSize)}` 
            };
        }
        
        return { valid: true };
    }
    
    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Create file preview
    static createFilePreview(file, container, onRemove) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            preview.remove();
            if (onRemove) onRemove(file);
        };
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
            preview.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.muted = true;
            video.onload = () => URL.revokeObjectURL(video.src);
            preview.appendChild(video);
        }
        
        preview.appendChild(removeBtn);
        container.appendChild(preview);
        
        return preview;
    }
    
    // Progress simulation
    static simulateProgress(progressBar, progressText, duration = 3000, onComplete) {
        const progressFill = progressBar.querySelector('.progress-fill');
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            
            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
            
            if (progress < 100) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }
    
    // Show/hide progress container
    static showProgress(container) {
        container.classList.add('show');
    }
    
    static hideProgress(container) {
        container.classList.remove('show');
    }
    
    // Generate unique ID
    static generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Create generated content item
    static createGeneratedItem(src, label, type = 'image') {
        const item = document.createElement('div');
        item.className = 'generated-item';
        
        let mediaElement;
        if (type === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.muted = true;
        } else {
            mediaElement = document.createElement('img');
        }
        
        mediaElement.src = src;
        
        const labelElement = document.createElement('div');
        labelElement.className = 'generated-item-label';
        labelElement.textContent = label;
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = '⬇️';
        downloadBtn.onclick = () => this.downloadFile(src, label);
        
        item.appendChild(mediaElement);
        item.appendChild(labelElement);
        item.appendChild(downloadBtn);
        
        return item;
    }
    
    // Download file
    static downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // Show notification
    static showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Local storage helpers
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(`creatorAI_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to storage:', error);
            return false;
        }
    }
    
    static loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`creatorAI_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from storage:', error);
            return null;
        }
    }
    
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(`creatorAI_${key}`);
            return true;
        } catch (error) {
            console.error('Failed to remove from storage:', error);
            return false;
        }
    }
    
    // Generate placeholder images/videos for demo
    static generatePlaceholderImage(width = 400, height = 400, text = 'AI Generated') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        
        return canvas.toDataURL('image/png');
    }
    
    // Generate placeholder video URL
    static generatePlaceholderVideo() {
        // This would normally be a proper video URL
        // For demo purposes, we'll use a data URL or external placeholder
        return 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAGW1kYXQAAAKgBgX//wpcRYgAAAK0bW9vdgAAAGxtdmhkAAAAANUOOsPVDjrDAAACWAAAAV8AAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAABhpb2RzAAAAABCAgAOABQAEgICABQAGiIiIgAXHwAABgcXFwAAGgKgCgBABA4CgBABzAAABgC0EAXwHQUDMSgQKCagClgACAAIAAgAEgICABQB4ChACQAAAAGMAAIGjO4DIEE6lxAoECgcCCAACAagCEOGkwAEAAAAAAAAAAAACAABAI4cVlHDnBa8eOAElJq2MNzALBBtAAAAAAAAAAAAAcGmE1GVp50yB9+gHGOZByuKG+QAAAAAAAAAAbwAAAbmhyoGXdyLqy5yEPzP1m7zzAAABZGlkcXx3s/5BAHwJBBMMABwAlCBAIABgcGggggAkE8AAACAmQGhA6kCgQKBAAAAgBACAAAGAAAABAACAAQAAFgAAAAEdEVGEQAAhAAAAGttZgAAAACBAACAAIAAAGBhcGVkagAAAIgAAAAAcGQYBAAAYGFCcAAAjAAAAIA==';
    }
    
    // Format duration
    static formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Check if device is mobile
    static isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Check if device supports certain features
    static supportsFeature(feature) {
        switch (feature) {
            case 'dragdrop':
                return 'draggable' in document.createElement('div');
            case 'filereader':
                return typeof FileReader !== 'undefined';
            case 'canvas':
                return !!document.createElement('canvas').getContext;
            case 'video':
                return !!document.createElement('video').canPlayType;
            case 'audio':
                return !!document.createElement('audio').canPlayType;
            default:
                return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make available globally
window.Utils = Utils;