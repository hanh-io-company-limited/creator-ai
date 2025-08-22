// Creator AI - Complete Content Creation Platform
// All functionality implemented with local storage for offline operation

class CreatorAI {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.projects = [];
        this.mediaFiles = [];
        this.chatMessages = [];
        this.activityLog = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkAuthState();
    }

    // Data Management
    loadData() {
        try {
            this.currentUser = JSON.parse(localStorage.getItem('creatorai_user') || 'null');
            this.projects = JSON.parse(localStorage.getItem('creatorai_projects') || '[]');
            this.mediaFiles = JSON.parse(localStorage.getItem('creatorai_media') || '[]');
            this.chatMessages = JSON.parse(localStorage.getItem('creatorai_chat') || '[]');
            this.activityLog = JSON.parse(localStorage.getItem('creatorai_activity') || '[]');
        } catch (error) {
            console.error('Error loading data:', error);
            this.resetData();
        }
    }

    saveData() {
        try {
            localStorage.setItem('creatorai_user', JSON.stringify(this.currentUser));
            localStorage.setItem('creatorai_projects', JSON.stringify(this.projects));
            localStorage.setItem('creatorai_media', JSON.stringify(this.mediaFiles));
            localStorage.setItem('creatorai_chat', JSON.stringify(this.chatMessages));
            localStorage.setItem('creatorai_activity', JSON.stringify(this.activityLog));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    resetData() {
        this.currentUser = null;
        this.projects = [];
        this.mediaFiles = [];
        this.chatMessages = [];
        this.activityLog = [];
        this.saveData();
    }

    // Authentication
    checkAuthState() {
        if (this.currentUser) {
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('userEmail').textContent = this.currentUser.email;
        this.updateDashboard();
        this.renderAllSections();
    }

    login(email, password) {
        // Demo authentication
        if (email === 'demo@creatorai.com' && password === 'demo123') {
            this.currentUser = {
                email: email,
                name: 'Demo User',
                loginTime: new Date().toISOString()
            };
            this.addActivity('User logged in', 'auth');
            this.saveData();
            this.showMainApp();
            return true;
        }
        return false;
    }

    logout() {
        this.addActivity('User logged out', 'auth');
        this.currentUser = null;
        this.saveData();
        this.showLoginScreen();
    }

    // Navigation
    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        
        // Add active class to selected nav button
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        this.currentSection = sectionName;
        
        // Update section content
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'media':
                this.renderMediaLibrary();
                break;
            case 'video':
                this.renderVideoCreator();
                break;
            case 'projects':
                this.renderProjects();
                break;
            case 'chat':
                this.renderChat();
                break;
        }
    }

    // Dashboard
    updateDashboard() {
        document.getElementById('projectCount').textContent = this.projects.length;
        document.getElementById('mediaCount').textContent = this.mediaFiles.length;
        document.getElementById('videoCount').textContent = 
            this.mediaFiles.filter(file => file.type === 'video').length;
        
        this.renderRecentActivity();
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        
        if (this.activityLog.length === 0) {
            container.innerHTML = '<p class="no-activity">No recent activity</p>';
            return;
        }

        const recentActivities = this.activityLog.slice(-5).reverse();
        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div>${activity.action}</div>
                <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }

    addActivity(action, type = 'general') {
        this.activityLog.push({
            id: Date.now(),
            action: action,
            type: type,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 activities
        if (this.activityLog.length > 100) {
            this.activityLog = this.activityLog.slice(-100);
        }
        
        this.saveData();
        
        if (this.currentSection === 'dashboard') {
            this.renderRecentActivity();
        }
    }

    // Media Library
    renderMediaLibrary() {
        const container = document.getElementById('mediaGrid');
        
        if (this.mediaFiles.length === 0) {
            container.innerHTML = '<p class="no-activity">No media files uploaded</p>';
            return;
        }

        const filter = document.getElementById('mediaFilter').value;
        const filteredFiles = filter === 'all' ? this.mediaFiles : 
            this.mediaFiles.filter(file => file.type === filter);

        container.innerHTML = filteredFiles.map(file => `
            <div class="media-item" data-id="${file.id}">
                <div class="media-thumbnail">
                    ${this.getMediaThumbnail(file)}
                </div>
                <div class="media-info">
                    <div class="media-name" title="${file.name}">${file.name}</div>
                    <div class="media-type">${file.type}</div>
                    <div class="media-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
        `).join('');
    }

    getMediaThumbnail(file) {
        if (file.type === 'image' && file.dataUrl) {
            return `<img src="${file.dataUrl}" alt="${file.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        
        const icons = {
            image: '🖼️',
            video: '🎬',
            audio: '🎵'
        };
        
        return icons[file.type] || '📄';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const mediaFile = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: this.getFileType(file.type),
                    size: file.size,
                    dataUrl: e.target.result,
                    uploadDate: new Date().toISOString()
                };
                
                this.mediaFiles.push(mediaFile);
                this.addActivity(`Uploaded ${file.name}`, 'media');
                this.saveData();
                this.renderMediaLibrary();
                this.updateDashboard();
            };
            
            reader.readAsDataURL(file);
        });
    }

    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'other';
    }

    // Video Creator
    renderVideoCreator() {
        const videoTrack = document.getElementById('videoTrack');
        const audioTrack = document.getElementById('audioTrack');
        
        // Clear tracks
        videoTrack.innerHTML = '';
        audioTrack.innerHTML = '';
        
        // Add video files to video track
        const videoFiles = this.mediaFiles.filter(file => file.type === 'video');
        videoFiles.forEach((file, index) => {
            const element = document.createElement('div');
            element.className = 'timeline-item';
            element.style.cssText = `
                position: absolute;
                left: ${index * 120}px;
                width: 100px;
                height: 40px;
                background: #667eea;
                color: white;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                cursor: pointer;
                margin-top: 5px;
            `;
            element.textContent = file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name;
            element.title = file.name;
            
            videoTrack.appendChild(element);
        });
        
        // Add audio files to audio track
        const audioFiles = this.mediaFiles.filter(file => file.type === 'audio');
        audioFiles.forEach((file, index) => {
            const element = document.createElement('div');
            element.className = 'timeline-item';
            element.style.cssText = `
                position: absolute;
                left: ${index * 120}px;
                width: 100px;
                height: 40px;
                background: #28a745;
                color: white;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                cursor: pointer;
                margin-top: 5px;
            `;
            element.textContent = file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name;
            element.title = file.name;
            
            audioTrack.appendChild(element);
        });
    }

    // Project Management
    renderProjects() {
        const container = document.getElementById('projectsGrid');
        
        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="no-activity" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <p>No projects created yet</p>
                    <button class="btn-primary" onclick="app.showModal('projectModal')">Create Your First Project</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="project-card" data-id="${project.id}">
                <div class="project-header">
                    <div class="project-title">${project.name}</div>
                    <div class="project-type">${project.type}</div>
                </div>
                <div class="project-description">${project.description || 'No description'}</div>
                <div class="project-meta">
                    <span>Created: ${new Date(project.createdDate).toLocaleDateString()}</span>
                    <div class="project-actions">
                        <button onclick="app.openProject('${project.id}')" title="Open">📂</button>
                        <button onclick="app.deleteProject('${project.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createProject(projectData) {
        const project = {
            id: Date.now().toString(),
            name: projectData.name,
            description: projectData.description,
            type: projectData.type,
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            files: []
        };
        
        this.projects.push(project);
        this.addActivity(`Created project: ${project.name}`, 'project');
        this.saveData();
        this.renderProjects();
        this.updateDashboard();
        this.hideModal('projectModal');
    }

    openProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.addActivity(`Opened project: ${project.name}`, 'project');
            this.saveData();
            alert(`Opening project: ${project.name}\n\nProject Type: ${project.type}\nCreated: ${new Date(project.createdDate).toLocaleDateString()}`);
        }
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            const projectIndex = this.projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
                const project = this.projects[projectIndex];
                this.projects.splice(projectIndex, 1);
                this.addActivity(`Deleted project: ${project.name}`, 'project');
                this.saveData();
                this.renderProjects();
                this.updateDashboard();
            }
        }
    }

    // Chat/Collaboration
    renderChat() {
        const container = document.getElementById('chatMessages');
        
        if (this.chatMessages.length === 0) {
            container.innerHTML = `
                <div class="chat-message system">
                    Welcome to Creator AI Collaboration Chat! 
                    This is offline mode - messages are stored locally.
                </div>
            `;
            return;
        }

        container.innerHTML = this.chatMessages.map(message => `
            <div class="chat-message ${message.type}">
                <div>${message.content}</div>
                <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.5rem;">
                    ${new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    sendChatMessage(content) {
        if (!content.trim()) return;
        
        const message = {
            id: Date.now(),
            content: content.trim(),
            type: 'user',
            timestamp: new Date().toISOString(),
            user: this.currentUser.email
        };
        
        this.chatMessages.push(message);
        this.addActivity('Sent a chat message', 'chat');
        this.saveData();
        this.renderChat();
        
        // Clear input
        document.getElementById('chatInput').value = '';
        
        // Simulate auto-response in offline mode
        setTimeout(() => {
            this.addAutoResponse();
        }, 1000);
    }

    addAutoResponse() {
        const responses = [
            "Thanks for your message! In offline mode, this is an automated response.",
            "Your message has been received. Real-time collaboration will be available when connected.",
            "Great idea! Let's discuss this further when the team is online.",
            "I see your point. This offline mode is perfect for drafting ideas.",
            "Excellent! Your creativity is showing even in offline mode."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const autoMessage = {
            id: Date.now(),
            content: randomResponse,
            type: 'system',
            timestamp: new Date().toISOString(),
            user: 'System'
        };
        
        this.chatMessages.push(autoMessage);
        this.saveData();
        this.renderChat();
    }

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Quick Actions
    executeQuickAction(action) {
        switch(action) {
            case 'new-project':
                this.showModal('projectModal');
                break;
            case 'upload-media':
                document.getElementById('mediaFileInput').click();
                break;
            case 'create-video':
                this.switchSection('video');
                this.addActivity('Started video creation', 'video');
                break;
        }
    }

    // Render all sections initially
    renderAllSections() {
        this.renderMediaLibrary();
        this.renderVideoCreator();
        this.renderProjects();
        this.renderChat();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (this.login(email, password)) {
                // Login successful
            } else {
                alert('Invalid credentials. Use demo@creatorai.com / demo123');
            }
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchSection(btn.dataset.section);
            });
        });

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeQuickAction(btn.dataset.action);
            });
        });

        // File upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('mediaFileInput').click();
        });

        document.getElementById('mediaFileInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files);
            }
        });

        // Drag and drop
        const dropZone = document.getElementById('mediaDropZone');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        dropZone.addEventListener('click', () => {
            document.getElementById('mediaFileInput').click();
        });

        // Media filter
        document.getElementById('mediaFilter').addEventListener('change', () => {
            this.renderMediaLibrary();
        });

        // Video controls
        document.getElementById('playBtn').addEventListener('click', () => {
            const video = document.getElementById('videoPreview');
            video.play();
            this.addActivity('Played video preview', 'video');
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            const video = document.getElementById('videoPreview');
            video.pause();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            const video = document.getElementById('videoPreview');
            video.pause();
            video.currentTime = 0;
        });

        // Export video
        document.getElementById('exportVideoBtn').addEventListener('click', () => {
            this.addActivity('Exported video project', 'video');
            alert('Video export feature activated! In a full implementation, this would compile your timeline into a final video file.');
        });

        // New video project
        document.getElementById('newVideoBtn').addEventListener('click', () => {
            this.addActivity('Started new video project', 'video');
            alert('New video project started! Add media files from your library to the timeline.');
        });

        // Project management
        document.getElementById('newProjectBtn').addEventListener('click', () => {
            this.showModal('projectModal');
        });

        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.createProject({
                name: formData.get('projectName') || document.getElementById('projectName').value,
                description: formData.get('projectDescription') || document.getElementById('projectDescription').value,
                type: formData.get('projectType') || document.getElementById('projectType').value
            });
            e.target.reset();
        });

        // Chat
        document.getElementById('sendChatBtn').addEventListener('click', () => {
            const input = document.getElementById('chatInput');
            this.sendChatMessage(input.value);
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage(e.target.value);
            }
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal(btn.dataset.modal);
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchSection('media');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchSection('video');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchSection('projects');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchSection('chat');
                        break;
                }
            }
        });
    }
}

