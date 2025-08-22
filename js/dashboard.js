// Creator AI - Dashboard Controller

class Dashboard {
    constructor() {
        this.currentTab = 'photo';
        this.init();
    }
    
    init() {
        // Check authentication
        if (!authManager.requireAuth()) {
            return;
        }
        
        this.initElements();
        this.initEventListeners();
        this.updateUserInfo();
        this.initTabs();
    }
    
    initElements() {
        this.userEmailElement = document.getElementById('userEmail');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
    }
    
    initEventListeners() {
        // Tab navigation
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key >= '1' && e.key <= '2') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                const tabs = ['photo', 'video'];
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
            }
        });
        
        // Auto-save current tab
        window.addEventListener('beforeunload', () => {
            this.saveCurrentTab();
        });
        
        // Load saved tab on page load
        this.loadSavedTab();
    }
    
    updateUserInfo() {
        const sessionData = authManager.getSessionData();
        if (sessionData) {
            this.userEmailElement.textContent = `Chào ${sessionData.email}!`;
        }
    }
    
    initTabs() {
        // Set initial tab state
        this.switchTab(this.currentTab);
    }
    
    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        // Update tab buttons
        this.tabButtons.forEach(button => {
            const isActive = button.dataset.tab === tabName;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive);
        });
        
        // Update tab contents
        this.tabContents.forEach(content => {
            const isActive = content.id === `${tabName}-tab`;
            content.classList.toggle('active', isActive);
        });
        
        // Update current tab
        this.currentTab = tabName;
        
        // Save to localStorage
        this.saveCurrentTab();
        
        // Trigger tab-specific initialization if needed
        this.onTabSwitch(tabName);
        
        // Update page title
        const tabNames = {
            photo: 'Tạo Avatar từ Ảnh',
            video: 'Tạo Avatar từ Video'
        };
        document.title = `Creator AI - ${tabNames[tabName]}`;
        
        // Analytics/tracking (placeholder)
        this.trackTabSwitch(tabName);
    }
    
    onTabSwitch(tabName) {
        switch (tabName) {
            case 'photo':
                // Initialize photo mode if not already done
                if (!window.photoMode) {
                    window.photoMode = new PhotoMode();
                }
                break;
            case 'video':
                // Initialize video mode if not already done
                if (!window.videoMode) {
                    window.videoMode = new VideoMode();
                }
                break;
        }
    }
    
    saveCurrentTab() {
        Utils.saveToStorage('currentTab', this.currentTab);
    }
    
    loadSavedTab() {
        const savedTab = Utils.loadFromStorage('currentTab');
        if (savedTab && ['photo', 'video'].includes(savedTab)) {
            this.currentTab = savedTab;
        }
    }
    
    trackTabSwitch(tabName) {
        // Placeholder for analytics tracking
        console.log(`Tab switched to: ${tabName}`);
    }
    
    // Public methods for external access
    getCurrentTab() {
        return this.currentTab;
    }
    
    resetCurrentTab() {
        switch (this.currentTab) {
            case 'photo':
                if (window.photoMode) {
                    window.photoMode.reset();
                }
                break;
            case 'video':
                if (window.videoMode) {
                    window.videoMode.reset();
                }
                break;
        }
        
        Utils.showNotification('Đã đặt lại tab hiện tại', 'info');
    }
    
    resetAllTabs() {
        // Reset both modes
        if (window.photoMode) {
            window.photoMode.reset();
        }
        if (window.videoMode) {
            window.videoMode.reset();
        }
        
        // Clear all storage except session
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('creatorAI_') && key !== 'creatorAI_session') {
                localStorage.removeItem(key);
            }
        });
        
        Utils.showNotification('Đã đặt lại tất cả dữ liệu', 'info');
    }
    
    exportAllData() {
        const data = {
            currentTab: this.currentTab,
            photoMode: Utils.loadFromStorage('photoMode'),
            videoMode: Utils.loadFromStorage('videoMode'),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `creator-ai-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        
        Utils.showNotification('Dữ liệu đã được xuất', 'success');
    }
    
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.version || !data.exportDate) {
                    throw new Error('File không hợp lệ');
                }
                
                // Import data
                if (data.photoMode) {
                    Utils.saveToStorage('photoMode', data.photoMode);
                }
                if (data.videoMode) {
                    Utils.saveToStorage('videoMode', data.videoMode);
                }
                if (data.currentTab) {
                    this.switchTab(data.currentTab);
                }
                
                // Reload page to apply changes
                window.location.reload();
                
            } catch (error) {
                Utils.showNotification('Lỗi khi nhập dữ liệu: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    // Keyboard shortcuts help
    showKeyboardShortcuts() {
        const shortcuts = `
Phím tắt Creator AI:
• Ctrl + 1: Chuyển sang tab Ảnh
• Ctrl + 2: Chuyển sang tab Video
• Ctrl + R: Đặt lại tab hiện tại
• Ctrl + Shift + R: Đặt lại tất cả
        `.trim();
        
        alert(shortcuts);
    }
    
    // Performance monitoring
    getPerformanceInfo() {
        const info = {
            loadTime: performance.now(),
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB'
            } : 'Not available',
            connection: navigator.connection ? {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink + ' Mbps'
            } : 'Not available'
        };
        
        console.log('Performance Info:', info);
        return info;
    }
}

// Global dashboard commands (for developer console)
window.dashboardCommands = {
    reset: () => window.dashboard?.resetCurrentTab(),
    resetAll: () => window.dashboard?.resetAllTabs(),
    export: () => window.dashboard?.exportAllData(),
    shortcuts: () => window.dashboard?.showKeyboardShortcuts(),
    performance: () => window.dashboard?.getPerformanceInfo(),
    switchTab: (tab) => window.dashboard?.switchTab(tab)
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the dashboard page
    if (document.querySelector('.dashboard')) {
        window.dashboard = new Dashboard();
        
        // Add global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r' && !e.shiftKey) {
                e.preventDefault();
                window.dashboard.resetCurrentTab();
            } else if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                window.dashboard.resetAllTabs();
            } else if (e.key === 'F1') {
                e.preventDefault();
                window.dashboard.showKeyboardShortcuts();
            }
        });
        
        // Console welcome message
        console.log(`
╔═══════════════════════════════════════╗
║            Creator AI Dashboard        ║
║                                       ║
║  Type 'dashboardCommands' to see      ║
║  available console commands           ║
║                                       ║
║  Press F1 for keyboard shortcuts      ║
╚═══════════════════════════════════════╝
        `);
        
        // Log performance info after 2 seconds
        setTimeout(() => {
            window.dashboard.getPerformanceInfo();
        }, 2000);
    }
});