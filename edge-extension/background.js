/**
 * Creator AI Extension Background Script (Service Worker)
 * Handles background tasks and extension lifecycle
 */

// Extension installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Creator AI Extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        // First time installation
        console.log('Creator AI Extension installed for the first time');
        
        // Set default settings
        chrome.storage.local.set({
            settings: {
                apiPort: 3001,
                autoConnect: true,
                notificationsEnabled: true
            },
            lastConnected: null
        });
        
        // Open welcome/setup page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Creator AI Extension started');
    checkServerConnection();
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    switch (message.type) {
        case 'CHECK_SERVER_CONNECTION':
            checkServerConnection().then(sendResponse);
            return true; // Keep message channel open for async response
            
        case 'GET_SETTINGS':
            chrome.storage.local.get(['settings'], (result) => {
                sendResponse(result.settings || {});
            });
            return true;
            
        case 'UPDATE_SETTINGS':
            chrome.storage.local.set({ settings: message.settings }, () => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'DOWNLOAD_FILE':
            downloadFile(message.url, message.filename).then(sendResponse);
            return true;
            
        default:
            console.log('Unknown message type:', message.type);
    }
});

// Check if Creator AI server is running
async function checkServerConnection() {
    const possiblePorts = [3001, 3000, 8080, 8081, 5000];
    
    for (const port of possiblePorts) {
        try {
            const response = await fetch(`http://localhost:${port}/api/health`, {
                method: 'GET',
                timeout: 2000
            });
            
            if (response.ok) {
                console.log(`Creator AI server found on port ${port}`);
                
                // Store successful connection
                chrome.storage.local.set({
                    lastConnected: {
                        port: port,
                        timestamp: Date.now()
                    }
                });
                
                return { connected: true, port: port };
            }
        } catch (error) {
            // Continue checking other ports
            continue;
        }
    }
    
    console.log('Creator AI server not found');
    return { connected: false, port: null };
}

// Handle file downloads
async function downloadFile(url, filename) {
    try {
        // Use Chrome downloads API for better security and UX
        const downloadId = await chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: false // Auto save to default downloads folder
        });
        
        return { success: true, downloadId: downloadId };
    } catch (error) {
        console.error('Download failed:', error);
        return { success: false, error: error.message };
    }
}

// Periodic server health check
function startHealthCheck() {
    setInterval(async () => {
        const result = await checkServerConnection();
        
        // Update badge based on connection status
        if (result.connected) {
            chrome.action.setBadgeText({ text: '' });
            chrome.action.setBadgeBackgroundColor({ color: '#4ade80' });
        } else {
            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#f87171' });
        }
    }, 30000); // Check every 30 seconds
}

// Handle tab updates to check for Creator AI pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if user is on Creator AI related pages
        if (tab.url.includes('localhost') && 
            (tab.url.includes('3001') || tab.url.includes('creator-ai'))) {
            
            console.log('Creator AI tab detected:', tab.url);
            
            // Update icon to show connection
            chrome.action.setIcon({
                tabId: tabId,
                path: {
                    16: 'icons/icon16.png',
                    32: 'icons/icon32.png',
                    48: 'icons/icon48.png',
                    128: 'icons/icon128.png'
                }
            });
        }
    }
});

// Handle context menu actions (optional feature)
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu for images
    chrome.contextMenus.create({
        id: 'creator-ai-animate',
        title: 'Tạo Animation với Creator AI',
        contexts: ['image']
    });
    
    chrome.contextMenus.create({
        id: 'creator-ai-generate',
        title: 'Tạo hình ảnh tương tự với Creator AI',
        contexts: ['image']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'creator-ai-animate' || info.menuItemId === 'creator-ai-generate') {
        // Open popup with image URL pre-filled
        chrome.action.openPopup();
        
        // Send image URL to popup (will be handled when popup opens)
        chrome.storage.local.set({
            contextImage: {
                url: info.srcUrl,
                action: info.menuItemId,
                timestamp: Date.now()
            }
        });
    }
});

// Notification handling
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message
    });
}

// Error reporting
function reportError(error, context = '') {
    console.error(`Creator AI Extension Error ${context}:`, error);
    
    // Store error for debugging (optional)
    chrome.storage.local.get(['errors'], (result) => {
        const errors = result.errors || [];
        errors.push({
            error: error.message,
            context: context,
            timestamp: Date.now(),
            stack: error.stack
        });
        
        // Keep only last 10 errors
        const recentErrors = errors.slice(-10);
        chrome.storage.local.set({ errors: recentErrors });
    });
}

// Initialize background script
console.log('Creator AI Extension background script loaded');

// Start health checking
startHealthCheck();

// Initial connection check
checkServerConnection();

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, 'unhandledrejection');
});

// Handle errors
self.addEventListener('error', (event) => {
    reportError(event.error, 'global_error');
});