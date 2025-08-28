# Metalax NFT Platform - Technical Documentation

## Overview

The Metalax NFT Platform is a comprehensive solution for creating, minting, and managing NFTs on the Solana blockchain with unique on-chain image storage capabilities. This document provides technical details for developers and system administrators.

## Architecture

### Components

1. **Solana Program** (`programs/metalax-nft/`)
   - Smart contract handling NFT minting and fee collection
   - On-chain image storage up to 10KB per NFT
   - Platform fee of 0.006 SOL per mint

2. **Backend Image Processor** (`src/backend/`)
   - Express.js server for image optimization
   - Automatic compression to meet on-chain storage limits
   - Support for multiple image formats (JPEG, PNG, WebP)

3. **Frontend Application** (`src/`)
   - Electron-based desktop application
   - Solana wallet integration
   - Intuitive minting interface

## Technical Specifications

### Solana Program Features

- **Program ID**: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`
- **Minting Fee**: 6,000,000 lamports (0.006 SOL)
- **Max Image Size**: 10,240 bytes (10KB) for cost efficiency
- **Network**: Devnet (configurable for mainnet)

### Smart Contract Functions

#### `initialize()`
Initializes the Metalax platform with the contract owner.

#### `mint_nft()`
Mints a new NFT with the following parameters:
- `name`: NFT name (max 32 characters)
- `symbol`: NFT symbol (max 10 characters)
- `uri`: Optional metadata URI (max 200 characters)
- `image_data`: On-chain image data (max 10KB)
- `seller_fee_basis_points`: Royalty percentage (0-10000 basis points)

#### `transfer_nft()`
Transfers NFT ownership between accounts.

#### `get_image_data()`
Retrieves image data directly from the blockchain.

### Image Processing Backend

#### Endpoints

- `GET /health` - Health check
- `POST /api/process-image` - Process single image
- `POST /api/process-images-batch` - Process multiple images
- `GET /api/stats` - Backend statistics

#### Processing Options

- **Target Size**: Configurable compression target (default: 10KB)
- **Quality**: JPEG/WebP quality setting (20-100%)
- **Format**: Output format (JPEG, PNG, WebP)
- **Auto-scaling**: Automatic dimension reduction if needed

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- Rust 1.70+
- Solana CLI 1.17+
- Anchor Framework 0.29+

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/hanh-io-company-limited/creator-ai.git
   cd creator-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Solana Program**
   ```bash
   anchor build
   ```

4. **Deploy to Devnet**
   ```bash
   anchor deploy
   ```

5. **Start Backend Server**
   ```bash
   npm run backend
   ```

6. **Launch Application**
   ```bash
   npm start
   ```

### Production Deployment

#### Solana Program Deployment

1. **Configure for Mainnet**
   ```toml
   # Anchor.toml
   [provider]
   cluster = "Mainnet"
   ```

2. **Deploy Program**
   ```bash
   anchor deploy --provider.cluster mainnet
   ```

#### Backend Server Deployment

1. **Environment Variables**
   ```bash
   PORT=3001
   ALLOWED_ORIGINS=https://yourdomain.com
   NODE_ENV=production
   ```

2. **Docker Deployment**
   ```bash
   docker build -t metalax-backend .
   docker run -p 3001:3001 metalax-backend
   ```

## API Reference

### Solana Client API

#### `connectWallet()`
```javascript
const result = await metalaxClient.connectWallet();
// Returns: { success: boolean, publicKey: string, balance: number }
```

#### `mintNFT(nftData)`
```javascript
const nftData = {
  name: "My NFT",
  symbol: "MNT",
  uri: "https://metadata.example.com",
  imageData: "base64EncodedImageData",
  royaltyBasisPoints: 500 // 5%
};
const result = await metalaxClient.mintNFT(nftData);
```

#### `getPlatformStats()`
```javascript
const stats = await metalaxClient.getPlatformStats();
// Returns platform metrics including total minted and fees collected
```

### Image Processing API

#### Process Image
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('targetSize', '10240');
formData.append('quality', '80');
formData.append('format', 'jpeg');

const response = await fetch('/api/process-image', {
  method: 'POST',
  body: formData
});
```

