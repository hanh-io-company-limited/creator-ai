import { Router } from 'express';
import { uploadMiddleware, handleUploadError } from '../middleware/upload';
import { uploadImages, getTrainingSession, deleteUploadedFiles } from '../controllers/uploadController';

const router = Router();

// Upload images for training
router.post('/', uploadMiddleware, handleUploadError, uploadImages);

// Get training session info
router.get('/session/:sessionId', getTrainingSession);

// Delete uploaded files and session
router.delete('/session/:sessionId', deleteUploadedFiles);

export default router;