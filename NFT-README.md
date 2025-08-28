# 🎨 CreatorAI NFT Project

A comprehensive NFT (Non-Fungible Token) platform built on Ethereum blockchain, enabling users to mint AI-generated content as NFTs with a beautiful web interface.

## 🌟 Features

### Smart Contract Features
- **ERC-721 Compliant**: Full ERC-721 NFT standard implementation
- **Secure Minting**: Protected minting with authorization system
- **Batch Minting**: Efficiently mint multiple NFTs in a single transaction
- **Metadata Support**: Full IPFS/HTTP metadata URI support
- **Access Control**: Owner-based administration with authorized minters
- **Supply Management**: Configurable maximum supply with tracking
- **Price Control**: Adjustable minting prices
- **Security**: ReentrancyGuard protection and comprehensive error handling

### Web Interface Features
- **Wallet Integration**: MetaMask wallet connection
- **Real-time Updates**: Live contract information display
- **Single Minting**: Mint individual NFTs with custom metadata
- **Batch Minting**: Mint multiple NFTs at once
- **User Dashboard**: View user's NFT balance and account info
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Comprehensive error messages and loading states

## 📋 Project Structure

```
creator-ai/
├── contracts/                  # Smart contracts
│   └── CreatorAINFT.sol       # Main NFT contract
├── scripts/                   # Deployment and utility scripts
│   ├── deploy.js              # Contract deployment script
│   └── verify-contract.js     # Contract verification script
├── tests/                     # Smart contract tests
│   └── CreatorAINFT.test.js   # Comprehensive test suite
├── nft-frontend/              # React frontend application
│   ├── src/
│   │   ├── App.tsx            # Main application component
│   │   └── App.css            # Styling
│   └── package.json           # Frontend dependencies
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Main project dependencies
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or later
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hanh-io-company-limited/creator-ai.git
   cd creator-ai
   git checkout private-nft-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install frontend dependencies**
   ```bash
   npm run nft:install
   ```

### Development Setup

1. **Compile smart contracts**
   ```bash
   npm run hardhat:compile
   ```

2. **Run tests**
   ```bash
   npm run hardhat:test
   ```

3. **Start local blockchain**
   ```bash
   npm run hardhat:node
   ```

4. **Deploy to local network**
   ```bash
   npm run deploy:local
   ```

5. **Start frontend development server**
   ```bash
   npm run nft:dev
   ```

## 📝 Smart Contract Details

### CreatorAINFT Contract

The main NFT contract implements the following features:

#### Core Functions
- `mint(address to, string tokenURI)` - Mint a single NFT
- `batchMint(address to, string[] tokenURIs)` - Mint multiple NFTs
- `totalSupply()` - Get current supply
- `remainingSupply()` - Get remaining mintable tokens
- `isAvailableForMinting()` - Check if minting is available

#### Admin Functions
- `setMintPrice(uint256 newPrice)` - Update mint price
- `setMaxSupply(uint256 newMaxSupply)` - Update maximum supply
- `setMinterAuthorization(address minter, bool authorized)` - Authorize free minting
- `withdraw()` - Withdraw contract funds
- `setBaseURI(string baseURI)` - Update base metadata URI

#### Events
- `NFTMinted(uint256 tokenId, address creator, address to, string tokenURI)`
- `MinterAuthorized(address minter, bool authorized)`
- `MintPriceUpdated(uint256 oldPrice, uint256 newPrice)`
- `MaxSupplyUpdated(uint256 oldSupply, uint256 newSupply)`

### Contract Configuration

```solidity
// Default deployment parameters
Name: "CreatorAI NFT"
Symbol: "CAINFT"
Max Supply: 10,000 NFTs
Mint Price: 0.01 ETH
Base URI: "https://api.creator-ai.com/metadata/"
```

## 🌐 Frontend Interface

### Features

1. **Wallet Connection**
   - MetaMask integration
   - Account information display
   - Network detection

2. **Contract Information**
   - Live supply tracking
   - Mint price display
   - Availability status

3. **Minting Interface**
   - Single NFT minting
   - Batch minting with dynamic inputs
   - Real-time cost calculation
   - Transaction status updates

4. **User Dashboard**
   - NFT balance display
   - Transaction history
   - Account information

### Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Enter Metadata**: Provide IPFS or HTTP URI for NFT metadata
3. **Mint NFT**: Click mint button and confirm transaction
4. **View Results**: Check your wallet for the new NFT

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Wallet private key (for deployment)
PRIVATE_KEY=your_private_key_here

# Network URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/your_api_key
MAINNET_URL=https://mainnet.infura.io/v3/your_api_key

# IPFS/Metadata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Contract address (updated after deployment)
NFT_CONTRACT_ADDRESS=
```

### Frontend Configuration

In `nft-frontend/.env`:

```env
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
```

## 🚀 Deployment

