require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const axios = require('axios');
const config = require('./config/config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize MSAL
const msalConfig = {
    auth: {
        clientId: config.microsoft.clientId,
        clientSecret: config.microsoft.clientSecret,
        authority: `https://login.microsoftonline.com/${config.microsoft.tenantId}`
    }
};

let msalInstance;
let accessToken = null;

try {
    msalInstance = new ConfidentialClientApplication(msalConfig);
} catch (error) {
    console.warn('MSAL initialization failed. OneDrive features will be disabled:', error.message);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.ensureDirSync(config.paths.uploads);
        cb(null, config.paths.uploads);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// In-memory storage for sync status
let syncStatus = {
    isAuthenticated: false,
    lastSync: null,
    filesCount: 0,
    status: 'Not authenticated'
};

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
app.get('/auth/login', (req, res) => {
    if (!msalInstance) {
        return res.status(500).json({ error: 'MSAL not configured' });
    }

    const authCodeUrlParameters = {
        scopes: config.microsoft.scopes,
        redirectUri: config.microsoft.redirectUri
    };

    msalInstance.getAuthCodeUrl(authCodeUrlParameters)
        .then((response) => {
            res.json({ authUrl: response });
        })
        .catch((error) => {
            console.error('Error generating auth URL:', error);
            res.status(500).json({ error: 'Failed to generate auth URL' });
        });
});

app.get('/auth/callback', async (req, res) => {
    if (!msalInstance) {
        return res.status(500).send('MSAL not configured');
    }

    const tokenRequest = {
        code: req.query.code,
        scopes: config.microsoft.scopes,
        redirectUri: config.microsoft.redirectUri
    };

    try {
        const response = await msalInstance.acquireTokenByCode(tokenRequest);
        accessToken = response.accessToken;
        syncStatus.isAuthenticated = true;
        syncStatus.status = 'Authenticated';
        
        res.redirect('/?auth=success');
    } catch (error) {
        console.error('Error acquiring token:', error);
        res.redirect('/?auth=error');
    }
});

// API routes

// Get sync status
app.get('/api/status', (req, res) => {
    res.json(syncStatus);
});

// Upload files
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        const results = [];

        for (const file of files) {
            // Move file to backup folder
            const backupPath = path.join(config.paths.backup, file.originalname);
            await fs.ensureDir(config.paths.backup);
            await fs.move(file.path, backupPath);

            results.push({
                originalName: file.originalname,
                size: file.size,
                path: backupPath
            });
        }

        // Update files count
        syncStatus.filesCount = await getLocalFilesCount();

        // Trigger sync if authenticated
        if (syncStatus.isAuthenticated) {
            syncToOneDrive();
        }

        res.json({ 
            success: true, 
            files: results,
            message: `${files.length} file(s) uploaded successfully`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// List local files
app.get('/api/files', async (req, res) => {
    try {
        await fs.ensureDir(config.paths.backup);
        const files = await fs.readdir(config.paths.backup);
        const fileDetails = [];

        for (const file of files) {
            const filePath = path.join(config.paths.backup, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
                fileDetails.push({
                    name: file,
                    size: stats.size,
                    modified: stats.mtime,
                    path: filePath
                });
            }
        }

        res.json(fileDetails);
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

// Download file
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(config.paths.backup, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Trigger manual sync
app.post('/api/sync', async (req, res) => {
    if (!syncStatus.isAuthenticated) {
        return res.status(401).json({ error: 'Not authenticated with OneDrive' });
    }

    try {
        await syncToOneDrive();
        res.json({ success: true, message: 'Sync completed' });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// Helper functions

async function getLocalFilesCount() {
    try {
        await fs.ensureDir(config.paths.backup);
        const files = await fs.readdir(config.paths.backup);
        return files.filter(file => {
            const filePath = path.join(config.paths.backup, file);
            return fs.statSync(filePath).isFile();
        }).length;
    } catch (error) {
        return 0;
    }
}

async function syncToOneDrive() {
    if (!accessToken) {
        throw new Error('No access token available');
    }

    try {
        syncStatus.status = 'Syncing...';
        
        // Create backup folder in OneDrive if it doesn't exist
        await createOneDriveFolder();
        
        // Get local files
        await fs.ensureDir(config.paths.backup);
        const files = await fs.readdir(config.paths.backup);
        
        let syncedCount = 0;
        for (const file of files) {
            const filePath = path.join(config.paths.backup, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
                await uploadFileToOneDrive(filePath, file);
                syncedCount++;
            }
        }
        
        syncStatus.lastSync = new Date();
        syncStatus.status = `Synced ${syncedCount} files`;
        syncStatus.filesCount = syncedCount;
        
        console.log(`Successfully synced ${syncedCount} files to OneDrive`);
    } catch (error) {
        syncStatus.status = 'Sync failed: ' + error.message;
        throw error;
    }
}

async function createOneDriveFolder() {
    const folderName = config.onedrive.folderName;
    
    try {
        // Check if folder exists
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/me/drive/root/children`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
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
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error creating OneDrive folder:', error);
        throw error;
    }
}

async function uploadFileToOneDrive(filePath, fileName) {
    const fileContent = await fs.readFile(filePath);
    const folderName = config.onedrive.folderName;
    
    try {
        await axios.put(
            `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${fileName}:/content`,
            fileContent,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/octet-stream'
                }
            }
        );
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        throw error;
    }
}

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Creator AI Backup System running on port ${PORT}`);
    console.log(`Web interface: http://localhost:${PORT}`);
    
    // Initialize sync status
    getLocalFilesCount().then(count => {
        syncStatus.filesCount = count;
        syncStatus.status = 'Ready';
    });
});

module.exports = app;