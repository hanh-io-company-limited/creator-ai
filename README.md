# Creator AI - Offline AI Video Content Creation

![Creator AI Logo](assets/logo.png)

Creator AI is a standalone desktop application that empowers content creators to generate AI-powered videos offline, ensuring complete control over their creative intellectual property. The application allows users to train custom models and generate high-quality video content without relying on external platforms or cloud services.

## 🌟 Features

- **🎵 Music-Focused AI Generation**: Create audio content from text descriptions optimized for music creators
- **🧠 Real Machine Learning**: Powered by TensorFlow.js with customizable neural networks
- **🔄 Model Training**: Train your own AI models with your proprietary music data
- **📡 Internal API**: Comprehensive REST API for all AI operations and model management
- **🎛️ Audio Processing**: Advanced audio analysis, classification, and transformation
- **💾 Complete Offline Operation**: No internet dependency, all processing happens locally
- **🔒 Privacy-First**: Your data and models remain completely private and secure
- **🎯 Personalization**: Adaptive learning with user-specific datasets and preferences
- **⚡ High Performance**: Optimized for low latency and high throughput processing
- **🚀 Production Ready**: Comprehensive testing, monitoring, and deployment automation
- **📦 Multi-Platform**: Windows, macOS, and Linux support with Docker/Kubernetes deployment
- **🎨 Extensible Architecture**: Plugin-ready system for custom models and features

## 📋 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10 (64-bit), macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 8 GB (16 GB recommended for better performance)
- **Storage**: 50 GB free space (additional space needed for models and data)
- **CPU**: 4 cores (Intel i5 or AMD Ryzen 5 equivalent)
- **Node.js**: 18.0.0 or later

### Recommended Requirements
- **RAM**: 16 GB or more
- **Graphics**: Dedicated GPU with 4GB+ VRAM for faster processing (optional)
- **Storage**: SSD with 200+ GB free space
- **CPU**: Multi-core processor (Intel i7 or AMD Ryzen 7 equivalent)
- **Network**: Stable internet for initial setup

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai

# Install dependencies
npm install

# Deploy the complete system locally
npm run deploy:local

# Or run a live demonstration
npm run demo
```

### Option 2: Manual Setup

```bash
# 1. Start the AI API server
npm run api

# 2. In another terminal, start the desktop app
npm start

# 3. Or access the web interface at http://localhost:3000
```

### Option 3: Docker Deployment

```bash
# Quick Docker setup
cd docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🎯 Core Capabilities

### 🎵 Text-to-Audio Generation
```javascript
// Generate music from text descriptions
const audio = await aiEngine.generateAudio(modelId, 
  "peaceful piano melody with soft reverb", 
  { duration: 30, sampleRate: 44100 }
);
```

### 🔊 Audio Processing & Analysis
```javascript
// Analyze musical characteristics
const analysis = await aiEngine.analyzeAudio(audioData);
// Returns: tempo, key, mood, energy, danceability, etc.

// Process audio with ML models
const result = await aiEngine.processAudio(modelId, audioData);
```

### 🧠 Custom Model Training
```javascript
// Train personalized models with your data
const model = await aiEngine.createTextToAudioModel(config);
await aiEngine.trainModel(model, trainingData, config, progressCallback);
```

### 📡 Internal API Access
```bash
# All functionality available via REST API
curl -X POST http://localhost:3000/api/ml/models/create \
  -H "Content-Type: application/json" \
  -d '{"type": "text-to-audio", "config": {...}}'
```

## 🚀 Installation

### Windows Installer (.exe)

