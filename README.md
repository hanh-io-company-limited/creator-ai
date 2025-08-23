# Creator AI - Offline AI Video Content Creation

![Creator AI Logo](assets/logo.png)

Creator AI is a standalone desktop application that empowers content creators to generate AI-powered videos offline, ensuring complete control over their creative intellectual property. The application allows users to train custom models and generate high-quality video content without relying on external platforms or cloud services.

## 🌟 Features

- **Offline AI Video Generation**: Create videos entirely offline without internet dependency
- **Custom Model Training**: Train your own AI models with your proprietary data
- **Multiple Generation Types**:
  - Text-to-Video: Generate videos from text prompts
  - Image-to-Video: Transform static images into dynamic videos
  - Style Transfer: Apply artistic styles to video content
- **Intellectual Property Protection**: Keep your data and models completely private
- **Professional Interface**: Intuitive desktop application built with Electron
- **Batch Processing**: Generate multiple videos efficiently
- **Project Management**: Save and organize your creative projects
- **Cross-Platform**: Available for Windows, macOS, and Linux

## 📋 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10 (64-bit) or later
- **RAM**: 8 GB (16 GB recommended for better performance)
- **Storage**: 2 GB free space (additional space needed for models and output)
- **Graphics**: DirectX 11 compatible graphics card

### Recommended Requirements
- **RAM**: 16 GB or more
- **Graphics**: Dedicated GPU with 4GB+ VRAM for faster processing
- **Storage**: SSD with 10+ GB free space
- **CPU**: Multi-core processor (Intel i7 or AMD Ryzen 7 equivalent)

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