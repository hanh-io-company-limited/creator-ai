# Creator AI - Multi-Chain NFT Platform with AI Content Generation

![Creator AI Logo](assets/logo.png)

Creator AI is a revolutionary desktop application that combines AI-powered content creation with multi-chain NFT minting capabilities. Generate unique digital art and media using AI, then mint it as NFTs on Ethereum, Solana, or other supported blockchain networks - all from a single, user-friendly interface.

## 🌟 Features

### Multi-Chain NFT Support
- **Ethereum Integration**: Full ERC-721 NFT minting with MetaMask wallet support
- **Solana Integration**: Native Solana NFT minting with Phantom wallet integration
- **Network Switching**: Seamless switching between mainnet and testnet environments
- **Gas Fee Estimation**: Real-time transaction cost calculation
- **Smart Contract Interaction**: Automated contract deployment and interaction

### AI Content Generation
- **Offline AI Processing**: Generate unique content without internet dependency
- **Multiple AI Models**: Support for various AI models and algorithms
- **Custom Training**: Train your own AI models with your data
- **Text-to-Media**: Generate images and videos from text prompts
- **Style Transfer**: Apply artistic styles to existing content

### Advanced NFT Features
- **Metadata Management**: Comprehensive NFT metadata creation and editing
- **Attribute System**: Flexible trait and property assignment
- **IPFS Integration**: Decentralized storage for NFT metadata and assets
- **Collection Support**: Create and manage NFT collections across chains
- **Preview System**: Real-time NFT preview before minting

### Professional Tools
- **Wallet Management**: Secure connection to multiple wallet types
- **Batch Operations**: Generate and mint multiple NFTs efficiently
- **Project Management**: Save and organize your creative projects
- **Cross-Platform**: Available for Windows, macOS, and Linux
- **Intellectual Property Protection**: Keep your data and models completely private

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

**IMPORTANT INTELLECTUAL PROPERTY NOTICE:**
By contributing to this repository, you acknowledge and agree that:

1. **All contributions become the exclusive property of Hanh IO Company Limited**
2. **You assign all rights, title, and interest in your contributions to Hanh IO Company Limited**
3. **Your contributions are subject to the proprietary license terms**
4. **No external use or redistribution of contributions is permitted**

### Development Setup

1. Ensure you have proper authorization from Hanh IO Company Limited
2. Create a feature branch within the authorized environment
3. Install dependencies: `npm install`
4. Make your changes following company standards
5. Test thoroughly: `npm test`
6. Submit for internal review

### Contributor Agreement
All contributors must sign the Hanh IO Company Limited Contributor License Agreement (CLA) before any contributions can be accepted. Contact legal@hanh-io.com for the CLA.

## 📄 License

This project is proprietary software owned exclusively by Hanh IO Company Limited. See the [LICENSE](LICENSE) file for complete terms.

### Intellectual Property Notice:
- ✅ **Exclusive Ownership**: All rights reserved by Hanh IO Company Limited
- ✅ **Proprietary Technology**: Protected by copyright and trade secret laws
- ❌ **No Redistribution**: Cannot be copied, shared, or distributed
- ❌ **No Derivatives**: Cannot be modified or used to create derivative works
- 🔒 **Confidential**: All code and methodologies are trade secrets

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Troubleshooting](docs/troubleshooting.md)

### Getting Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/hanh-io-company-limited/creator-ai/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/hanh-io-company-limited/creator-ai/discussions)
- 📧 **Email Support**: support@hanh-io.com

### Official Channels
- 🌐 **Website**: [hanh-io.com](https://hanh-io.com)
- 📧 **Business Inquiries**: business@hanh-io.com
- ⚖️ **Legal Contact**: legal@hanh-io.com

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

**© 2024 Hanh IO Company Limited - All Rights Reserved**

*Proprietary AI Technology - Confidential and Trade Secret*

**INTELLECTUAL PROPERTY NOTICE:**
This software and all associated intellectual property, including but not limited to source code, algorithms, methodologies, designs, and concepts, are the exclusive property of Hanh IO Company Limited. Any unauthorized use, reproduction, distribution, or reverse engineering is strictly prohibited and may result in severe legal penalties.