1. Download the latest `Creator-AI-X.X.X-Setup.exe` from the [Releases](https://github.com/hanh-io-company-limited/creator-ai/releases) page
2. Run the installer with administrator privileges
3. Follow the installation wizard
4. Launch Creator AI from the Start Menu or Desktop shortcut

### Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hanh-io-company-limited/creator-ai.git
   cd creator-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

## 🎯 Quick Start Guide

### 1. First Launch
- Open Creator AI from your Start Menu
- The application will perform an initial system check
- Review the welcome dashboard and system status

### 2. Train Your First Model
- Navigate to the **Train Model** tab
- Choose your model type (Text-to-Video, Image-to-Video, or Style Transfer)
- Select your training data (videos, images, or style references)
- Configure training parameters
- Click **Start Training** and monitor progress

### 3. Generate Your First Video
- Go to the **Generate Video** tab
- Select a trained model from the dropdown
- Enter a descriptive prompt for your video
- Configure duration and resolution settings
- Click **Generate Video** and wait for processing

### 4. Manage Your Models
- Use the **Model Library** tab to view all your models
- Import pre-trained models or export your custom models
- Delete unused models to free up space

## 🛠️ Development

### Building from Source

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for Windows
npm run build:win

# Build for all platforms
npm run build:all
```

### Project Structure

```
creator-ai/
├── src/
│   ├── main.js           # Electron main process
│   ├── index.html        # Application UI
│   ├── renderer.js       # UI logic and interactions
│   ├── ai-engine.js      # AI model operations
│   └── styles.css        # Application styling
├── assets/               # Icons and images
├── build/               # Build configuration
├── .github/workflows/   # CI/CD automation
└── dist/               # Built application (generated)
```

## 🔧 Configuration

### GPU Acceleration
Creator AI automatically detects and uses available GPU acceleration for faster processing. You can disable this in the Settings tab if needed.

### Model Storage
Models are stored in:
- Windows: `%APPDATA%\Creator AI\models\`
- User projects: `Documents\Creator AI Projects\`

### Memory Management
Adjust memory allocation in Settings based on your system specifications.

## 📚 Model Types

### Text-to-Video
Generate videos from textual descriptions. Perfect for:
- Concept visualization
- Storyboarding
- Educational content
- Marketing videos

### Image-to-Video
Transform static images into dynamic content:
- Product demonstrations
- Logo animations
- Artistic expressions
- Social media content

### Style Transfer
Apply artistic styles to video content:
- Creative filters
- Artistic interpretations
- Brand-specific styling
- Unique visual effects

## 🔒 Privacy & Security

Creator AI is designed with privacy as a core principle:

- **Offline Operation**: No data leaves your device
- **Local Model Storage**: All models stored locally
- **No Telemetry**: No usage tracking or data collection
- **Secure Processing**: All AI processing happens on your machine
- **Intellectual Property Protection**: Your data remains completely private

## 🤝 Contributing

We welcome contributions to Creator AI! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Make your changes
5. Test thoroughly: `npm test`
6. Submit a pull request

## 📄 License

This project is licensed under the Creative Commons Attribution-NoDerivatives 4.0 International License (CC BY-ND 4.0). See the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Share**: Copy and redistribute the material in any medium or format
- ✅ **Commercial Use**: Use for commercial purposes
- ❌ **No Derivatives**: Cannot modify, transform, or build upon the material
- 📝 **Attribution Required**: Must give appropriate credit

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Troubleshooting](docs/troubleshooting.md)

### Getting Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/hanh-io-company-limited/creator-ai/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/hanh-io-company-limited/creator-ai/discussions)
- 📧 **Email Support**: support@hanh-io.com

### Community
- 💬 **Discord**: [Join our community](https://discord.gg/creator-ai)
- 🐦 **Twitter**: [@HanhIOCompany](https://twitter.com/HanhIOCompany)
- 📹 **YouTube**: [Creator AI Tutorials](https://youtube.com/@CreatorAI)

## 🙏 Acknowledgments

- TensorFlow.js team for the AI framework
- Electron team for the desktop application platform
- Open source community for various dependencies and tools
- Beta testers and early adopters for valuable feedback

## 🚧 Roadmap

### Version 1.1.0
- [ ] Real-time preview during generation
- [ ] Additional model architectures
- [ ] Plugin system for custom models
- [ ] Advanced batch processing

### Version 1.2.0
- [ ] Cloud model marketplace (optional)
- [ ] Collaborative features
- [ ] Advanced editing tools
- [ ] Performance optimizations

### Version 2.0.0
- [ ] 3D video generation
- [ ] Advanced AI training algorithms
- [ ] Professional workflow integration
- [ ] Enterprise features

---

**Made with ❤️ by [Hanh IO Company Limited](https://hanh-io.com)**

*Empowering creators with offline AI technology*