// Creator AI JavaScript

// Authentication credentials
const VALID_CREDENTIALS = {
    email: "hanhlehangelcosmetic@gmail.com",
    password: "Kimhanh99@"
};

// Global state
let currentUser = null;
let uploadedPhotos = [];
let uploadedVideo = null;
let generatedAvatars = [];
let selectedAvatar = null;
let isTrainingComplete = false;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('creatorai_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLogin();
    }
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.section));
    });

    // Option tabs
    document.querySelectorAll('.option-tab').forEach(btn => {
        btn.addEventListener('click', (e) => switchOptionTab(e.target));
    });

    // Photo upload section
    setupPhotoUpload();
    setupVideoUpload();
    setupPhotoWorkflow();
    setupVideoWorkflow();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
        currentUser = { email: email, loginTime: new Date().toISOString() };
        localStorage.setItem('creatorai_user', JSON.stringify(currentUser));
        loginError.style.display = 'none';
        showDashboard();
    } else {
        loginError.style.display = 'block';
        loginError.textContent = 'Email hoặc mật khẩu không đúng!';
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('creatorai_user');
    resetAppState();
    showLogin();
}

function showLogin() {
    loginScreen.classList.add('active');
    dashboardScreen.classList.remove('active');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function showDashboard() {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    userEmail.textContent = currentUser.email;
}

function switchTab(section) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');
}

function switchOptionTab(clickedTab) {
    const container = clickedTab.closest('.step-card');
    const optionTabs = container.querySelectorAll('.option-tab');
    const optionContents = container.querySelectorAll('.option-content');

    // Remove active class from all tabs and contents
    optionTabs.forEach(tab => tab.classList.remove('active'));
    optionContents.forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab
    clickedTab.classList.add('active');

    // Show corresponding content
    const option = clickedTab.dataset.option;
    const targetContent = container.querySelector(`#${option}Option`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

function setupPhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    const trainBtn = document.getElementById('trainBtn');

    // Click to upload
    photoUpload.addEventListener('click', () => photoInput.click());

    // File input change
    photoInput.addEventListener('change', (e) => {
        handlePhotoFiles(e.target.files);
    });

    // Drag and drop
    photoUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoUpload.classList.add('dragover');
    });

    photoUpload.addEventListener('dragleave', () => {
        photoUpload.classList.remove('dragover');
    });

    photoUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        photoUpload.classList.remove('dragover');
        handlePhotoFiles(e.dataTransfer.files);
    });

    // Train button
    trainBtn.addEventListener('click', startTraining);
}

function handlePhotoFiles(files) {
    const maxFiles = 10;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    // Filter valid files
    const validFiles = Array.from(files).filter(file => {
        return allowedTypes.includes(file.type) && uploadedPhotos.length < maxFiles;
    });

    if (validFiles.length === 0) {
        alert('Vui lòng chọn file ảnh hợp lệ (JPG/PNG) và không vượt quá 10 ảnh.');
        return;
    }

    // Add files to uploaded photos
    validFiles.forEach(file => {
        if (uploadedPhotos.length < maxFiles) {
            uploadedPhotos.push(file);
        }
    });

    updatePhotoPreview();
    updateTrainButton();
}

