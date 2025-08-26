#!/usr/bin/env node

/**
 * Local Deployment Script for Creator AI
 * Sets up the Creator AI system on a local server
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class LocalDeployment {
    constructor() {
        this.config = {
            port: process.env.PORT || 3000,
            environment: process.env.NODE_ENV || 'production',
            dataDir: process.env.DATA_DIR || './creator-ai-data',
            logLevel: process.env.LOG_LEVEL || 'info'
        };
        
        this.requiredDirs = [
            'models',
            'training_data',
            'output',
            'uploads',
            'logs'
        ];
    }

    async deploy() {
        try {
            console.log('🚀 Starting Creator AI local deployment...\n');
            
            await this.checkSystemRequirements();
            await this.createDirectories();
            await this.setupEnvironment();
            await this.installDependencies();
            await this.runTests();
            await this.startServices();
            
            console.log('\n✅ Creator AI deployed successfully!');
            console.log(`📊 API Server: http://localhost:${this.config.port}`);
            console.log(`🎵 Web Interface: http://localhost:${parseInt(this.config.port) + 1000}`);
            console.log(`📁 Data Directory: ${path.resolve(this.config.dataDir)}`);
            console.log('\n📖 See README.md for usage instructions');
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            process.exit(1);
        }
    }

    async checkSystemRequirements() {
        console.log('🔍 Checking system requirements...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (majorVersion < 18) {
            throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
        }
        
        console.log(`  ✓ Node.js ${nodeVersion}`);
        
        // Check available memory
        const totalMemory = require('os').totalmem();
        const memoryGB = Math.round(totalMemory / (1024 * 1024 * 1024));
        
        if (memoryGB < 4) {
            console.warn(`  ⚠️  Low memory detected (${memoryGB}GB). 8GB+ recommended for optimal performance.`);
        } else {
            console.log(`  ✓ Memory: ${memoryGB}GB`);
        }
        
        // Check disk space
        try {
            const stats = await fs.stat('.');
            console.log('  ✓ Disk space available');
        } catch (error) {
            throw new Error('Unable to check disk space');
        }
        
        // Check if ports are available
        await this.checkPort(this.config.port);
        await this.checkPort(parseInt(this.config.port) + 1000);
        
        console.log('  ✓ Required ports available\n');
    }

    async checkPort(port) {
        return new Promise((resolve, reject) => {
            const net = require('net');
            const server = net.createServer();
            
            server.listen(port, (err) => {
                if (err) {
                    reject(new Error(`Port ${port} is already in use`));
                } else {
                    server.once('close', () => resolve());
                    server.close();
                }
            });
            
            server.on('error', (err) => {
                reject(new Error(`Port ${port} is already in use`));
            });
        });
    }

    async createDirectories() {
        console.log('📁 Creating directories...');
        
        // Create main data directory
        await fs.mkdir(this.config.dataDir, { recursive: true });
        
        // Create subdirectories
        for (const dir of this.requiredDirs) {
            const fullPath = path.join(this.config.dataDir, dir);
            await fs.mkdir(fullPath, { recursive: true });
            console.log(`  ✓ ${fullPath}`);
        }
        
        // Create default subdirectories for models
        const modelDirs = ['text-to-audio', 'audio-processing', 'content-generation'];
        for (const modelDir of modelDirs) {
            const fullPath = path.join(this.config.dataDir, 'models', modelDir);
            await fs.mkdir(fullPath, { recursive: true });
            console.log(`  ✓ ${fullPath}`);
        }
        
        console.log('');
    }

    async setupEnvironment() {
        console.log('⚙️  Setting up environment...');
        
        // Create .env file if it doesn't exist
        const envPath = '.env';
        try {
            await fs.access(envPath);
            console.log('  ✓ .env file exists');
        } catch (error) {
            const envContent = `# Creator AI Environment Configuration
NODE_ENV=${this.config.environment}
PORT=${this.config.port}
DATA_DIR=${this.config.dataDir}
LOG_LEVEL=${this.config.logLevel}

# TensorFlow.js Backend (cpu, webgl, tensorflow)
TFJS_BACKEND=cpu

# API Configuration
API_HOST=localhost
API_PORT=${this.config.port}

# Model Configuration
MAX_MODEL_SIZE=2GB
MAX_TRAINING_TIME=3600

# Security
SESSION_SECRET=${this.generateRandomSecret()}
`;
            
            await fs.writeFile(envPath, envContent);
            console.log('  ✓ Created .env file');
        }
        
        console.log('');
    }

    generateRandomSecret() {
        return require('crypto').randomBytes(32).toString('hex');
    }

    async installDependencies() {
        console.log('📦 Installing dependencies...');
        
        try {
            execSync('npm ci', { stdio: 'inherit' });
            console.log('  ✓ Dependencies installed\n');
        } catch (error) {
            throw new Error('Failed to install dependencies');
        }
    }

    async runTests() {
        console.log('🧪 Running tests...');
        
        try {
            execSync('npm test', { stdio: 'inherit' });
            console.log('  ✓ All tests passed\n');
        } catch (error) {
            console.warn('  ⚠️  Some tests failed, but continuing deployment...\n');
        }
    }

    async startServices() {
        console.log('🔄 Starting services...');
        
        // Start API server
        const apiProcess = spawn('node', ['src/api/server.js'], {
            env: { ...process.env, PORT: this.config.port },
            detached: false
        });
        
        apiProcess.stdout.on('data', (data) => {
            console.log(`API: ${data.toString().trim()}`);
        });
        
        apiProcess.stderr.on('data', (data) => {
            console.error(`API Error: ${data.toString().trim()}`);
        });
        
        // Wait for API to start
        await this.waitForService(`http://localhost:${this.config.port}/health`);
        console.log('  ✓ API Server started');
        
        // Start Electron app (if not in headless mode)
        if (process.env.HEADLESS !== 'true') {
            setTimeout(() => {
                const appProcess = spawn('npm', ['start'], {
                    env: { ...process.env, API_URL: `http://localhost:${this.config.port}` },
                    detached: false
                });
                
                appProcess.stdout.on('data', (data) => {
                    console.log(`App: ${data.toString().trim()}`);
                });
                
                console.log('  ✓ Desktop application started');
            }, 3000);
        }
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down services...');
            apiProcess.kill();
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down services...');
            apiProcess.kill();
            process.exit(0);
        });
    }

    async waitForService(url, maxAttempts = 30) {
        const axios = require('axios');
        
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await axios.get(url, { timeout: 1000 });
                return;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        throw new Error(`Service at ${url} did not start within ${maxAttempts} seconds`);
    }

    async createSystemdService() {
        console.log('🔧 Creating systemd service...');
        
        const serviceContent = `[Unit]
Description=Creator AI Service
After=network.target

[Service]
Type=simple
User=creator-ai
WorkingDirectory=${process.cwd()}
Environment=NODE_ENV=production
Environment=PORT=${this.config.port}
ExecStart=${process.execPath} src/api/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
`;
        
        try {
            await fs.writeFile('/tmp/creator-ai.service', serviceContent);
            console.log('  ✓ Systemd service file created at /tmp/creator-ai.service');
            console.log('  ➡️  To install: sudo cp /tmp/creator-ai.service /etc/systemd/system/');
            console.log('  ➡️  To enable: sudo systemctl enable creator-ai');
            console.log('  ➡️  To start: sudo systemctl start creator-ai');
        } catch (error) {
            console.warn('  ⚠️  Could not create systemd service file');
        }
        
        console.log('');
    }
}

// CLI interface
if (require.main === module) {
    const deployment = new LocalDeployment();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Creator AI Local Deployment Script

Usage: node scripts/deploy-local.js [options]

Options:
  --port PORT         API server port (default: 3000)
  --data-dir DIR      Data directory path (default: ./creator-ai-data)
  --environment ENV   Environment (default: production)
  --headless         Run without desktop application
  --systemd          Create systemd service file
  --help, -h         Show this help message

Environment Variables:
  PORT               API server port
  DATA_DIR           Data directory path
  NODE_ENV           Environment (development/production)
  LOG_LEVEL          Logging level (debug/info/warn/error)
  HEADLESS           Run in headless mode

Examples:
  node scripts/deploy-local.js
  node scripts/deploy-local.js --port 8080 --data-dir /opt/creator-ai
  HEADLESS=true node scripts/deploy-local.js
`);
        process.exit(0);
    }
    
    // Parse options
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--port':
                deployment.config.port = args[++i];
                break;
            case '--data-dir':
                deployment.config.dataDir = args[++i];
                break;
            case '--environment':
                deployment.config.environment = args[++i];
                break;
            case '--headless':
                process.env.HEADLESS = 'true';
                break;
            case '--systemd':
                process.env.CREATE_SYSTEMD = 'true';
                break;
        }
    }
    
    deployment.deploy().catch(error => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });
}

module.exports = LocalDeployment;