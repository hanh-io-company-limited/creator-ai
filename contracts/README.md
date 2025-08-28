# Creator AI Smart Contracts

This directory contains smart contracts for the Creator AI multi-chain NFT platform.

## Ethereum Contracts

### CreatorAINFT.sol
- **Standard**: ERC-721 (Non-Fungible Token)
- **Features**:
  - Mint individual NFTs
  - Batch mint multiple NFTs
  - Track NFT creators
  - Support for metadata URIs
  - Owner-only administrative functions

### Contract Addresses

#### Mainnet
- Contract Address: *To be deployed*

#### Sepolia Testnet
- Contract Address: *To be deployed*

## Solana Programs

For Solana NFT minting, the platform integrates with:
- **Metaplex Token Metadata Program**
- **Metaplex Candy Machine (for collections)**

## Deployment

### Ethereum Deployment
```bash
# Using Hardhat
npx hardhat deploy --network sepolia

# Using Truffle
truffle migrate --network sepolia
```

### Solana Deployment
```bash
# Using Anchor
anchor deploy

# Using Solana CLI
solana program deploy target/deploy/program.so
```

## Integration

The smart contracts are integrated into the Creator AI platform through:
- Web3.js for Ethereum interaction
- Solana Web3.js for Solana interaction
- Automatic contract detection and interaction

## Security

All contracts have been designed with security best practices:
- OpenZeppelin library usage
- Access control mechanisms
- Input validation
- Event emission for transparency

---

**Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.**