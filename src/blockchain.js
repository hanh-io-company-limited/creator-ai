/*
 * Creator AI - Blockchain Integration Layer
 * 
 * Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file contains proprietary source code and trade secrets of Hanh IO Company Limited.
 * Any unauthorized copying, distribution, modification, or reverse engineering is strictly 
 * prohibited and may result in severe legal penalties.
 * 
 * All rights, title, and interest in this software are owned exclusively by 
 * Hanh IO Company Limited.
 */

const { ethers } = require('ethers');
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');

// Blockchain Networks Configuration
const NETWORKS = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    rpc: 'https://eth-mainnet.g.alchemy.com/v2/',
    testnet: {
      name: 'Sepolia',
      chainId: 11155111,
      rpc: 'https://eth-sepolia.g.alchemy.com/v2/'
    },
    currency: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  solana: {
    name: 'Solana',
    cluster: 'mainnet-beta',
    rpc: clusterApiUrl('mainnet-beta'),
    testnet: {
      name: 'Devnet',
      cluster: 'devnet',
      rpc: clusterApiUrl('devnet')
    },
    currency: 'SOL',
    blockExplorer: 'https://explorer.solana.com'
  }
};

// ERC-721 NFT Contract ABI (simplified)
const ERC721_ABI = [
  "function mint(address to, uint256 tokenId, string memory uri) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

class BlockchainManager {
  constructor() {
    this.currentNetwork = null;
    this.provider = null;
    this.signer = null;
    this.solanaConnection = null;
    this.connectedWallet = null;
    this.walletAddress = null;
  }

  // Network Management
  async switchNetwork(networkType, useTestnet = false) {
    try {
      this.currentNetwork = networkType;
      
      if (networkType === 'ethereum') {
        await this.initializeEthereumProvider(useTestnet);
      } else if (networkType === 'solana') {
        await this.initializeSolanaConnection(useTestnet);
      }
      
      return { success: true, network: this.getCurrentNetworkInfo() };
    } catch (error) {
      console.error('Network switch failed:', error);
      return { success: false, error: error.message };
    }
  }

  async initializeEthereumProvider(useTestnet = false) {
    const networkConfig = useTestnet ? NETWORKS.ethereum.testnet : NETWORKS.ethereum;
    
    // Check if MetaMask is available
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.signer = await this.provider.getSigner();
      this.walletAddress = await this.signer.getAddress();
      
      // Switch to correct network
      await this.switchEthereumNetwork(networkConfig.chainId);
    } else {
      throw new Error('MetaMask not found. Please install MetaMask wallet.');
    }
  }

  async initializeSolanaConnection(useTestnet = false) {
    const networkConfig = useTestnet ? NETWORKS.solana.testnet : NETWORKS.solana;
    this.solanaConnection = new Connection(networkConfig.rpc, 'confirmed');
    
    // Check for Phantom wallet
    if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
      const resp = await window.solana.connect();
      this.walletAddress = resp.publicKey.toString();
      this.connectedWallet = window.solana;
    } else {
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }
  }

  async switchEthereumNetwork(chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await this.addEthereumNetwork(chainId);
      } else {
        throw switchError;
      }
    }
  }

  async addEthereumNetwork(chainId) {
    const networkConfig = chainId === 11155111 ? NETWORKS.ethereum.testnet : NETWORKS.ethereum;
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainId.toString(16)}`,
        chainName: networkConfig.name,
        rpcUrls: [networkConfig.rpc],
        nativeCurrency: {
          name: networkConfig.currency,
          symbol: networkConfig.currency,
          decimals: 18
        },
        blockExplorerUrls: [networkConfig.blockExplorer]
      }]
    });
  }

  // Wallet Connection
  async connectWallet(walletType) {
    try {
      if (walletType === 'metamask' && this.currentNetwork === 'ethereum') {
        await this.initializeEthereumProvider();
        return { success: true, address: this.walletAddress, wallet: 'MetaMask' };
      } else if (walletType === 'phantom' && this.currentNetwork === 'solana') {
        await this.initializeSolanaConnection();
        return { success: true, address: this.walletAddress, wallet: 'Phantom' };
      } else {
        throw new Error('Invalid wallet type for current network');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnectWallet() {
    try {
      if (this.currentNetwork === 'solana' && this.connectedWallet) {
        await this.connectedWallet.disconnect();
      }
      
      this.walletAddress = null;
      this.connectedWallet = null;
      this.signer = null;
      
      return { success: true };
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // NFT Minting
  async mintNFT(contractAddress, tokenMetadata) {
    try {
      if (this.currentNetwork === 'ethereum') {
        return await this.mintEthereumNFT(contractAddress, tokenMetadata);
      } else if (this.currentNetwork === 'solana') {
        return await this.mintSolanaNFT(tokenMetadata);
      } else {
        throw new Error('No network selected');
      }
    } catch (error) {
      console.error('NFT minting failed:', error);
      return { success: false, error: error.message };
    }
  }

  async mintEthereumNFT(contractAddress, tokenMetadata) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.signer);
    const tokenId = Date.now(); // Simple token ID generation
    
    // Estimate gas
    const gasEstimate = await contract.mint.estimateGas(
      this.walletAddress,
      tokenId,
      tokenMetadata.uri
    );
    
    // Execute mint transaction
    const tx = await contract.mint(
      this.walletAddress,
      tokenId,
      tokenMetadata.uri,
      { gasLimit: gasEstimate }
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId: tokenId,
      blockNumber: receipt.blockNumber
    };
  }

  async mintSolanaNFT(tokenMetadata) {
    if (!this.connectedWallet || !this.solanaConnection) {
      throw new Error('Solana wallet not connected');
    }

    // This would integrate with Metaplex for actual NFT minting
    // For now, returning a mock response
    const mockTxSignature = 'solana_mock_transaction_' + Date.now();
    
    return {
      success: true,
      transactionSignature: mockTxSignature,
      mint: 'mock_mint_address_' + Date.now()
    };
  }

  // Network Information
  getCurrentNetworkInfo() {
    if (!this.currentNetwork) return null;
    
    const network = NETWORKS[this.currentNetwork];
    return {
      type: this.currentNetwork,
      name: network.name,
      currency: network.currency,
      blockExplorer: network.blockExplorer,
      connected: !!this.walletAddress,
      walletAddress: this.walletAddress
    };
  }

  async getNetworkGasFees() {
    try {
      if (this.currentNetwork === 'ethereum' && this.provider) {
        const feeData = await this.provider.getFeeData();
        return {
          gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
          maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
        };
      } else if (this.currentNetwork === 'solana' && this.solanaConnection) {
        const fees = await this.solanaConnection.getRecentBlockhash();
        return {
          lamportsPerSignature: fees.feeCalculator?.lamportsPerSignature || 5000
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get gas fees:', error);
      return null;
    }
  }

  // Utility Methods
  isWalletConnected() {
    return !!this.walletAddress;
  }

  getAvailableNetworks() {
    return Object.keys(NETWORKS).map(key => ({
      id: key,
      name: NETWORKS[key].name,
      currency: NETWORKS[key].currency
    }));
  }
}

module.exports = { BlockchainManager, NETWORKS };