/*
 * Creator AI - Multi-Chain NFT Platform Renderer Process
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

// Creator AI NFT Platform Renderer Process
const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const { BlockchainManager } = require('./blockchain');

// Initialize application store
const store = new Store();

// Initialize blockchain manager
const blockchainManager = new BlockchainManager();

// Application state
let currentProject = null;
let loadedModels = [];
let isTraining = false;
let isGenerating = false;
let isMinting = false;
let selectedFile = null;
let nftAttributes = [];

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const statusElement = document.getElementById('status');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadSettings();
    checkSystemStatus();
    loadModels();
    updateNetworkSelector();
});

function initializeApp() {
    console.log('Creator AI NFT Platform initialized');
    updateStatus('Ready');
    
    // Load recent projects
    const recentProjects = store.get('recentProjects', []);
    updateRecentProjects(recentProjects);
    
    // Set default tab
    switchTab('nft-mint');
}

function setupEventListeners() {
    // Navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Network selection
    document.getElementById('network-selector').addEventListener('change', handleNetworkChange);
    
    // Wallet connection
    document.getElementById('connect-wallet').addEventListener('click', showWalletModal);
    document.getElementById('disconnect-wallet').addEventListener('click', disconnectWallet);

    // NFT minting form
    const nftForm = document.getElementById('nft-mint-form');
    nftForm.addEventListener('submit', handleNftMint);
    
    // File upload
    document.getElementById('nft-image').addEventListener('change', handleFileUpload);
    
    // Attribute management
    document.getElementById('add-attribute').addEventListener('click', addAttributeField);
    
    // Fee estimation
    document.getElementById('estimate-fees').addEventListener('click', estimateMintingFees);
    
    // Collection checkbox for Solana
    document.getElementById('use-collection').addEventListener('change', toggleCollectionField);

    // AI generation form
    const generationForm = document.getElementById('generation-form');
    generationForm.addEventListener('submit', handleGenerationSubmit);

    // Library actions
    document.getElementById('import-model').addEventListener('click', importModel);
    document.getElementById('refresh-library').addEventListener('click', loadModels);

    // Settings
    document.getElementById('use-testnet').addEventListener('change', handleTestnetToggle);

    // Modal events
    document.getElementById('wallet-modal').addEventListener('click', handleModalClick);
    document.querySelector('.close-modal').addEventListener('click', hideWalletModal);
    
    // Wallet option selection
    document.querySelectorAll('.wallet-option').forEach(option => {
        option.addEventListener('click', handleWalletSelection);
    });

    // Menu event listeners
    ipcRenderer.on('menu-new-project', handleNewProject);
    ipcRenderer.on('menu-train-model', () => switchTab('ai-generate'));
    ipcRenderer.on('menu-load-model', importModel);
    ipcRenderer.on('menu-model-manager', () => switchTab('library'));
    ipcRenderer.on('menu-generate-video', () => switchTab('ai-generate'));
    ipcRenderer.on('menu-batch-generate', handleBatchGenerate);
    ipcRenderer.on('menu-help', showUserGuide);
}

// Tab switching
function switchTab(tabId) {
    // Update nav buttons
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update tab content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });

    // Update status based on active tab
    const tabTitles = {
        'nft-mint': 'NFT Minting',
        'ai-generate': 'AI Generation',
        'library': 'Model Library',
        'settings': 'Settings'
    };
    updateStatus(`${tabTitles[tabId]} - Ready`);
}

// Status management
function updateStatus(message, type = 'info') {
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = type === 'error' ? 'text-error' : 
                                   type === 'warning' ? 'text-warning' :
                                   type === 'success' ? 'text-success' : '';
    }
}

// Network Management
function updateNetworkSelector() {
    const selector = document.getElementById('network-selector');
    const networks = blockchainManager.getAvailableNetworks();
    
    selector.innerHTML = '<option value="">Select Network</option>';
    networks.forEach(network => {
        const option = document.createElement('option');
        option.value = network.id;
        option.textContent = `${network.name} (${network.currency})`;
        selector.appendChild(option);
    });
}

async function handleNetworkChange(event) {
    const networkType = event.target.value;
    if (!networkType) return;

    const useTestnet = document.getElementById('use-testnet').checked;
    
    try {
        updateStatus('Switching network...', 'warning');
        const result = await blockchainManager.switchNetwork(networkType, useTestnet);
        
        if (result.success) {
            updateStatus(`Connected to ${result.network.name}`, 'success');
            updateNetworkStatus(result.network);
            showNetworkFields(networkType);
            updateGasFees();
        } else {
            updateStatus(`Network switch failed: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Network error: ${error.message}`, 'error');
    }
}

function updateNetworkStatus(network) {
    const currentNetworkEl = document.getElementById('current-network');
    const connectionStatusEl = document.getElementById('connection-status');
    
    if (currentNetworkEl) {
        currentNetworkEl.textContent = network.connected ? 
            `${network.name} (Connected)` : 
            `${network.name} (Not Connected)`;
    }
    
    if (connectionStatusEl) {
        connectionStatusEl.style.color = network.connected ? '#4ade80' : '#fbbf24';
    }
}

function showNetworkFields(networkType) {
    const ethereumFields = document.getElementById('ethereum-fields');
    const solanaFields = document.getElementById('solana-fields');
    
    ethereumFields.classList.toggle('hidden', networkType !== 'ethereum');
    solanaFields.classList.toggle('hidden', networkType !== 'solana');
}

async function updateGasFees() {
    try {
        const fees = await blockchainManager.getNetworkGasFees();
        const gasFeesEl = document.getElementById('gas-fees');
        
        if (fees && gasFeesEl) {
            const currentNetwork = blockchainManager.currentNetwork;
            
            if (currentNetwork === 'ethereum') {
                gasFeesEl.textContent = `Gas: ${fees.gasPrice} Gwei`;
            } else if (currentNetwork === 'solana') {
                gasFeesEl.textContent = `Fee: ${fees.lamportsPerSignature} lamports`;
            }
        }
    } catch (error) {
        console.error('Failed to update gas fees:', error);
    }
}

// Wallet Management
function showWalletModal() {
    const modal = document.getElementById('wallet-modal');
    modal.classList.remove('hidden');
}

function hideWalletModal() {
    const modal = document.getElementById('wallet-modal');
    modal.classList.add('hidden');
}

function handleModalClick(event) {
    if (event.target.id === 'wallet-modal') {
        hideWalletModal();
    }
}

async function handleWalletSelection(event) {
    const walletType = event.currentTarget.getAttribute('data-wallet');
    const currentNetwork = blockchainManager.currentNetwork;
    
    if (!currentNetwork) {
        updateStatus('Please select a network first', 'warning');
        return;
    }
    
    if ((walletType === 'metamask' && currentNetwork !== 'ethereum') ||
        (walletType === 'phantom' && currentNetwork !== 'solana')) {
        updateStatus('Wallet not compatible with selected network', 'warning');
        return;
    }
    
    try {
        updateStatus('Connecting wallet...', 'warning');
        const result = await blockchainManager.connectWallet(walletType);
        
        if (result.success) {
            updateStatus(`${result.wallet} connected`, 'success');
            updateWalletUI(result.address, result.wallet);
            hideWalletModal();
            document.getElementById('mint-nft').disabled = false;
        } else {
            updateStatus(`Connection failed: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Wallet error: ${error.message}`, 'error');
    }
}

async function disconnectWallet() {
    try {
        const result = await blockchainManager.disconnectWallet();
        if (result.success) {
            updateStatus('Wallet disconnected', 'info');
            updateWalletUI(null, null);
            document.getElementById('mint-nft').disabled = true;
        }
    } catch (error) {
        updateStatus(`Disconnect failed: ${error.message}`, 'error');
    }
}

function updateWalletUI(address, walletName) {
    const connectBtn = document.getElementById('connect-wallet');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddressEl = document.getElementById('wallet-address');
    
    if (address) {
        connectBtn.classList.add('hidden');
        walletInfo.classList.remove('hidden');
        walletAddressEl.textContent = `${walletName}: ${address.slice(0, 6)}...${address.slice(-4)}`;
    } else {
        connectBtn.classList.remove('hidden');
        walletInfo.classList.add('hidden');
        walletAddressEl.textContent = '';
    }
}

// NFT Minting
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    selectedFile = file;
    
    // Create preview
    const preview = document.getElementById('upload-preview');
    const nftPreview = document.getElementById('nft-preview');
    
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        
        preview.innerHTML = '';
        preview.appendChild(img);
        
        nftPreview.innerHTML = '';
        nftPreview.appendChild(img.cloneNode());
    } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.onload = () => URL.revokeObjectURL(video.src);
        
        preview.innerHTML = '';
        preview.appendChild(video);
        
        nftPreview.innerHTML = '';
        nftPreview.appendChild(video.cloneNode());
    }
    
    updateNftPreview();
}

function addAttributeField() {
    const container = document.getElementById('attributes-container');
    const attributePair = document.createElement('div');
    attributePair.className = 'attribute-pair';
    
    attributePair.innerHTML = `
        <input type="text" placeholder="Trait type" class="trait-type">
        <input type="text" placeholder="Value" class="trait-value">
        <button type="button" class="remove-attr" onclick="removeAttributeField(this)">×</button>
    `;
    
    container.appendChild(attributePair);
}

function removeAttributeField(button) {
    button.parentElement.remove();
}

function toggleCollectionField() {
    const useCollection = document.getElementById('use-collection').checked;
    const collectionField = document.getElementById('collection-field');
    collectionField.style.display = useCollection ? 'block' : 'none';
}

function updateNftPreview() {
    const name = document.getElementById('nft-name').value;
    const description = document.getElementById('nft-description').value;
    
    // Update preview info (could be expanded)
    if (name || description) {
        updateStatus('NFT preview updated', 'info');
    }
}

async function estimateMintingFees() {
    if (!blockchainManager.isWalletConnected()) {
        updateStatus('Please connect wallet first', 'warning');
        return;
    }
    
    try {
        updateStatus('Estimating fees...', 'info');
        const fees = await blockchainManager.getNetworkGasFees();
        
        if (fees) {
            const currentNetwork = blockchainManager.currentNetwork;
            let estimate = '';
            
            if (currentNetwork === 'ethereum') {
                // Rough estimate for NFT minting (100,000 gas * current gas price)
                const gasEstimate = parseFloat(fees.gasPrice) * 100;
                estimate = `Estimated gas fee: ~${gasEstimate.toFixed(4)} ETH`;
            } else if (currentNetwork === 'solana') {
                const solFees = fees.lamportsPerSignature / 1000000000; // Convert to SOL
                estimate = `Estimated fee: ~${solFees.toFixed(6)} SOL`;
            }
            
            updateMintStatus(`Fee Estimation: ${estimate}`);
        }
    } catch (error) {
        updateStatus(`Fee estimation failed: ${error.message}`, 'error');
    }
}

async function handleNftMint(event) {
    event.preventDefault();
    
    if (isMinting) {
        updateStatus('Minting already in progress', 'warning');
        return;
    }
    
    if (!blockchainManager.isWalletConnected()) {
        updateStatus('Please connect wallet first', 'warning');
        return;
    }
    
    if (!selectedFile) {
        updateStatus('Please select an image or video file', 'warning');
        return;
    }
    
    const nftData = collectNftData();
    if (!nftData) return;
    
    try {
        isMinting = true;
        document.getElementById('mint-nft').disabled = true;
        updateStatus('Minting NFT...', 'warning');
        updateMintStatus('Preparing metadata...');
        
        // Simulate metadata upload (in real implementation, upload to IPFS)
        const metadataUri = await uploadMetadata(nftData);
        updateMintStatus('Metadata uploaded. Minting on blockchain...');
        
        // Mint NFT
        const contractAddress = document.getElementById('contract-address').value || null;
        const result = await blockchainManager.mintNFT(contractAddress, { uri: metadataUri });
        
        if (result.success) {
            updateStatus('NFT minted successfully!', 'success');
            updateMintStatus(`Minted! Transaction: ${result.transactionHash || result.transactionSignature}`);
        } else {
            updateStatus(`Minting failed: ${result.error}`, 'error');
            updateMintStatus(`Minting failed: ${result.error}`);
        }
    } catch (error) {
        updateStatus(`Minting error: ${error.message}`, 'error');
        updateMintStatus(`Error: ${error.message}`);
    } finally {
        isMinting = false;
        document.getElementById('mint-nft').disabled = false;
    }
}

function collectNftData() {
    const name = document.getElementById('nft-name').value;
    const description = document.getElementById('nft-description').value;
    
    if (!name || !description) {
        updateStatus('Please fill in NFT name and description', 'warning');
        return null;
    }
    
    // Collect attributes
    const attributes = [];
    const attributePairs = document.querySelectorAll('.attribute-pair');
    
    attributePairs.forEach(pair => {
        const traitType = pair.querySelector('.trait-type').value;
        const value = pair.querySelector('.trait-value').value;
        
        if (traitType && value) {
            attributes.push({ trait_type: traitType, value: value });
        }
    });
    
    return {
        name,
        description,
        attributes,
        file: selectedFile
    };
}

async function uploadMetadata(nftData) {
    // Mock metadata upload - in real implementation, use IPFS
    const metadata = {
        name: nftData.name,
        description: nftData.description,
        image: `ipfs://mock_image_hash_${Date.now()}`,
        attributes: nftData.attributes
    };
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `ipfs://mock_metadata_hash_${Date.now()}`;
}

function updateMintStatus(message) {
    const statusContent = document.querySelector('.mint-status .status-content');
    if (statusContent) {
        statusContent.innerHTML = `<p>${message}</p>`;
    }
}

// AI Generation (existing functionality)
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
    isGenerating = true;
    updateStatus('Generating content...', 'warning');
    
    // Mock generation process
    setTimeout(() => {
        isGenerating = false;
        updateStatus('Content generated successfully', 'success');
    }, 5000);
}

// Model management
async function loadModels() {
    try {
        const models = store.get('models', []);
        loadedModels = models;
        
        updateModelsGrid(models);
        updateModelSelect(models);
        
        const modelsCountEl = document.getElementById('models-count');
        if (modelsCountEl) {
            modelsCountEl.textContent = models.length;
        }
    } catch (error) {
        console.error('Failed to load models:', error);
        updateStatus('Failed to load models', 'error');
    }
}

function updateModelsGrid(models) {
    // Implementation for models grid update
}

function updateModelSelect(models) {
    const select = document.getElementById('selected-model');
    
    if (!select) return;
    
    if (models.length === 0) {
        select.innerHTML = '<option value="">No models available</option>';
        return;
    }

    select.innerHTML = models.map(model => 
        `<option value="${model.id}">${model.name} (${model.type})</option>`
    ).join('');
}

async function importModel() {
    // Mock model import
    updateStatus('Model import functionality would be implemented here', 'info');
}

// Settings
function handleTestnetToggle() {
    const useTestnet = document.getElementById('use-testnet').checked;
    store.set('useTestnet', useTestnet);
    updateStatus(`Testnet mode: ${useTestnet ? 'Enabled' : 'Disabled'}`, 'info');
}

function loadSettings() {
    const useTestnet = store.get('useTestnet', false);
    document.getElementById('use-testnet').checked = useTestnet;
    
    const ipfsGateway = store.get('ipfsGateway', 'https://ipfs.io/ipfs/');
    document.getElementById('ipfs-gateway').value = ipfsGateway;
}

// System status check
async function checkSystemStatus() {
    try {
        // Check GPU availability
        const gpuStatus = await checkGPUStatus();
        const gpuStatusEl = document.getElementById('gpu-status');
        if (gpuStatusEl) {
            gpuStatusEl.textContent = gpuStatus;
        }

        // Check memory
        const memoryInfo = process.memoryUsage();
        const memoryMB = Math.round(memoryInfo.heapUsed / 1024 / 1024);
        const memoryStatusEl = document.getElementById('memory-status');
        if (memoryStatusEl) {
            memoryStatusEl.textContent = `${memoryMB} MB`;
        }
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

// Project management (existing functionality)
function handleNewProject() {
    if (confirm('Create a new project? Any unsaved changes will be lost.')) {
        currentProject = null;
        updateStatus('New project created', 'success');
    }
}

function handleBatchGenerate() {
    switchTab('ai-generate');
    updateStatus('Batch generation mode', 'info');
}

function showUserGuide() {
    alert('User guide: This is the Creator AI NFT Platform. Select a network, connect your wallet, and start minting NFTs!');
}

function updateRecentProjects(projects) {
    // Implementation for recent projects update
}

// Utility functions
function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Global function for removing attributes (called from HTML)
window.removeAttributeField = removeAttributeField;

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

// Make functions globally available
window.switchTab = switchTab;
window.useModel = useModel;
window.deleteModel = deleteModel;