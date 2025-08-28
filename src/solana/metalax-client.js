/**
 * Metalax NFT Platform - Solana Web3 Integration
 * 
 * Handles wallet connection, NFT minting transactions, and interaction
 * with the Metalax Solana program.
 * 
 * Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.
 */

const { 
    Connection, 
    PublicKey, 
    Transaction, 
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const { 
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction
} = require('@solana/spl-token');

const anchor = require('@coral-xyz/anchor');

class MetalaxSolanaClient {
    constructor(options = {}) {
        // Solana network configuration
        this.network = options.network || 'devnet';
        const programIdStr = options.programId || process.env.METALAX_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
        this.programId = new PublicKey(programIdStr);
        
        // Connection setup
        this.connection = new Connection(
            this.getClusterUrl(),
            { commitment: 'confirmed' }
        );
        
        // Minting fee in lamports (0.006 SOL)
        this.mintingFee = 6_000_000;
        
        // Platform PDA seeds
        this.platformSeed = Buffer.from('metalax-platform');
        this.nftMetadataSeed = Buffer.from('nft-metadata');
        
        this.wallet = null;
        this.program = null;
        
        this.initialize();
    }

    getClusterUrl() {
        switch (this.network) {
            case 'mainnet':
                return 'https://api.mainnet-beta.solana.com';
            case 'testnet':
                return 'https://api.testnet.solana.com';
            case 'devnet':
            default:
                return 'https://api.devnet.solana.com';
        }
    }

    async initialize() {
        try {
            // Set up Anchor provider and program
            const provider = new anchor.AnchorProvider(
                this.connection,
                this.wallet,
                { commitment: 'confirmed' }
            );
            
            // Load the program IDL (would be loaded from actual deployment)
            const idl = this.getMetalaxIdl();
            this.program = new anchor.Program(idl, this.programId, provider);
            
            console.log('Metalax Solana client initialized');
            console.log(`Network: ${this.network}`);
            console.log(`Program ID: ${this.programId.toString()}`);
            
        } catch (error) {
            console.error('Failed to initialize Solana client:', error);
        }
    }

    /**
     * Connect to Solana wallet (Phantom, Sollet, etc.)
     */
    async connectWallet() {
        try {
            // Check if wallet is available
            if (!window.solana) {
                throw new Error('Solana wallet not found. Please install Phantom wallet.');
            }

            // Request connection
            const response = await window.solana.connect();
            this.wallet = {
                publicKey: response.publicKey,
                signTransaction: window.solana.signTransaction,
                signAllTransactions: window.solana.signAllTransactions
            };

            console.log('Wallet connected:', this.wallet.publicKey.toString());
            return {
                success: true,
                publicKey: this.wallet.publicKey.toString(),
                balance: await this.getBalance()
            };

        } catch (error) {
            console.error('Wallet connection failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Disconnect wallet
     */
    async disconnectWallet() {
        try {
            if (window.solana) {
                await window.solana.disconnect();
            }
            this.wallet = null;
            console.log('Wallet disconnected');
            return { success: true };
        } catch (error) {
            console.error('Wallet disconnection failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get wallet balance in SOL
     */
    async getBalance() {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not connected');
            }

            const balance = await this.connection.getBalance(this.wallet.publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('Failed to get balance:', error);
            return 0;
        }
    }

    /**
     * Check if platform is initialized
     */
    async isPlatformInitialized() {
        try {
            const [platformPda] = await PublicKey.findProgramAddress(
                [this.platformSeed],
                this.programId
            );

            const account = await this.connection.getAccountInfo(platformPda);
            return account !== null;
        } catch (error) {
            console.error('Failed to check platform status:', error);
            return false;
        }
    }

    /**
     * Initialize the Metalax platform (owner only)
     */
    async initializePlatform() {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not connected');
            }

            const [platformPda, bump] = await PublicKey.findProgramAddress(
                [this.platformSeed],
                this.programId
            );

            const transaction = new Transaction();
            
            // Create initialize instruction
            const initializeIx = await this.program.methods
                .initialize()
                .accounts({
                    platform: platformPda,
                    owner: this.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();

            transaction.add(initializeIx);

            // Sign and send transaction
            const signature = await this.sendTransaction(transaction);
            
            return {
                success: true,
                signature,
                platformAddress: platformPda.toString()
            };

        } catch (error) {
            console.error('Platform initialization failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Mint NFT with processed image data
     */
    async mintNFT(nftData) {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not connected');
            }

            const {
                name,
                symbol,
                uri,
                imageData, // Base64 encoded processed image
                royaltyBasisPoints = 500 // 5% default royalty
            } = nftData;

            // Validate input
            if (!name || !symbol || !imageData) {
                throw new Error('Missing required NFT data (name, symbol, imageData)');
            }

            // Convert base64 image to buffer
            const imageBuffer = Buffer.from(imageData, 'base64');
            if (imageBuffer.length > 10240) { // 10KB limit
                throw new Error('Image data too large (max 10KB)');
            }

            // Check wallet balance
            const balance = await this.getBalance();
            const requiredBalance = this.mintingFee / LAMPORTS_PER_SOL + 0.01; // Fee + tx costs
            if (balance < requiredBalance) {
                throw new Error(`Insufficient balance. Required: ${requiredBalance} SOL, Available: ${balance} SOL`);
            }

            // Generate mint keypair
            const mintKeypair = anchor.web3.Keypair.generate();
            
            // Derive PDAs
            const [platformPda] = await PublicKey.findProgramAddress(
                [this.platformSeed],
                this.programId
            );

            const [nftMetadataPda] = await PublicKey.findProgramAddress(
                [this.nftMetadataSeed, mintKeypair.publicKey.toBuffer()],
                this.programId
            );

            // Get platform owner
            const platformData = await this.program.account.metalaxPlatform.fetch(platformPda);
            const platformOwner = platformData.owner;

            // Get associated token account
            const tokenAccount = await getAssociatedTokenAddress(
                mintKeypair.publicKey,
                this.wallet.publicKey
            );

            const transaction = new Transaction();

            // Add mint NFT instruction
            const mintNftIx = await this.program.methods
                .mintNft(
                    name,
                    symbol,
                    uri || '',
                    Array.from(imageBuffer), // Convert buffer to byte array
                    royaltyBasisPoints
                )
                .accounts({
                    platform: platformPda,
                    platformOwner: platformOwner,
                    mint: mintKeypair.publicKey,
                    nftMetadata: nftMetadataPda,
                    tokenAccount: tokenAccount,
                    payer: this.wallet.publicKey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                })
                .signers([mintKeypair])
                .instruction();

            transaction.add(mintNftIx);

            // Sign and send transaction
            const signature = await this.sendTransaction(transaction, [mintKeypair]);

            return {
                success: true,
                signature,
                mintAddress: mintKeypair.publicKey.toString(),
                tokenAccount: tokenAccount.toString(),
                metadata: {
                    name,
                    symbol,
                    uri,
                    imageSize: imageBuffer.length,
                    royalty: royaltyBasisPoints / 100 + '%'
                }
            };

        } catch (error) {
            console.error('NFT minting failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get NFT metadata including image data
     */
    async getNFTMetadata(mintAddress) {
        try {
            const mintPubkey = new PublicKey(mintAddress);
            
            const [nftMetadataPda] = await PublicKey.findProgramAddress(
                [this.nftMetadataSeed, mintPubkey.toBuffer()],
                this.programId
            );

            const metadata = await this.program.account.nftMetadata.fetch(nftMetadataPda);
            
            return {
                success: true,
                data: {
                    mint: metadata.mint.toString(),
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    imageData: Buffer.from(metadata.imageData).toString('base64'),
                    creator: metadata.creator.toString(),
                    owner: metadata.owner.toString(),
                    royaltyBasisPoints: metadata.royaltyBasisPoints
                }
            };

        } catch (error) {
            console.error('Failed to fetch NFT metadata:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get platform statistics
     */
    async getPlatformStats() {
        try {
            const [platformPda] = await PublicKey.findProgramAddress(
                [this.platformSeed],
                this.programId
            );

            const platform = await this.program.account.metalaxPlatform.fetch(platformPda);
            
            return {
                success: true,
                data: {
                    owner: platform.owner.toString(),
                    totalMinted: platform.totalMinted.toString(),
                    totalFeesCollected: platform.totalFeesCollected.toString(),
                    totalFeesCollectedSOL: platform.totalFeesCollected.toNumber() / LAMPORTS_PER_SOL
                }
            };

        } catch (error) {
            console.error('Failed to fetch platform stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send transaction with proper signing
     */
    async sendTransaction(transaction, signers = []) {
        try {
            // Get recent blockhash
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.wallet.publicKey;

            // Add additional signers if provided
            if (signers.length > 0) {
                transaction.partialSign(...signers);
            }

            // Sign transaction with wallet
            const signedTransaction = await this.wallet.signTransaction(transaction);

            // Send and confirm transaction
            const signature = await this.connection.sendRawTransaction(
                signedTransaction.serialize(),
                { skipPreflight: false }
            );

            // Confirm transaction
            await this.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });

            return signature;

        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    }

    /**
     * Get the program IDL (simplified version for demo)
     */
    getMetalaxIdl() {
        return {
            version: "0.1.0",
            name: "metalax_nft",
            instructions: [
                {
                    name: "initialize",
                    accounts: [
                        { name: "platform", isMut: true, isSigner: false },
                        { name: "owner", isMut: true, isSigner: true },
                        { name: "systemProgram", isMut: false, isSigner: false }
                    ],
                    args: []
                },
                {
                    name: "mintNft",
                    accounts: [
                        { name: "platform", isMut: true, isSigner: false },
                        { name: "platformOwner", isMut: true, isSigner: false },
                        { name: "mint", isMut: true, isSigner: false },
                        { name: "nftMetadata", isMut: true, isSigner: false },
                        { name: "tokenAccount", isMut: true, isSigner: false },
                        { name: "payer", isMut: true, isSigner: true },
                        { name: "tokenProgram", isMut: false, isSigner: false },
                        { name: "associatedTokenProgram", isMut: false, isSigner: false },
                        { name: "systemProgram", isMut: false, isSigner: false },
                        { name: "rent", isMut: false, isSigner: false }
                    ],
                    args: [
                        { name: "name", type: "string" },
                        { name: "symbol", type: "string" },
                        { name: "uri", type: "string" },
                        { name: "imageData", type: { vec: "u8" } },
                        { name: "sellerFeeBasisPoints", type: "u16" }
                    ]
                }
            ],
            accounts: [
                {
                    name: "MetalaxPlatform",
                    type: {
                        kind: "struct",
                        fields: [
                            { name: "owner", type: "publicKey" },
                            { name: "bump", type: "u8" },
                            { name: "totalMinted", type: "u64" },
                            { name: "totalFeesCollected", type: "u64" }
                        ]
                    }
                },
                {
                    name: "NftMetadata",
                    type: {
                        kind: "struct",
                        fields: [
                            { name: "mint", type: "publicKey" },
                            { name: "name", type: "string" },
                            { name: "symbol", type: "string" },
                            { name: "uri", type: "string" },
                            { name: "imageData", type: { vec: "u8" } },
                            { name: "creator", type: "publicKey" },
                            { name: "owner", type: "publicKey" },
                            { name: "royaltyBasisPoints", type: "u16" },
                            { name: "bump", type: "u8" }
                        ]
                    }
                }
            ]
        };
    }
}

// Export for use in renderer process
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetalaxSolanaClient;
}

// Make available globally in browser environment
if (typeof window !== 'undefined') {
    window.MetalaxSolanaClient = MetalaxSolanaClient;
}