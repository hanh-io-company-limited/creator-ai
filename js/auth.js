// Creator AI - Authentication Module

class AuthManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Check if user is already logged in
        if (this.isLoggedIn() && window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Initialize login form if on login page
        if (document.getElementById('loginForm')) {
            this.initLoginForm();
        }
    }
    
    initLoginForm() {
        const form = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(emailInput.value, passwordInput.value, errorMessage);
        });
        
        // Demo info click to fill
        document.addEventListener('click', (e) => {
            if (e.target.closest('.login-info')) {
                emailInput.value = 'hanhlehangelcosmetic@gmail.com';
                passwordInput.value = 'Kimhanh99@';
            }
        });
    }
    
    async handleLogin(email, password, errorElement) {
        // Show loading state
        const submitBtn = document.querySelector('.login-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        
        // Hide previous errors
        errorElement.style.display = 'none';
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check credentials
            if (this.validateCredentials(email, password)) {
                // Store session
                this.createSession(email);
                
                // Show success and redirect
                this.showNotification('Đăng nhập thành công!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } else {
                throw new Error('Email hoặc mật khẩu không chính xác.');
            }
            
        } catch (error) {
            this.showError(errorElement, error.message);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    }
    
    validateCredentials(email, password) {
        const validEmail = 'hanhlehangelcosmetic@gmail.com';
        const validPassword = 'Kimhanh99@';
        
        return email === validEmail && password === validPassword;
    }
    
    createSession(email) {
        const sessionData = {
            email: email,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };
        
        localStorage.setItem('creatorAI_session', JSON.stringify(sessionData));
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    isLoggedIn() {
        const session = localStorage.getItem('creatorAI_session');
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            
            // Session expires after 24 hours
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }
    
    getSessionData() {
        const session = localStorage.getItem('creatorAI_session');
        if (!session) return null;
        
        try {
            return JSON.parse(session);
        } catch (error) {
            return null;
        }
    }
    
    logout() {
        localStorage.removeItem('creatorAI_session');
        
        // Clear any other stored data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('creatorAI_')) {
                localStorage.removeItem(key);
            }
        });
        
        this.showNotification('Đã đăng xuất thành công!', 'info');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    showNotification(message, type = 'info') {
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
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Protect routes that require authentication
    requireAuth() {
        if (!this.isLoggedIn()) {
            this.showNotification('Vui lòng đăng nhập để tiếp tục.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return false;
        }
        return true;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}