module.exports = {
    port: process.env.PORT || 3000,
    
    // Microsoft Graph API Configuration
    microsoft: {
        clientId: process.env.CLIENT_ID || '',
        clientSecret: process.env.CLIENT_SECRET || '',
        tenantId: process.env.TENANT_ID || 'common',
        redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback',
        scopes: ['user.read', 'files.readwrite.all']
    },
    
    // File System Configuration
    paths: {
        backup: process.env.BACKUP_FOLDER || './backup-data',
        uploads: process.env.UPLOAD_FOLDER || './uploads',
        public: './public'
    },
    
    // OneDrive Configuration
    onedrive: {
        folderName: process.env.ONEDRIVE_FOLDER_NAME || 'CreatorAI-Backup',
        syncInterval: parseInt(process.env.SYNC_INTERVAL) || 30000 // 30 seconds
    },
    
    // Security
    session: {
        secret: process.env.SESSION_SECRET || 'default-secret-change-in-production'
    }
};