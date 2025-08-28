const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');

/**
 * Metalax NFT Platform - Image Processing Backend
 * 
 * Handles image upload, processing, optimization, and preparation
 * for on-chain storage in Solana NFT metadata.
 * 
 * Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.
 */

class MetalaxImageProcessor {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.maxImageSize = 10 * 1024; // 10KB for on-chain storage efficiency
        this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
            methods: ['GET', 'POST'],
            credentials: true
        }));

        // Rate limiting for image processing
        const imageProcessingLimit = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 50, // 50 image processing requests per window
            message: {
                error: 'Too many image processing requests, please try again later.',
                retryAfter: 15 * 60
            }
        });

        this.app.use('/api/process-image', imageProcessingLimit);

        // Body parsing
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // File upload configuration
        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB max upload (will be optimized down)
                files: 1
            },
            fileFilter: (req, file, cb) => {
                const ext = file.originalname.toLowerCase().split('.').pop();
                if (this.supportedFormats.includes(ext)) {
                    cb(null, true);
                } else {
                    cb(new Error(`Unsupported format. Supported: ${this.supportedFormats.join(', ')}`));
                }
            }
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'Metalax Image Processor'
            });
        });

        // Main image processing endpoint
        this.app.post('/api/process-image', this.upload.single('image'), async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        error: 'No image file provided',
                        code: 'NO_IMAGE'
                    });
                }

                const { targetSize, quality, format } = req.body;
                const processedImage = await this.processImage(req.file.buffer, {
                    targetSize: parseInt(targetSize) || this.maxImageSize,
                    quality: parseInt(quality) || 80,
                    format: format || 'jpeg'
                });

                res.json({
                    success: true,
                    data: {
                        processedImage: processedImage.toString('base64'),
                        size: processedImage.length,
                        format: format || 'jpeg',
                        hash: crypto.createHash('sha256').update(processedImage).digest('hex'),
                        metadata: {
                            originalSize: req.file.size,
                            compressionRatio: ((req.file.size - processedImage.length) / req.file.size * 100).toFixed(2) + '%',
                            processedAt: new Date().toISOString()
                        }
                    }
                });

            } catch (error) {
                console.error('Image processing error:', error);
                res.status(500).json({
                    error: 'Failed to process image',
                    message: error.message,
                    code: 'PROCESSING_ERROR'
                });
            }
        });

        // Get processing statistics
        this.app.get('/api/stats', (req, res) => {
            res.json({
                maxImageSize: this.maxImageSize,
                supportedFormats: this.supportedFormats,
                rateLimit: {
                    windowMs: 15 * 60 * 1000,
                    maxRequests: 50
                },
                serverInfo: {
                    nodeVersion: process.version,
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage()
                }
            });
        });

        // Error handling middleware
        this.app.use((error, req, res, next) => {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'File too large',
                        maxSize: '50MB',
                        code: 'FILE_TOO_LARGE'
                    });
                }
            }

            console.error('Unhandled error:', error);
            res.status(500).json({
                error: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        });
    }

    /**
     * Process and optimize image for on-chain storage
     */
    async processImage(buffer, options = {}) {
        const {
            targetSize = this.maxImageSize,
            quality = 80,
            format = 'jpeg'
        } = options;

        let image = sharp(buffer);
        
        // Get original metadata
        const metadata = await image.metadata();
        console.log(`Processing image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${buffer.length} bytes`);

        // Start with format conversion
        switch (format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                image = image.jpeg({ quality, progressive: true });
                break;
            case 'png':
                image = image.png({ quality, compressionLevel: 9 });
                break;
            case 'webp':
                image = image.webp({ quality, effort: 6 });
                break;
            default:
                image = image.jpeg({ quality, progressive: true });
        }

        // Initial conversion
        let processed = await image.toBuffer();
        
        // If still too large, progressively reduce dimensions
        if (processed.length > targetSize) {
            let scaleFactor = 0.9;
            let attempts = 0;
            const maxAttempts = 10;

            while (processed.length > targetSize && attempts < maxAttempts) {
                const newWidth = Math.floor(metadata.width * scaleFactor);
                const newHeight = Math.floor(metadata.height * scaleFactor);
                
                image = sharp(buffer).resize(newWidth, newHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                });

                switch (format.toLowerCase()) {
                    case 'jpeg':
                    case 'jpg':
                        image = image.jpeg({ 
                            quality: Math.max(20, quality - (attempts * 10)), 
                            progressive: true
                        });
                        break;
                    case 'png':
                        image = image.png({ 
                            quality: Math.max(20, quality - (attempts * 10)), 
                            compressionLevel: 9 
                        });
                        break;
                    case 'webp':
                        image = image.webp({ 
                            quality: Math.max(20, quality - (attempts * 10)), 
                            effort: 6 
                        });
                        break;
                }

                processed = await image.toBuffer();
                scaleFactor *= 0.9;
                attempts++;
                
                console.log(`Attempt ${attempts}: Size ${processed.length} bytes (target: ${targetSize})`);
            }
        }

        if (processed.length > targetSize) {
            throw new Error(`Unable to compress image to target size of ${targetSize} bytes. Final size: ${processed.length} bytes`);
        }

        console.log(`Image processed successfully: ${processed.length} bytes`);
        return processed;
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Metalax Image Processor running on port ${this.port}`);
            console.log(`Max image size for on-chain storage: ${this.maxImageSize} bytes`);
            console.log(`Supported formats: ${this.supportedFormats.join(', ')}`);
        });
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const processor = new MetalaxImageProcessor();
    processor.start();
}

module.exports = MetalaxImageProcessor;