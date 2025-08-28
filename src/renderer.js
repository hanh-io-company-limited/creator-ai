/*
 * Creator AI - Renderer Process
 * 
 * Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file contains proprietary source code and trade secrets of Hanh IO Company Limited.
 * Any unauthorized copying, distribution, modification, or reverse engineering is strictly 
 * prohibited and may result in severe legal penalties.
 * 
 * All rights, title, and interest in this software are owned exclusively by 
 * Hanh IO Company Limited.
 */

// Creator AI Renderer Process - Extended for Metalax NFT Platform
const { ipcRenderer } = require('electron');
const Store = require('electron-store');

// Initialize application store
const store = new Store();

// Application state
let currentProject = null;
let loadedModels = [];
let isTraining = false;
let isGenerating = false;

// Metalax NFT Platform state
let metalaxClient = null;
let connectedWallet = null;
let backendStatus = false;
let processedImageData = null;

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const statusElement = document.getElementById('status');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    setupMetalaxEventListeners();
    loadSettings();
    checkSystemStatus();
    loadModels();
    initializeMetalaxClient();
    checkBackendStatus();
});

function initializeApp() {
    console.log('Creator AI - Metalax NFT Platform initialized');
    updateStatus('Ready');
    
    // Load recent projects
    const recentProjects = store.get('recentProjects', []);
    updateRecentProjects(recentProjects);
    
    // Initialize Metalax components
    updateWalletStatus('Disconnected');
    updateNetworkStatus('Devnet');
}

function setupEventListeners() {
    // Navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Training form
    const trainingForm = document.getElementById('training-form');
    trainingForm.addEventListener('submit', handleTrainingSubmit);

    // Generation form
    const generationForm = document.getElementById('generation-form');
    generationForm.addEventListener('submit', handleGenerationSubmit);

    // File selection buttons
    document.getElementById('select-data').addEventListener('click', selectTrainingData);
    document.getElementById('select-output-dir').addEventListener('click', selectOutputDirectory);

    // Model library actions
    document.getElementById('import-model').addEventListener('click', importModel);
    document.getElementById('refresh-library').addEventListener('click', loadModels);

    // Video preview actions
    document.getElementById('save-video').addEventListener('click', saveGeneratedVideo);
    document.getElementById('regenerate').addEventListener('click', regenerateVideo);

    // Menu event listeners
    ipcRenderer.on('menu-new-project', handleNewProject);
    ipcRenderer.on('menu-open-project', handleOpenProject);
    ipcRenderer.on('menu-save-project', handleSaveProject);
    ipcRenderer.on('menu-train-model', () => switchTab('train'));
    ipcRenderer.on('menu-load-model', importModel);
    ipcRenderer.on('menu-model-manager', () => switchTab('library'));
    ipcRenderer.on('menu-generate-video', () => switchTab('generate'));
    ipcRenderer.on('menu-batch-generate', handleBatchGenerate);
    ipcRenderer.on('menu-user-guide', showUserGuide);
}