// Initialize the application
const app = new CreatorAI();

// Add some demo data for better presentation
if (app.currentUser && app.projects.length === 0) {
    // Add demo projects
    app.projects = [
        {
            id: 'demo-1',
            name: 'Welcome Video Project',
            description: 'A sample video project to demonstrate the video creator functionality',
            type: 'video',
            createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            files: []
        },
        {
            id: 'demo-2',
            name: 'Podcast Episode 1',
            description: 'Audio project for the first episode of our podcast series',
            type: 'audio',
            createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            files: []
        }
    ];

    // Add demo activity
    app.activityLog = [
        {
            id: 1,
            action: 'Created demo projects',
            type: 'project',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            action: 'Updated podcast project',
            type: 'project',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            action: 'Explored video creator',
            type: 'video',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Add demo chat messages
    app.chatMessages = [
        {
            id: 1,
            content: 'Welcome to Creator AI! This offline chat lets you draft ideas and collaborate asynchronously.',
            type: 'system',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user: 'System'
        },
        {
            id: 2,
            content: 'This is amazing! I love how everything works offline.',
            type: 'user',
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            user: 'demo@creatorai.com'
        },
        {
            id: 3,
            content: 'Great to hear! The offline functionality ensures you can work anywhere, anytime.',
            type: 'system',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            user: 'System'
        }
    ];

    app.saveData();
}

// Export for debugging
window.app = app;