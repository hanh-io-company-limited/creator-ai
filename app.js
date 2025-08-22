// Creator AI JavaScript - Content Generation and Download Functionality

class CreatorAI {
    constructor() {
        this.generatedContent = {};
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Avatar generation
        document.getElementById('generate-avatar').addEventListener('click', () => {
            this.generateContent('avatar');
        });
        document.getElementById('download-avatar').addEventListener('click', () => {
            this.downloadContent('avatar');
        });

        // Video generation
        document.getElementById('generate-video').addEventListener('click', () => {
            this.generateContent('video');
        });
        document.getElementById('download-video').addEventListener('click', () => {
            this.downloadContent('video');
        });

        // Image generation
        document.getElementById('generate-image').addEventListener('click', () => {
            this.generateContent('image');
        });
        document.getElementById('download-image').addEventListener('click', () => {
            this.downloadContent('image');
        });
    }

    async generateContent(type) {
        const displayElement = document.getElementById(`${type}-display`);
        const downloadButton = document.getElementById(`download-${type}`);
        const generateButton = document.getElementById(`generate-${type}`);

        // Show loading state
        displayElement.innerHTML = '<div class="loading"></div><p>Generating ' + type + '...</p>';
        generateButton.disabled = true;
        downloadButton.style.display = 'none';

        // Simulate AI generation delay
        await this.delay(2000);

        try {
            let content;
            let filename;

            switch (type) {
                case 'avatar':
                case 'image':
                    content = await this.generatePlaceholderImage();
                    filename = `${type}_${Date.now()}.png`;
                    break;
                case 'video':
                    content = await this.generatePlaceholderVideo();
                    filename = `video_${Date.now()}.webm`;
                    break;
            }

            // Store generated content
            this.generatedContent[type] = {
                blob: content,
                filename: filename
            };

            // Display the generated content
            this.displayContent(type, content);

            // Show download button
            downloadButton.style.display = 'inline-block';

        } catch (error) {
            displayElement.innerHTML = '<p style="color: red;">Error generating content. Please try again.</p>';
            console.error('Generation error:', error);
        } finally {
            generateButton.disabled = false;
        }
    }

    async generatePlaceholderImage() {
        // Create a canvas with a placeholder image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // Add some shapes to make it look AI-generated
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 400;
            const y = Math.random() * 400;
            const radius = Math.random() * 50 + 10;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AI Generated', 200, 180);
        ctx.fillText('Content', 200, 220);

        // Convert canvas to blob
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    async generatePlaceholderVideo() {
        // Create a simple video using Canvas and MediaRecorder API
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm' // Use webm for better browser support
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
            };

            mediaRecorder.start();

            // Generate 3 seconds of video content
            let frame = 0;
            const animationInterval = setInterval(() => {
                // Clear canvas
                ctx.clearRect(0, 0, 640, 480);

                // Animated background
                const gradient = ctx.createLinearGradient(0, 0, 640, 480);
                gradient.addColorStop(0, `hsl(${frame % 360}, 70%, 50%)`);
                gradient.addColorStop(1, `hsl(${(frame + 180) % 360}, 70%, 30%)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 640, 480);

                // Animated circles
                for (let i = 0; i < 5; i++) {
                    const x = 320 + Math.sin((frame + i * 60) * 0.02) * 200;
                    const y = 240 + Math.cos((frame + i * 60) * 0.02) * 150;
                    const radius = 30 + Math.sin((frame + i * 30) * 0.05) * 20;

                    ctx.fillStyle = `rgba(255, 255, 255, 0.${3 + i})`;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }

                // Text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('AI Generated Video', 320, 240);

                frame++;

                if (frame >= 90) { // 3 seconds at 30fps
                    clearInterval(animationInterval);
                    mediaRecorder.stop();
                }
            }, 1000 / 30); // 30 FPS
        });
    }

    displayContent(type, blob) {
        const displayElement = document.getElementById(`${type}-display`);
        const url = URL.createObjectURL(blob);

        if (type === 'video') {
            displayElement.innerHTML = `
                <video controls autoplay muted style="max-width: 100%; max-height: 200px;">
                    <source src="${url}" type="video/webm">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            displayElement.innerHTML = `
                <img src="${url}" alt="Generated ${type}" style="max-width: 100%; max-height: 200px;">
            `;
        }
    }

    downloadContent(type) {
        const content = this.generatedContent[type];
        if (!content) {
            alert('No content to download. Please generate content first.');
            return;
        }

        try {
            this.triggerDownload(content.blob, content.filename);
            
            // Show success message
            this.showNotification(`${type} downloaded successfully!`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Download failed. Please try again.', 'error');
        }
    }

    triggerDownload(blob, filename) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';

        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up object URL after a short delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #48bb78;' : 'background: #f56565;'}
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreatorAI();
});

// Cross-browser compatibility checks
document.addEventListener('DOMContentLoaded', () => {
    // Check for required APIs
    const features = {
        'Canvas API': !!document.createElement('canvas').getContext,
        'Blob API': !!window.Blob,
        'URL.createObjectURL': !!window.URL && !!window.URL.createObjectURL,
        'MediaRecorder API': !!window.MediaRecorder
    };

    const unsupported = Object.entries(features)
        .filter(([feature, supported]) => !supported)
        .map(([feature]) => feature);

    if (unsupported.length > 0) {
        console.warn('Some features may not work in this browser:', unsupported);
        
        // Show warning for video generation if MediaRecorder is not supported
        if (!features['MediaRecorder API']) {
            const videoSection = document.getElementById('video-section');
            const warning = document.createElement('div');
            warning.style.cssText = `
                background: #fed7d7;
                color: #c53030;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                text-align: center;
            `;
            warning.textContent = 'Video generation may not be supported in this browser.';
            videoSection.insertBefore(warning, videoSection.firstChild.nextSibling);
        }
    }
});