// Tab switching
function switchTab(tabId) {
    // Update navigation
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update content
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Status management
function updateStatus(message, type = 'success') {
    statusElement.textContent = message;
    statusElement.className = `status-${type}`;
}

// System status check
async function checkSystemStatus() {
    try {
        // Check GPU availability
        const gpuStatus = await checkGPUStatus();
        document.getElementById('gpu-status').textContent = gpuStatus;

        // Check memory
        const memoryInfo = process.memoryUsage();
        const memoryMB = Math.round(memoryInfo.heapUsed / 1024 / 1024);
        document.getElementById('memory-status').textContent = `${memoryMB} MB`;

        // Update models count
        document.getElementById('models-count').textContent = loadedModels.length;
    } catch (error) {
        console.error('System status check failed:', error);
    }
}

async function checkGPUStatus() {
    try {
        // This would integrate with TensorFlow.js or similar
        // For now, return a placeholder
        return 'Available';
    } catch (error) {
        return 'Not Available';
    }
}

// Model management
async function loadModels() {
    try {
        const models = store.get('models', []);
        loadedModels = models;
        
        updateModelsGrid(models);
        updateModelSelect(models);
        
        document.getElementById('models-count').textContent = models.length;
    } catch (error) {
        console.error('Failed to load models:', error);
        updateStatus('Failed to load models', 'error');
    }
}

function updateModelsGrid(models) {
    const grid = document.getElementById('models-grid');
    
    if (models.length === 0) {
        grid.innerHTML = '<p>No models available. Import or train a model to get started.</p>';
        return;
    }

    grid.innerHTML = models.map(model => `
        <div class="model-card">
            <h4>${model.name}</h4>
            <div class="model-info">
                Type: ${model.type}<br>
                Size: ${model.size || 'Unknown'}<br>
                Created: ${new Date(model.created).toLocaleDateString()}
            </div>
            <div class="model-actions">
                <button class="use-model" onclick="useModel('${model.id}')">Use</button>
                <button class="delete-model" onclick="deleteModel('${model.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateModelSelect(models) {
    const select = document.getElementById('selected-model');
    
    if (models.length === 0) {
        select.innerHTML = '<option value="">No models available</option>';
        return;
    }

    select.innerHTML = models.map(model => 
        `<option value="${model.id}">${model.name} (${model.type})</option>`
    ).join('');
}

// Training functionality
async function handleTrainingSubmit(event) {
    event.preventDefault();
    
    if (isTraining) {
        updateStatus('Training already in progress', 'warning');
        return;
    }

    const formData = new FormData(event.target);
    const trainingConfig = {
        name: document.getElementById('model-name').value,
        type: document.getElementById('model-type').value,
        epochs: parseInt(document.getElementById('epochs').value),
        dataPath: document.getElementById('data-path').textContent
    };

    if (!trainingConfig.name || trainingConfig.dataPath === 'No data selected') {
        updateStatus('Please fill all required fields', 'error');
        return;
    }

    startTraining(trainingConfig);
}

async function startTraining(config) {
    try {
        isTraining = true;
        updateStatus('Training started', 'info');
        
        // Show progress section
        document.getElementById('training-progress').style.display = 'block';
        document.getElementById('total-epochs').textContent = config.epochs;
        
        // Simulate training process
        for (let epoch = 1; epoch <= config.epochs; epoch++) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate training time
            
            const progress = (epoch / config.epochs) * 100;
            const loss = Math.max(0.01, 1.0 - (epoch / config.epochs) * 0.9 + Math.random() * 0.1);
            
            document.getElementById('current-epoch').textContent = epoch;
            document.getElementById('progress-fill').style.width = `${progress}%`;
            document.getElementById('current-loss').textContent = loss.toFixed(4);
            
            const remainingTime = Math.ceil((config.epochs - epoch) * 0.1);
            document.getElementById('time-remaining').textContent = `${remainingTime}s`;
        }

        // Save trained model
        const newModel = {
            id: Date.now().toString(),
            name: config.name,
            type: config.type,
            size: '~50MB',
            created: Date.now(),
            path: `models/${config.name}.json`
        };

        const models = store.get('models', []);
        models.push(newModel);
        store.set('models', models);

        loadModels();
        updateStatus('Model trained successfully', 'success');
        
    } catch (error) {
        console.error('Training failed:', error);
        updateStatus('Training failed', 'error');
    } finally {
        isTraining = false;
        document.getElementById('training-progress').style.display = 'none';
    }
}

// Generation functionality
async function handleGenerationSubmit(event) {
    event.preventDefault();
    
    if (isGenerating) {
        updateStatus('Generation already in progress', 'warning');
        return;
    }

    const modelId = document.getElementById('selected-model').value;
    const prompt = document.getElementById('prompt').value;
    const duration = parseInt(document.getElementById('duration').value);
    const resolution = document.getElementById('resolution').value;

    if (!modelId || !prompt) {
        updateStatus('Please select a model and enter a prompt', 'error');
        return;
    }

    startGeneration({ modelId, prompt, duration, resolution });
}

async function startGeneration(config) {
    try {
        isGenerating = true;
        updateStatus('Generating video...', 'info');
        
        // Show progress section
        document.getElementById('generation-progress').style.display = 'block';
        
        // Simulate generation process
        const steps = ['Initializing model...', 'Processing prompt...', 'Generating frames...', 'Encoding video...', 'Finalizing...'];
        
        for (let i = 0; i < steps.length; i++) {
            document.getElementById('generation-status').textContent = steps[i];
            const progress = ((i + 1) / steps.length) * 100;
            document.getElementById('gen-progress-fill').style.width = `${progress}%`;
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        }

        // Show video preview (placeholder)
        document.getElementById('generation-progress').style.display = 'none';
        document.getElementById('video-preview').style.display = 'block';
        
        // Set a placeholder video source
        const video = document.getElementById('preview-video');
        video.src = ''; // Would be the generated video path
        
        updateStatus('Video generated successfully', 'success');
        
    } catch (error) {
        console.error('Generation failed:', error);
        updateStatus('Generation failed', 'error');
    } finally {
        isGenerating = false;
    }
}

// File operations
async function selectTrainingData() {
    try {
        const result = await ipcRenderer.invoke('load-file', [
            { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'mkv'] },
            { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
            { name: 'All Files', extensions: ['*'] }
        ]);

        if (result.success) {
            document.getElementById('data-path').textContent = result.path;
        }
    } catch (error) {
        console.error('Failed to select training data:', error);
    }
}

async function selectOutputDirectory() {
    // Implementation would use dialog to select directory
    document.getElementById('output-dir-path').textContent = 'Selected directory path';
}

async function importModel() {
    try {
        const result = await ipcRenderer.invoke('load-file', [
            { name: 'Model Files', extensions: ['json', 'h5', 'pb'] },
            { name: 'All Files', extensions: ['*'] }
        ]);

        if (result.success) {
            // Parse and import model
            const newModel = {
                id: Date.now().toString(),
                name: 'Imported Model',
                type: 'Unknown',
                size: '~100MB',
                created: Date.now(),
                path: result.path
            };

            const models = store.get('models', []);
            models.push(newModel);
            store.set('models', models);

            loadModels();
            updateStatus('Model imported successfully', 'success');
        }
    } catch (error) {
        console.error('Failed to import model:', error);
        updateStatus('Failed to import model', 'error');
    }
}

async function saveGeneratedVideo() {
    try {
        const result = await ipcRenderer.invoke('save-file', null, 'generated_video.mp4');
        if (result.success) {
            updateStatus('Video saved successfully', 'success');
        }
    } catch (error) {
        console.error('Failed to save video:', error);
        updateStatus('Failed to save video', 'error');
    }
}

function regenerateVideo() {
    document.getElementById('video-preview').style.display = 'none';
    const generationForm = document.getElementById('generation-form');
    handleGenerationSubmit({ preventDefault: () => {}, target: generationForm });
}

// Model actions
function useModel(modelId) {
    document.getElementById('selected-model').value = modelId;
    switchTab('generate');
}

function deleteModel(modelId) {
    if (confirm('Are you sure you want to delete this model?')) {
        const models = store.get('models', []);
        const updatedModels = models.filter(model => model.id !== modelId);
        store.set('models', updatedModels);
        loadModels();
        updateStatus('Model deleted', 'success');
    }
}

// Project management
function handleNewProject() {
    if (confirm('Create a new project? Any unsaved changes will be lost.')) {
        currentProject = null;
        updateStatus('New project created', 'success');
    }
}

function handleOpenProject(event, projectPath) {
    // Implementation for opening existing project
    currentProject = projectPath;
    updateStatus(`Opened project: ${projectPath}`, 'success');
}

function handleSaveProject() {
    // Implementation for saving current project
    updateStatus('Project saved', 'success');
}

function handleBatchGenerate() {
    switchTab('generate');
    // Additional batch generation logic could be implemented
}

function showUserGuide() {
    // Could open an external help window or in-app guide
    alert('User guide would be displayed here');
}

// Settings management
function loadSettings() {
    const settings = store.get('settings', {
        gpuAcceleration: true,
        outputDirectory: 'Documents/Creator AI',
        maxMemory: 4
    });

    document.getElementById('gpu-acceleration').checked = settings.gpuAcceleration;
    document.getElementById('output-dir-path').textContent = settings.outputDirectory;
    document.getElementById('max-memory').value = settings.maxMemory;
}

function updateRecentProjects(projects) {
    const list = document.getElementById('recent-projects');
    
    if (projects.length === 0) {
        list.innerHTML = '<li>No recent projects</li>';
        return;
    }

    list.innerHTML = projects.map(project => 
        `<li><a href="#" onclick="handleOpenProject(null, '${project.path}')">${project.name}</a></li>`
    ).join('');
}

// ============================================================================
// METALAX NFT PLATFORM FUNCTIONALITY
// ============================================================================

/**
 * Initialize Metalax Solana client
 */
async function initializeMetalaxClient() {
    try {
        if (typeof MetalaxSolanaClient !== 'undefined') {
            metalaxClient = new MetalaxSolanaClient({
                network: 'devnet' // Switch to mainnet for production
            });
            console.log('Metalax client initialized');
            updateStatus('Metalax client ready');
        } else {
            console.error('MetalaxSolanaClient not available');
            updateStatus('Failed to initialize Metalax client', 'error');
        }
    } catch (error) {
        console.error('Failed to initialize Metalax client:', error);
        updateStatus('Metalax client error', 'error');
    }
}

/**
 * Setup event listeners for Metalax functionality
 */
function setupMetalaxEventListeners() {
    // Wallet connection
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', handleWalletConnection);
    }

    // Image upload and processing
    const imageInput = document.getElementById('image-input');
    const imageUploadArea = document.getElementById('image-upload-area');
    const processImageBtn = document.getElementById('process-image-btn');
    const qualitySlider = document.getElementById('image-quality');
    const qualityValue = document.getElementById('quality-value');
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelection);
    }
    
    if (imageUploadArea) {
        imageUploadArea.addEventListener('click', () => imageInput?.click());
        imageUploadArea.addEventListener('dragover', handleDragOver);
        imageUploadArea.addEventListener('drop', handleImageDrop);
    }
    
    if (processImageBtn) {
        processImageBtn.addEventListener('click', handleImageProcessing);
    }
    
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value + '%';
        });
    }

    // NFT minting
    const mintForm = document.getElementById('mint-nft-form');
    if (mintForm) {
        mintForm.addEventListener('submit', handleNFTMinting);
    }

    // Backend management
    const startBackendBtn = document.getElementById('start-backend-btn');
    if (startBackendBtn) {
        startBackendBtn.addEventListener('click', startBackendServer);
    }

    // Tab switching (existing functionality updated)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.dataset.tab;
            switchTab(tabId);
            
            // Load tab-specific data
            if (tabId === 'platform-stats') {
                loadPlatformStats();
            } else if (tabId === 'my-nfts') {
                loadMyNFTs();
            }
        });
    });
}

/**
 * Handle wallet connection/disconnection
 */
async function handleWalletConnection() {
    try {
        if (!metalaxClient) {
            updateStatus('Metalax client not initialized', 'error');
            return;
        }

        const connectBtn = document.getElementById('connect-wallet-btn');
        
        if (connectedWallet) {
            // Disconnect wallet
            const result = await metalaxClient.disconnectWallet();
            if (result.success) {
                connectedWallet = null;
                updateWalletStatus('Disconnected');
                connectBtn.textContent = 'Connect Wallet';
                document.getElementById('wallet-balance').style.display = 'none';
                updateStatus('Wallet disconnected');
            }
        } else {
            // Connect wallet
            connectBtn.textContent = 'Connecting...';
            connectBtn.disabled = true;
            
            const result = await metalaxClient.connectWallet();
            
            if (result.success) {
                connectedWallet = result.publicKey;
                updateWalletStatus(`Connected: ${result.publicKey.slice(0, 8)}...`);
                connectBtn.textContent = 'Disconnect';
                
                // Show balance
                const balanceDiv = document.getElementById('wallet-balance');
                const balanceAmount = document.getElementById('balance-amount');
                balanceAmount.textContent = `${result.balance.toFixed(4)} SOL`;
                balanceDiv.style.display = 'block';
                
                updateStatus('Wallet connected successfully');
                
                // Enable minting button if image is processed
                updateMintButtonState();
            } else {
                updateStatus(`Wallet connection failed: ${result.error}`, 'error');
                connectBtn.textContent = 'Connect Wallet';
            }
            
            connectBtn.disabled = false;
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        updateStatus('Wallet connection error', 'error');
        document.getElementById('connect-wallet-btn').disabled = false;
    }
}

/**
 * Handle image selection
 */
function handleImageSelection(event) {
    const file = event.target.files[0];
    if (file) {
        displayImagePreview(file);
        document.getElementById('process-image-btn').disabled = false;
    }
}

/**
 * Handle drag and drop
 */
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleImageDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            document.getElementById('image-input').files = files;
            displayImagePreview(file);
            document.getElementById('process-image-btn').disabled = false;
        }
    }
}

/**
 * Display image preview
 */
function displayImagePreview(file) {
    const preview = document.getElementById('image-preview');
    const img = document.getElementById('preview-img');
    const details = document.getElementById('image-details');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        details.textContent = `${file.name} - ${(file.size / 1024).toFixed(1)} KB - ${file.type}`;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

/**
 * Handle image processing
 */
async function handleImageProcessing() {
    try {
        const fileInput = document.getElementById('image-input');
        const file = fileInput.files[0];
        
        if (!file) {
            updateStatus('No image selected', 'error');
            return;
        }

        const targetSize = parseInt(document.getElementById('target-size').value);
        const quality = parseInt(document.getElementById('image-quality').value);
        const format = document.getElementById('image-format').value;

        updateStatus('Processing image...');
        
        // Create FormData for image upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('targetSize', targetSize);
        formData.append('quality', quality);
        formData.append('format', format);

        // Send to backend for processing
        const response = await fetch('http://localhost:3001/api/process-image', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            processedImageData = result.data.processedImage;
            
            // Update UI with processed image info
            const details = document.getElementById('image-details');
            details.innerHTML = `
                <strong>Original:</strong> ${(file.size / 1024).toFixed(1)} KB<br>
                <strong>Processed:</strong> ${(result.data.size / 1024).toFixed(1)} KB<br>
                <strong>Compression:</strong> ${result.data.metadata.compressionRatio}<br>
                <strong>Format:</strong> ${result.data.format.toUpperCase()}<br>
                <strong>Hash:</strong> ${result.data.hash.slice(0, 16)}...
            `;
            
            updateStatus('Image processed successfully');
            updateMintButtonState();
        } else {
            throw new Error('Image processing failed');
        }

    } catch (error) {
        console.error('Image processing error:', error);
        updateStatus(`Image processing failed: ${error.message}`, 'error');
    }
}

/**
 * Handle NFT minting
 */
async function handleNFTMinting(event) {
    event.preventDefault();
    
    try {
        if (!connectedWallet) {
            updateStatus('Please connect your wallet first', 'error');
            return;
        }

        if (!processedImageData) {
            updateStatus('Please process an image first', 'error');
            return;
        }

        const name = document.getElementById('nft-name').value.trim();
        const symbol = document.getElementById('nft-symbol').value.trim();
        const uri = document.getElementById('nft-uri').value.trim();
        const royalty = parseFloat(document.getElementById('royalty-percentage').value);

        if (!name || !symbol) {
            updateStatus('Please fill in NFT name and symbol', 'error');
            return;
        }

        // Show progress
        document.getElementById('mint-progress').style.display = 'block';
        document.getElementById('mint-result').style.display = 'none';
        
        updateMintProgress(0, 'Preparing transaction...');
        
        // Mint NFT
        const nftData = {
            name,
            symbol,
            uri,
            imageData: processedImageData,
            royaltyBasisPoints: Math.floor(royalty * 100)
        };

        updateMintProgress(25, 'Creating mint transaction...');
        
        const result = await metalaxClient.mintNFT(nftData);
        
        if (result.success) {
            updateMintProgress(100, 'NFT minted successfully!');
            
            // Show success result
            setTimeout(() => {
                document.getElementById('mint-progress').style.display = 'none';
                document.getElementById('mint-result').style.display = 'block';
                document.getElementById('mint-success').style.display = 'block';
                document.getElementById('mint-error').style.display = 'none';
                
                // Update result details
                const txLink = document.getElementById('tx-link');
                const mintAddress = document.getElementById('mint-address');
                const tokenAccount = document.getElementById('token-account');
                
                txLink.href = `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`;
                txLink.textContent = result.signature.slice(0, 16) + '...';
                mintAddress.textContent = result.mintAddress;
                tokenAccount.textContent = result.tokenAccount;
                
                updateStatus('NFT minted successfully!');
                
                // Reset form
                resetMintForm();
            }, 1000);
            
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('NFT minting error:', error);
        
        document.getElementById('mint-progress').style.display = 'none';
        document.getElementById('mint-result').style.display = 'block';
        document.getElementById('mint-success').style.display = 'none';
        document.getElementById('mint-error').style.display = 'block';
        document.getElementById('error-details').textContent = error.message;
        
        updateStatus(`Minting failed: ${error.message}`, 'error');
    }
}

/**
 * Update mint progress
 */
function updateMintProgress(percentage, status) {
    const progressFill = document.getElementById('mint-progress-fill');
    const statusText = document.getElementById('mint-status');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (statusText) {
        statusText.textContent = status;
    }
}

/**
 * Reset mint form
 */
function resetMintForm() {
    document.getElementById('mint-nft-form').reset();
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('process-image-btn').disabled = true;
    processedImageData = null;
    updateMintButtonState();
}

/**
 * Update mint button state
 */
function updateMintButtonState() {
    const mintBtn = document.getElementById('mint-nft-btn');
    if (mintBtn) {
        mintBtn.disabled = !(connectedWallet && processedImageData);
    }
}

/**
 * Load platform statistics
 */
async function loadPlatformStats() {
    try {
        if (!metalaxClient) return;
        
        const result = await metalaxClient.getPlatformStats();
        
        if (result.success) {
            const data = result.data;
            document.getElementById('total-minted').textContent = data.totalMinted;
            document.getElementById('total-fees').textContent = `${data.totalFeesCollectedSOL.toFixed(4)} SOL`;
            document.getElementById('platform-owner').textContent = `${data.owner.slice(0, 8)}...${data.owner.slice(-8)}`;
        }
    } catch (error) {
        console.error('Failed to load platform stats:', error);
    }
}

/**
 * Load user's NFTs
 */
async function loadMyNFTs() {
    try {
        if (!connectedWallet) {
            document.getElementById('nfts-grid').innerHTML = 
                '<div class="empty-state"><p>Please connect your wallet to view your NFTs</p></div>';
            return;
        }

        // TODO: Implement NFT fetching logic
        document.getElementById('nfts-grid').innerHTML = 
            '<div class="empty-state"><p>NFT loading functionality will be implemented</p></div>';
        
    } catch (error) {
        console.error('Failed to load NFTs:', error);
    }
}

/**
 * Check backend server status
 */
async function checkBackendStatus() {
    try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
            backendStatus = true;
            updateBackendStatus('Online');
        } else {
            throw new Error('Backend not responding');
        }
    } catch (error) {
        backendStatus = false;
        updateBackendStatus('Offline');
    }
}

/**
 * Start backend server
 */
async function startBackendServer() {
    try {
        updateStatus('Starting backend server...');
        
        // Use IPC to start backend server
        const result = await ipcRenderer.invoke('start-backend-server');
        
        if (result.success) {
            updateStatus('Backend server started');
            setTimeout(checkBackendStatus, 2000);
        } else {
            updateStatus('Failed to start backend server', 'error');
        }
        
    } catch (error) {
        console.error('Failed to start backend:', error);
        updateStatus('Backend start error', 'error');
    }
}

/**
 * Update wallet status display
 */
function updateWalletStatus(status) {
    const walletStatus = document.getElementById('wallet-status');
    if (walletStatus) {
        walletStatus.textContent = `Wallet: ${status}`;
    }
}

/**
 * Update network status display
 */
function updateNetworkStatus(network) {
    const networkStatus = document.getElementById('network-status');
    if (networkStatus) {
        networkStatus.textContent = `Network: ${network}`;
    }
}

/**
 * Update backend status display
 */
function updateBackendStatus(status) {
    const backendStatusEl = document.getElementById('backend-status');
    if (backendStatusEl) {
        backendStatusEl.textContent = status;
        backendStatusEl.className = `status-indicator ${status.toLowerCase() === 'online' ? 'online' : 'offline'}`;
    }
    
    const processorStatus = document.getElementById('processor-status');
    if (processorStatus) {
        processorStatus.textContent = `Backend Server: ${status}`;
    }
}

// Make functions globally available
window.switchTab = switchTab;
window.useModel = useModel;
window.deleteModel = deleteModel;