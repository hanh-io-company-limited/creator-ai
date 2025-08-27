// Creator AI Renderer Process
const { ipcRenderer } = require('electron');
const Store = require('electron-store');

// Initialize application store
const store = new Store();

// Application state
let currentProject = null;
let loadedModels = [];
let isTraining = false;
let isGenerating = false;

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
});

function initializeApp() {
    console.log('Creator AI của Hanh IO đã được khởi tạo');
    updateStatus('Sẵn sàng');
    
    // Load recent projects
    const recentProjects = store.get('recentProjects', []);
    updateRecentProjects(recentProjects);
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
        // Tích hợp với hệ thống AI Hanh IO
        // Hiện tại trả về giá trị mặc định
        return 'Có sẵn';
    } catch (error) {
        return 'Không có sẵn';
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
        updateStatus('Không thể tải mô hình', 'error');
    }
}

function updateModelsGrid(models) {
    const grid = document.getElementById('models-grid');
    
    if (models.length === 0) {
        grid.innerHTML = '<p>Không có mô hình nào. Nhập hoặc huấn luyện mô hình để bắt đầu.</p>';
        return;
    }

    grid.innerHTML = models.map(model => `
        <div class="model-card">
            <h4>${model.name}</h4>
            <div class="model-info">
                Loại: ${model.type}<br>
                Kích thước: ${model.size || 'Không rõ'}<br>
                Tạo: ${new Date(model.created).toLocaleDateString()}
            </div>
            <div class="model-actions">
                <button class="use-model" onclick="useModel('${model.id}')">Sử dụng</button>
                <button class="delete-model" onclick="deleteModel('${model.id}')">Xóa</button>
            </div>
        </div>
    `).join('');
}

function updateModelSelect(models) {
    const select = document.getElementById('selected-model');
    
    if (models.length === 0) {
        select.innerHTML = '<option value="">Không có mô hình nào</option>';
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
        updateStatus('Quá trình huấn luyện đang diễn ra', 'warning');
        return;
    }

    const formData = new FormData(event.target);
    const trainingConfig = {
        name: document.getElementById('model-name').value,
        type: document.getElementById('model-type').value,
        epochs: parseInt(document.getElementById('epochs').value),
        dataPath: document.getElementById('data-path').textContent
    };

    if (!trainingConfig.name || trainingConfig.dataPath === 'Chưa chọn dữ liệu') {
        updateStatus('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
    }

    startTraining(trainingConfig);
}

async function startTraining(config) {
    try {
        isTraining = true;
        updateStatus('Bắt đầu huấn luyện', 'info');
        
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
        updateStatus('Mô hình đã được huấn luyện thành công', 'success');
        
    } catch (error) {
        console.error('Training failed:', error);
        updateStatus('Huấn luyện thất bại', 'error');
    } finally {
        isTraining = false;
        document.getElementById('training-progress').style.display = 'none';
    }
}

// Generation functionality
async function handleGenerationSubmit(event) {
    event.preventDefault();
    
    if (isGenerating) {
        updateStatus('Quá trình tạo video đang diễn ra', 'warning');
        return;
    }

    const modelId = document.getElementById('selected-model').value;
    const prompt = document.getElementById('prompt').value;
    const duration = parseInt(document.getElementById('duration').value);
    const resolution = document.getElementById('resolution').value;

    if (!modelId || !prompt) {
        updateStatus('Vui lòng chọn mô hình và nhập mô tả', 'error');
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

        // Hiển thị xem trước video (giữ chỗ)
        document.getElementById('generation-progress').style.display = 'none';
        document.getElementById('video-preview').style.display = 'block';
        
        // Đặt nguồn video giữ chỗ
        const video = document.getElementById('preview-video');
        video.src = ''; // Sẽ là đường dẫn video đã tạo
        
        updateStatus('Tạo video thành công', 'success');
        
    } catch (error) {
        console.error('Generation failed:', error);
        updateStatus('Tạo video thất bại', 'error');
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
    // Triển khai sẽ sử dụng hộp thoại để chọn thư mục
    document.getElementById('output-dir-path').textContent = 'Đường dẫn thư mục đã chọn';
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
            updateStatus('Nhập mô hình thành công', 'success');
        }
    } catch (error) {
        console.error('Failed to import model:', error);
        updateStatus('Không thể nhập mô hình', 'error');
    }
}

async function saveGeneratedVideo() {
    try {
        const result = await ipcRenderer.invoke('save-file', null, 'generated_video.mp4');
        if (result.success) {
            updateStatus('Lưu video thành công', 'success');
        }
    } catch (error) {
        console.error('Failed to save video:', error);
        updateStatus('Không thể lưu video', 'error');
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
        updateStatus('Đã xóa mô hình', 'success');
    }
}

// Project management
function handleNewProject() {
    if (confirm('Tạo dự án mới? Mọi thay đổi chưa lưu sẽ bị mất.')) {
        currentProject = null;
        updateStatus('Đã tạo dự án mới', 'success');
    }
}

function handleOpenProject(event, projectPath) {
    // Implementation for opening existing project
    currentProject = projectPath;
    updateStatus(`Đã mở dự án: ${projectPath}`, 'success');
}

function handleSaveProject() {
    // Implementation for saving current project
    updateStatus('Đã lưu dự án', 'success');
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
        list.innerHTML = '<li>Chưa có dự án gần đây</li>';
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