function updatePhotoPreview() {
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML = '';

    uploadedPhotos.forEach((file, index) => {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = `Preview ${index + 1}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removePhoto(index);
        
        preview.appendChild(img);
        preview.appendChild(removeBtn);
        photoPreview.appendChild(preview);
    });
}

function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    updatePhotoPreview();
    updateTrainButton();
}

function updateTrainButton() {
    const trainBtn = document.getElementById('trainBtn');
    trainBtn.disabled = uploadedPhotos.length === 0;
}

function startTraining() {
    const trainBtn = document.getElementById('trainBtn');
    const trainingProgress = document.getElementById('trainingProgress');
    
    trainBtn.disabled = true;
    trainingProgress.style.display = 'block';
    
    // Simulate training process
    setTimeout(() => {
        trainingProgress.style.display = 'none';
        isTrainingComplete = true;
        updateGenerateButton();
        showSuccessMessage('Đào tạo hoàn thành! Bây giờ bạn có thể tạo avatar.');
    }, 3000);
}

function setupPhotoWorkflow() {
    const generateBtn = document.getElementById('generateBtn');
    const addMotionBtn = document.getElementById('addMotionBtn');
    const upscaleBtn = document.getElementById('upscaleBtn');
    const createVideoBtn = document.getElementById('createVideoBtn');
    const motionDuration = document.getElementById('motionDuration');
    const durationValue = document.getElementById('durationValue');

    generateBtn.addEventListener('click', generateAvatars);
    addMotionBtn.addEventListener('click', addMotionToAvatar);
    upscaleBtn.addEventListener('click', upscaleAvatar);
    createVideoBtn.addEventListener('click', createVideo);

    motionDuration.addEventListener('input', (e) => {
        durationValue.textContent = e.target.value;
    });
}

function updateGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = !isTrainingComplete;
}

function generateAvatars() {
    const textPrompt = document.getElementById('textPrompt').value;
    if (!textPrompt.trim()) {
        alert('Vui lòng nhập lời nhắc văn bản để tạo avatar.');
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    const avatarResults = document.getElementById('avatarResults');
    
    generateBtn.disabled = true;
    avatarResults.innerHTML = '<div class="spinner"></div>';
    
    // Simulate avatar generation
    setTimeout(() => {
        avatarResults.innerHTML = '';
        generatedAvatars = [];
        
        // Create 4 placeholder avatars
        for (let i = 0; i < 4; i++) {
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item';
            avatarItem.onclick = () => selectAvatar(i);
            
            const img = document.createElement('img');
            img.src = `https://picsum.photos/400/400?random=${Date.now() + i}`;
            img.alt = `Avatar ${i + 1}`;
            
            const label = document.createElement('div');
            label.className = 'ai-label';
            label.textContent = 'AI Photo';
            
            avatarItem.appendChild(img);
            avatarItem.appendChild(label);
            avatarResults.appendChild(avatarItem);
            
            generatedAvatars.push({
                id: i,
                src: img.src,
                prompt: textPrompt
            });
        }
        
        generateBtn.disabled = false;
        showSuccessMessage('Đã tạo 4 avatar thành công!');
    }, 2000);
}

function selectAvatar(avatarId) {
    // Remove previous selection
    document.querySelectorAll('.avatar-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Select new avatar
    event.currentTarget.classList.add('selected');
    selectedAvatar = generatedAvatars[avatarId];
    
    // Update selected avatar display
    const selectedAvatarDiv = document.getElementById('selectedAvatar');
    selectedAvatarDiv.innerHTML = `
        <img src="${selectedAvatar.src}" alt="Selected Avatar" style="max-width: 200px; border-radius: 10px;">
    `;
    
    // Enable motion button
    document.getElementById('addMotionBtn').disabled = false;
}

function addMotionToAvatar() {
    if (!selectedAvatar) return;
    
    const addMotionBtn = document.getElementById('addMotionBtn');
    const duration = document.getElementById('motionDuration').value;
    
    addMotionBtn.disabled = true;
    addMotionBtn.innerHTML = '🎬 Đang xử lý...';
    
    // Simulate motion addition
    setTimeout(() => {
        addMotionBtn.innerHTML = '✅ Hoàn thành';
        document.getElementById('upscaleBtn').disabled = false;
        showSuccessMessage(`Đã thêm chuyển động ${duration} giây thành công!`);
    }, 2000);
}

function upscaleAvatar() {
    const upscaleBtn = document.getElementById('upscaleBtn');
    const upscaleProgress = document.getElementById('upscaleProgress');
    
    upscaleBtn.disabled = true;
    upscaleProgress.style.display = 'block';
    
    setTimeout(() => {
        upscaleProgress.style.display = 'none';
        upscaleBtn.innerHTML = '✅ Nâng cấp hoàn thành';
        document.getElementById('createVideoBtn').disabled = false;
        showSuccessMessage('Đã nâng cấp lên 4K thành công!');
    }, 3000);
}

function createVideo() {
    const createVideoBtn = document.getElementById('createVideoBtn');
    const videoResult = document.getElementById('videoResult');
    
    createVideoBtn.disabled = true;
    createVideoBtn.innerHTML = '🎥 Đang tạo video...';
    
    setTimeout(() => {
        videoResult.innerHTML = `
            <video controls width="100%" style="max-width: 600px;">
                <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4">
                Trình duyệt của bạn không hỗ trợ video.
            </video>
            <br>
            <a href="#" class="download-btn">📥 Tải xuống Video</a>
        `;
        
        createVideoBtn.innerHTML = '✅ Video hoàn thành';
        showSuccessMessage('Video 1080p đã được tạo thành công!');
    }, 4000);
}

function setupVideoUpload() {
    const videoUpload = document.getElementById('videoUpload');
    const videoInput = document.getElementById('videoInput');
    const videoPreview = document.getElementById('videoPreview');

    videoUpload.addEventListener('click', () => videoInput.click());

    videoInput.addEventListener('change', (e) => {
        handleVideoFile(e.target.files[0]);
    });

    videoUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        videoUpload.classList.add('dragover');
    });

    videoUpload.addEventListener('dragleave', () => {
        videoUpload.classList.remove('dragover');
    });

    videoUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        videoUpload.classList.remove('dragover');
        handleVideoFile(e.dataTransfer.files[0]);
    });
}

