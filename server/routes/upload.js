const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Middleware xác thực
router.use(authenticateToken);

// Cấu hình multer cho upload files
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads', req.user.id);
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique với timestamp
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter cho security
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
        audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
        video: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
        document: ['.txt', '.pdf', '.doc', '.docx']
    };

    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowed = Object.values(allowedTypes).flat().includes(ext);

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error(`Loại file không được hỗ trợ: ${ext}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
        files: 10 // Maximum 10 files per request
    }
});

// Upload single file
router.post('/single', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Không có file nào được upload'
            });
        }

        const fileInfo = {
            id: `file_${Date.now()}`,
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString(),
            userId: req.user.id
        };

        // Xử lý image optimization nếu là file hình ảnh
        if (req.file.mimetype.startsWith('image/') && req.file.mimetype !== 'image/svg+xml') {
            try {
                const optimizedPath = path.join(path.dirname(req.file.path), `optimized_${req.file.filename}`);
                
                await sharp(req.file.path)
                    .resize(1920, 1080, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .jpeg({ quality: 85 })
                    .toFile(optimizedPath);

                fileInfo.optimizedPath = optimizedPath;
                fileInfo.optimized = true;
            } catch (optimizeError) {
                console.warn('Image optimization failed:', optimizeError);
                fileInfo.optimized = false;
            }
        }

        res.json({
            success: true,
            message: 'File đã được upload thành công',
            data: fileInfo
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Lỗi trong quá trình upload file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'Không có file nào được upload'
            });
        }

        const filesInfo = await Promise.all(req.files.map(async (file) => {
            const fileInfo = {
                id: `file_${Date.now()}_${Math.random()}`,
                originalName: file.originalname,
                filename: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                uploadedAt: new Date().toISOString(),
                userId: req.user.id
            };

            // Optimize images
            if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
                try {
                    const optimizedPath = path.join(path.dirname(file.path), `optimized_${file.filename}`);
                    
                    await sharp(file.path)
                        .resize(1920, 1080, { 
                            fit: 'inside',
                            withoutEnlargement: true 
                        })
                        .jpeg({ quality: 85 })
                        .toFile(optimizedPath);

                    fileInfo.optimizedPath = optimizedPath;
                    fileInfo.optimized = true;
                } catch (optimizeError) {
                    console.warn('Image optimization failed:', optimizeError);
                    fileInfo.optimized = false;
                }
            }

            return fileInfo;
        }));

        res.json({
            success: true,
            message: `${req.files.length} file(s) đã được upload thành công`,
            data: filesInfo
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            error: 'Lỗi trong quá trình upload files',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get uploaded files list
router.get('/files', async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, '../../uploads', req.user.id);
        
        try {
            const files = await fs.readdir(uploadDir);
            const filesInfo = await Promise.all(files.map(async (filename) => {
                const filePath = path.join(uploadDir, filename);
                const stats = await fs.stat(filePath);
                
                return {
                    filename,
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime,
                    isOptimized: filename.startsWith('optimized_')
                };
            }));

            res.json({
                success: true,
                data: filesInfo
            });
        } catch (dirError) {
            if (dirError.code === 'ENOENT') {
                res.json({
                    success: true,
                    data: []
                });
            } else {
                throw dirError;
            }
        }

    } catch (error) {
        console.error('Files list error:', error);
        res.status(500).json({
            error: 'Lỗi khi lấy danh sách files',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Download/serve uploaded file
router.get('/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../uploads', req.user.id, filename);

        try {
            await fs.access(filePath);
            res.sendFile(path.resolve(filePath));
        } catch (accessError) {
            res.status(404).json({
                error: 'File không tồn tại'
            });
        }

    } catch (error) {
        console.error('File serve error:', error);
        res.status(500).json({
            error: 'Lỗi khi tải file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete uploaded file
router.delete('/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../uploads', req.user.id, filename);
        const optimizedPath = path.join(__dirname, '../../uploads', req.user.id, `optimized_${filename}`);

        try {
            await fs.unlink(filePath);
            
            // Xóa file optimized nếu có
            try {
                await fs.unlink(optimizedPath);
            } catch (optimizedError) {
                // Không báo lỗi nếu file optimized không tồn tại
            }

            res.json({
                success: true,
                message: 'File đã được xóa thành công'
            });
        } catch (deleteError) {
            if (deleteError.code === 'ENOENT') {
                res.status(404).json({
                    error: 'File không tồn tại'
                });
            } else {
                throw deleteError;
            }
        }

    } catch (error) {
        console.error('File delete error:', error);
        res.status(500).json({
            error: 'Lỗi khi xóa file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Error handling cho multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File quá lớn. Kích thước tối đa được phép là ' + 
                       Math.round((parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024) / (1024 * 1024)) + 'MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Quá nhiều files. Tối đa 10 files cho mỗi lần upload'
            });
        }
    }
    
    res.status(400).json({
        error: error.message || 'Lỗi upload file'
    });
});

module.exports = router;