## Configuration

### Network Configuration

```javascript
// src/solana/metalax-client.js
const metalaxClient = new MetalaxSolanaClient({
  network: 'mainnet' // or 'devnet', 'testnet'
});
```

### Image Processing Limits

```javascript
// src/backend/image-processor.js
const maxImageSize = 10 * 1024; // 10KB
const supportedFormats = ['jpeg', 'png', 'webp'];
```

## Security Considerations

### Smart Contract Security

- **Access Control**: Only platform owner can update settings
- **Fee Validation**: Fixed minting fee prevents manipulation
- **Size Limits**: Image data size validation prevents blockchain bloat
- **Input Validation**: All user inputs are validated on-chain

### Backend Security

- **Rate Limiting**: API endpoints have rate limits
- **CORS Protection**: Configurable allowed origins
- **File Size Limits**: Upload limits prevent abuse
- **Input Sanitization**: All uploads are validated

### Frontend Security

- **Wallet Integration**: Uses official Solana wallet adapters
- **Transaction Signing**: All transactions require user approval
- **Data Validation**: Client-side validation before submission

## Testing

### Run Integration Tests
```bash
npm run test:solana
```

### Manual Testing

1. **Start Backend Server**
   ```bash
   npm run backend
   ```

2. **Launch Application**
   ```bash
   npm start
   ```

3. **Test Workflow**
   - Connect Phantom wallet
   - Upload and process image
   - Mint NFT
   - Verify transaction on Solana Explorer

## Troubleshooting

### Common Issues

#### Backend Connection Failed
- Ensure backend server is running on port 3001
- Check firewall settings
- Verify CORS configuration

#### Wallet Connection Issues
- Install Phantom wallet extension
- Ensure wallet has sufficient SOL balance
- Check network configuration (devnet/mainnet)

#### Image Processing Errors
- Verify image format is supported
- Check image size limits
- Ensure backend has sufficient memory

#### Transaction Failures
- Verify wallet balance (minimum 0.007 SOL)
- Check network connectivity
- Confirm program deployment status

### Error Codes

- `NO_IMAGE`: No image file provided
- `PROCESSING_ERROR`: Image processing failed
- `FILE_TOO_LARGE`: Image exceeds size limits
- `INSUFFICIENT_BALANCE`: Wallet balance too low
- `WALLET_NOT_CONNECTED`: Wallet connection required

## Performance Optimization

### On-chain Storage

- **Image Compression**: Aggressive compression to meet 10KB limit
- **Format Selection**: WebP for best compression ratios
- **Dimension Scaling**: Automatic resizing if needed

### Transaction Costs

- **Batch Operations**: Future support for batch minting
- **Fee Estimation**: Accurate gas estimation
- **Priority Fees**: Configurable priority for faster processing

## Monitoring & Metrics

### Platform Metrics

- Total NFTs minted
- Total fees collected
- Average image sizes
- Processing success rates

### Backend Metrics

- Request rates and response times
- Processing queue status
- Error rates by endpoint
- System resource usage

## Future Enhancements

### Planned Features

- **Batch Minting**: Multiple NFTs in single transaction
- **Metadata Standards**: Metaplex compatibility
- **Mobile App**: React Native implementation
- **IPFS Integration**: Optional off-chain storage
- **Marketplace**: Built-in trading functionality

### Scalability Improvements

- **CDN Integration**: Global image processing
- **Database Backend**: User data persistence
- **Analytics Dashboard**: Advanced metrics and insights
- **API Gateway**: Enterprise-grade API management

## Support

### Documentation
- Technical API documentation
- Video tutorials
- Best practices guide

### Community
- Discord server for developers
- GitHub issues for bug reports
- Regular community calls

### Enterprise Support
- Priority technical support
- Custom deployment assistance
- SLA guarantees
- Training programs

---

**© 2024 Hanh IO Company Limited - All Rights Reserved**

*This documentation is proprietary and confidential. Unauthorized distribution is prohibited.*