require('dotenv').config();
const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const axios = require('axios');
const config = require('./config/config');

class BackupService {
    constructor() {
        this.accessToken = null;
        this.msalInstance = null;
        this.watcher = null;
        this.syncQueue = [];
        this.isSyncing = false;
        
        this.initializeMsal();
        this.setupFileWatcher();
    }

    initializeMsal() {
        try {
            const msalConfig = {
                auth: {
                    clientId: config.microsoft.clientId,
                    clientSecret: config.microsoft.clientSecret,
                    authority: `https://login.microsoftonline.com/${config.microsoft.tenantId}`
                }
            };
            
            this.msalInstance = new ConfidentialClientApplication(msalConfig);
            console.log('MSAL initialized for backup service');
        } catch (error) {
            console.warn('MSAL initialization failed in backup service:', error.message);
        }
    }

    setupFileWatcher() {
        // Ensure backup directory exists
        fs.ensureDirSync(config.paths.backup);
        
        // Watch the backup directory for changes
        this.watcher = chokidar.watch(config.paths.backup, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: false
        });

        this.watcher
            .on('add', (filePath) => {
                console.log(`File added: ${filePath}`);
                this.addToSyncQueue(filePath, 'add');
            })
            .on('change', (filePath) => {
                console.log(`File changed: ${filePath}`);
                this.addToSyncQueue(filePath, 'change');
            })
            .on('unlink', (filePath) => {
                console.log(`File removed: ${filePath}`);
                this.addToSyncQueue(filePath, 'remove');
            })
            .on('error', (error) => {
                console.error('File watcher error:', error);
            });

        console.log(`Watching directory: ${config.paths.backup}`);
    }

    addToSyncQueue(filePath, action) {
        const fileName = path.basename(filePath);
        
        // Avoid duplicate entries
        const existingIndex = this.syncQueue.findIndex(item => 
            item.filePath === filePath && item.action === action
        );
        
        if (existingIndex === -1) {
            this.syncQueue.push({
                filePath,
                fileName,
                action,
                timestamp: new Date()
            });
        }

        // Process queue if not already syncing
        if (!this.isSyncing) {
            this.processSyncQueue();
        }
    }

    async processSyncQueue() {
        if (this.syncQueue.length === 0 || this.isSyncing) {
            return;
        }

        this.isSyncing = true;
        console.log(`Processing sync queue with ${this.syncQueue.length} items`);

        try {
            // Process all items in queue
            while (this.syncQueue.length > 0) {
                const item = this.syncQueue.shift();
                await this.syncFile(item);
                
                // Small delay between operations
                await this.delay(1000);
            }
        } catch (error) {
            console.error('Error processing sync queue:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    async syncFile(item) {
        if (!this.accessToken) {
            console.log('No access token available, skipping sync');
            return;
        }

        try {
            switch (item.action) {
                case 'add':
                case 'change':
                    await this.uploadFileToOneDrive(item.filePath, item.fileName);
                    console.log(`✓ Synced: ${item.fileName}`);
                    break;
                    
                case 'remove':
                    await this.deleteFileFromOneDrive(item.fileName);
                    console.log(`✓ Removed from OneDrive: ${item.fileName}`);
                    break;
            }
        } catch (error) {
            console.error(`Failed to sync ${item.fileName}:`, error.message);
            
            // Re-add to queue for retry (with limit)
            if (!item.retryCount) item.retryCount = 0;
            if (item.retryCount < 3) {
                item.retryCount++;
                this.syncQueue.push(item);
            }
        }
    }

    async uploadFileToOneDrive(filePath, fileName) {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }

        const fileContent = await fs.readFile(filePath);
        const folderName = config.onedrive.folderName;
        
        // Ensure backup folder exists in OneDrive
        await this.ensureOneDriveFolder();
        
        await axios.put(
            `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${fileName}:/content`,
            fileContent,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/octet-stream'
                }
            }
        );
    }

    async deleteFileFromOneDrive(fileName) {
        const folderName = config.onedrive.folderName;
        
        try {
            await axios.delete(
                `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${fileName}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`File ${fileName} not found in OneDrive, nothing to delete`);
            } else {
                throw error;
            }
        }
    }

    async ensureOneDriveFolder() {
        const folderName = config.onedrive.folderName;
        
        try {
            // Check if folder exists
            const response = await axios.get(
                `https://graph.microsoft.com/v1.0/me/drive/root/children`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            const folderExists = response.data.value.some(item => 
                item.name === folderName && item.folder
            );
            
            if (!folderExists) {
                // Create folder
                await axios.post(
                    `https://graph.microsoft.com/v1.0/me/drive/root/children`,
                    {
                        name: folderName,
                        folder: {}
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`Created OneDrive folder: ${folderName}`);
            }
        } catch (error) {
            console.error('Error ensuring OneDrive folder:', error);
            throw error;
        }
    }

    async authenticateWithDeviceCode() {
        if (!this.msalInstance) {
            throw new Error('MSAL not initialized');
        }

        try {
            const deviceCodeRequest = {
                scopes: config.microsoft.scopes,
                deviceCodeCallback: (response) => {
                    console.log('\n=== OneDrive Authentication Required ===');
                    console.log(`Please go to ${response.verificationUri} and enter code: ${response.userCode}`);
                    console.log('Waiting for authentication...\n');
                }
            };

            const response = await this.msalInstance.acquireTokenByDeviceCode(deviceCodeRequest);
            this.accessToken = response.accessToken;
            
            console.log('✓ Successfully authenticated with OneDrive');
            
            // Start initial sync
            this.performInitialSync();
            
            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }

    async performInitialSync() {
        console.log('Performing initial sync of existing files...');
        
        try {
            const files = await fs.readdir(config.paths.backup);
            
            for (const file of files) {
                const filePath = path.join(config.paths.backup, file);
                const stats = await fs.stat(filePath);
                
                if (stats.isFile()) {
                    this.addToSyncQueue(filePath, 'add');
                }
            }
            
            console.log(`Added ${files.length} files to initial sync queue`);
        } catch (error) {
            console.error('Error during initial sync:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        if (this.watcher) {
            this.watcher.close();
            console.log('File watcher stopped');
        }
    }
}

// Main execution
async function main() {
    console.log('=== Creator AI Backup Service ===');
    console.log('Starting automated backup service...\n');
    
    const backupService = new BackupService();
    
    // Check if we need to authenticate
    if (config.microsoft.clientId && config.microsoft.clientSecret) {
        console.log('Attempting to authenticate with OneDrive...');
        await backupService.authenticateWithDeviceCode();
    } else {
        console.log('OneDrive credentials not configured. File monitoring will continue without cloud sync.');
        console.log('To enable OneDrive sync, configure your Microsoft app credentials in .env file');
    }
    
    // Keep the service running
    process.on('SIGINT', () => {
        console.log('\nShutting down backup service...');
        backupService.stop();
        process.exit(0);
    });
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = BackupService;