### Local Deployment

1. **Start local blockchain**
   ```bash
   npm run hardhat:node
   ```

2. **Deploy contract**
   ```bash
   npm run deploy:local
   ```

3. **Update frontend configuration**
   ```bash
   # Copy contract address to frontend/.env
   echo "REACT_APP_CONTRACT_ADDRESS=0x..." > nft-frontend/.env.local
   ```

### Testnet Deployment (Sepolia)

1. **Configure environment**
   ```bash
   # Add Sepolia URL and private key to .env
   ```

2. **Deploy to Sepolia**
   ```bash
   npm run deploy:sepolia
   ```

3. **Verify contract**
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "CreatorAI NFT" "CAINFT" 10000 "10000000000000000" "https://api.creator-ai.com/metadata/"
   ```

### Mainnet Deployment

⚠️ **Warning**: Mainnet deployment involves real money. Test thoroughly on testnets first.

1. **Configure mainnet settings**
2. **Deploy with production parameters**
3. **Verify contract on Etherscan**

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run hardhat:test

# Run specific test file
npx hardhat test tests/CreatorAINFT.test.js

# Run tests with gas reporting
REPORT_GAS=true npm run hardhat:test
```

### Test Coverage

The test suite covers:
- ✅ Contract deployment and initialization
- ✅ Single NFT minting (paid and free)
- ✅ Batch minting functionality
- ✅ Authorization system
- ✅ Supply management
- ✅ Admin functions
- ✅ Error conditions and edge cases
- ✅ ERC-721 compliance
- ✅ Security features

## 🔐 Security Features

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Owner-only admin functions
- **Input Validation**: Comprehensive parameter checking
- **Supply Limits**: Prevents unlimited minting
- **Overflow Protection**: Uses Solidity 0.8+ built-in protection

### Frontend Security
- **Wallet Integration**: Secure MetaMask connection
- **Transaction Validation**: Pre-transaction checks
- **Error Handling**: Safe error recovery
- **Input Sanitization**: Validates user inputs

## 🎯 Use Cases

### For Artists and Creators
- Mint AI-generated art as NFTs
- Create limited edition collections
- Sell digital artwork on marketplaces

### For Developers
- Integrate NFT functionality into applications
- Build custom minting interfaces
- Create NFT-based games or platforms

### For Collectors
- Mint unique AI-generated content
- Build NFT collections
- Trade on secondary markets

## 📊 Gas Optimization

### Contract Optimizations
- Efficient storage patterns
- Batch operations for gas savings
- Optimized loops and conditionals
- Minimal external calls

### Estimated Gas Costs
- Single mint: ~150,000 gas
- Batch mint (5 NFTs): ~400,000 gas
- Authorization: ~45,000 gas
- Admin updates: ~30,000-50,000 gas

## 🔄 Upgrade Path

### Version 1.1 (Planned)
- [ ] IPFS integration for metadata
- [ ] Royalty support (EIP-2981)
- [ ] Marketplace integration
- [ ] Advanced batch operations

### Version 1.2 (Planned)
- [ ] Layer 2 support (Polygon, Arbitrum)
- [ ] Multi-signature wallet support
- [ ] Advanced metadata management
- [ ] Analytics dashboard

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Make changes and test**: `npm run hardhat:test`
4. **Commit changes**: `git commit -m "Add new feature"`
5. **Push to branch**: `git push origin feature/new-feature`
6. **Create Pull Request**

### Code Standards
- Follow Solidity style guide
- Use TypeScript for frontend
- Write comprehensive tests
- Document all functions
- Follow security best practices

## 📚 Resources

### Documentation
- [Hardhat Documentation](https://hardhat.org/docs/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [React Documentation](https://reactjs.org/docs/)

### Tools
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract library
- [MetaMask](https://metamask.io/) - Ethereum wallet
- [IPFS](https://ipfs.io/) - Decentralized storage

## 🆘 Troubleshooting

### Common Issues

#### Contract Compilation Errors
```bash
# Clear cache and recompile
npx hardhat clean
npm run hardhat:compile
```

#### Frontend Connection Issues
- Ensure MetaMask is installed and unlocked
- Check network configuration
- Verify contract address in environment variables

#### Transaction Failures
- Check account balance for gas fees
- Verify contract parameters
- Ensure network connection is stable

### Support
- 📧 Email: support@creator-ai.com
- 🐛 Issues: [GitHub Issues](https://github.com/hanh-io-company-limited/creator-ai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/hanh-io-company-limited/creator-ai/discussions)

## 📄 License

This project is proprietary software owned by Hanh IO Company Limited. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- OpenZeppelin team for secure contract templates
- Hardhat team for development tools
- Ethereum community for standards and best practices
- React team for the frontend framework

---

**© 2024 Hanh IO Company Limited - All Rights Reserved**

*Built with ❤️ for the NFT community*