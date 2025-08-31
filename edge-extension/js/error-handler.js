/**
 * Creator AI Extension Error Handler
 * Centralized error handling and user feedback
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
            event.preventDefault();
        });

        // Handle general errors
        window.addEventListener('error', (event) => {
            this.logError('Global Error', event.error);
        });
    }

    logError(type, error, context = {}) {
        const errorInfo = {
            type,
            message: error?.message || error?.toString() || 'Unknown error',
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            context
        };

        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Log to console for development
        console.error(`[Creator AI Extension] ${type}:`, error, context);

        // Store in chrome storage for debugging
        this.saveErrorsToStorage();
    }

    async saveErrorsToStorage() {
        try {
            if (chrome?.storage?.local) {
                await chrome.storage.local.set({
                    'creator-ai-errors': this.errors
                });
            }
        } catch (e) {
            console.error('Failed to save errors to storage:', e);
        }
    }

    async getStoredErrors() {
        try {
            if (chrome?.storage?.local) {
                const result = await chrome.storage.local.get(['creator-ai-errors']);
                return result['creator-ai-errors'] || [];
            }
        } catch (e) {
            console.error('Failed to get stored errors:', e);
        }
        return [];
    }

    showUserError(message, type = 'error') {
        // Show user-friendly error message
        this.showToast(message, type);
    }

    showToast(message, type = 'info', duration = 4000) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add toast styles if not already added
        this.addToastStyles();

        // Add to document
        document.body.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    getToastIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    addToastStyles() {
        if (document.getElementById('creator-ai-toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'creator-ai-toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
                border-left: 4px solid #667eea;
            }
            
            .toast-success { border-left-color: #4ade80; }
            .toast-error { border-left-color: #f87171; }
            .toast-warning { border-left-color: #fbbf24; }
            .toast-info { border-left-color: #60a5fa; }
            
            .toast-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 8px;
            }
            
            .toast-icon {
                font-size: 14px;
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
                font-size: 13px;
                color: #374151;
                line-height: 1.4;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 16px;
                color: #9ca3af;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .toast-close:hover {
                background: #f3f4f6;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // API Error handling
    handleAPIError(error, context = '') {
        let userMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        
        if (error.message?.includes('Network')) {
            userMessage = 'Không thể kết nối đến Creator AI. Vui lòng kiểm tra ứng dụng Desktop đã khởi động chưa.';
        } else if (error.message?.includes('timeout')) {
            userMessage = 'Quá thời gian chờ. Vui lòng thử lại.';
        } else if (error.message?.includes('permission')) {
            userMessage = 'Không có quyền truy cập. Vui lòng kiểm tra cài đặt.';
        } else if (error.message?.includes('file')) {
            userMessage = 'Lỗi file. Vui lòng kiểm tra định dạng và kích thước file.';
        }

        this.logError('API Error', error, { context });
        this.showUserError(userMessage, 'error');
    }

    // Connection Error handling
    handleConnectionError() {
        const message = 'Không thể kết nối đến Creator AI Desktop. Vui lòng:\n1. Khởi động Creator AI Desktop\n2. Kiểm tra server đang chạy\n3. Thử lại';
        this.showUserError(message, 'warning');
    }

    // Clear all stored errors
    async clearErrors() {
        this.errors = [];
        try {
            if (chrome?.storage?.local) {
                await chrome.storage.local.remove(['creator-ai-errors']);
            }
        } catch (e) {
            console.error('Failed to clear stored errors:', e);
        }
    }

    // Get error report for debugging
    generateErrorReport() {
        return {
            timestamp: new Date().toISOString(),
            extensionVersion: '1.0.0',
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            },
            errors: this.errors,
            totalErrors: this.errors.length
        };
    }
}

// Create global instance
window.errorHandler = new ErrorHandler();