function handleVideoFile(file) {
    if (!file) return;
    
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
    
    if (!allowedTypes.includes(file.type)) {
        alert('Vui lòng chọn file video hợp lệ (MP4/MOV/AVI).');
        return;
    }

    uploadedVideo = file;
    updateVideoPreview();
    updateProcessVideoButton();
}

function updateVideoPreview() {
    const videoPreview = document.getElementById('videoPreview');
    
    if (uploadedVideo) {
        const video = document.createElement('video');
        video.controls = true;
        video.src = URL.createObjectURL(uploadedVideo);
        video.style.maxWidth = '100%';
        video.style.maxHeight = '300px';
        video.style.borderRadius = '10px';
        
        videoPreview.innerHTML = '';
        videoPreview.appendChild(video);
    }
}

function updateProcessVideoButton() {
    const processVideoBtn = document.getElementById('processVideoBtn');
    processVideoBtn.disabled = !uploadedVideo;
}

function setupVideoWorkflow() {
    const processVideoBtn = document.getElementById('processVideoBtn');
    const createVideoContentBtn = document.getElementById('createVideoContentBtn');
    
    processVideoBtn.addEventListener('click', processVideo);
    createVideoContentBtn.addEventListener('click', createVideoContent);
}

function processVideo() {
    const processVideoBtn = document.getElementById('processVideoBtn');
    const videoProcessProgress = document.getElementById('videoProcessProgress');
    
    processVideoBtn.disabled = true;
    videoProcessProgress.style.display = 'block';
    
    setTimeout(() => {
        videoProcessProgress.style.display = 'none';
        processVideoBtn.innerHTML = '✅ Xử lý hoàn thành';
        document.getElementById('createVideoContentBtn').disabled = false;
        showSuccessMessage('Video avatar đã được xử lý thành công!');
    }, 3000);
}

function createVideoContent() {
    const createVideoContentBtn = document.getElementById('createVideoContentBtn');
    const videoContentResult = document.getElementById('videoContentResult');
    
    createVideoContentBtn.disabled = true;
    createVideoContentBtn.innerHTML = '🎥 Đang tạo video...';
    
    setTimeout(() => {
        videoContentResult.innerHTML = `
            <video controls width="100%" style="max-width: 600px;">
                <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4">
                Trình duyệt của bạn không hỗ trợ video.
            </video>
            <br>
            <a href="#" class="download-btn">📥 Tải xuống Video</a>
        `;
        
        createVideoContentBtn.innerHTML = '✅ Video hoàn thành';
        showSuccessMessage('Video 1080p đã được tạo thành công!');
    }, 4000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Find the current active step card
    const activeSection = document.querySelector('.content-section.active');
    const stepCards = activeSection.querySelectorAll('.step-card');
    
    // Add to the last step card temporarily
    if (stepCards.length > 0) {
        const lastCard = stepCards[stepCards.length - 1];
        lastCard.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

function resetAppState() {
    uploadedPhotos = [];
    uploadedVideo = null;
    generatedAvatars = [];
    selectedAvatar = null;
    isTrainingComplete = false;
    
    // Reset UI elements
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('videoPreview').innerHTML = '';
    document.getElementById('avatarResults').innerHTML = '';
    document.getElementById('selectedAvatar').innerHTML = '';
    document.getElementById('videoResult').innerHTML = '';
    document.getElementById('videoContentResult').innerHTML = '';
    
    // Reset buttons
    document.getElementById('trainBtn').disabled = true;
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('addMotionBtn').disabled = true;
    document.getElementById('upscaleBtn').disabled = true;
    document.getElementById('createVideoBtn').disabled = true;
    document.getElementById('processVideoBtn').disabled = true;
    document.getElementById('createVideoContentBtn').disabled = true;
    
    // Reset forms
    document.getElementById('textPrompt').value = '';
    document.getElementById('motionDuration').value = 5;
    document.getElementById('durationValue').textContent = '5';
    
    // Reset to photo section
    switchTab('photo');
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    alert('Đã xảy ra lỗi. Vui lòng thử lại hoặc làm mới trang.');
});

// Prevent page reload on form submission
document.addEventListener('submit', function(e) {
    e.preventDefault();
});