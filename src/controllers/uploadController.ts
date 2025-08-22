import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

export interface TrainingSession {
  id: string;
  userId?: string;
  files: UploadedFile[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for demo (should use database in production)
const trainingSessions: Map<string, TrainingSession> = new Map();

export const uploadImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Vui lòng tải lên ít nhất 1 hình ảnh'
      });
    }

    if (files.length > 10) {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Chỉ được tải lên tối đa 10 hình ảnh'
      });
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: `File ${file.originalname} không phải là định dạng hình ảnh hợp lệ`
        });
      }
    }

    // Create training session
    const sessionId = uuidv4();
    const uploadedFiles: UploadedFile[] = files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    const trainingSession: TrainingSession = {
      id: sessionId,
      files: uploadedFiles,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    trainingSessions.set(sessionId, trainingSession);

    res.json({
      success: true,
      message: 'Tải lên thành công',
      sessionId,
      filesCount: files.length,
      files: uploadedFiles.map(f => ({
        id: f.id,
        originalName: f.originalName,
        size: f.size,
        url: `/uploads/${f.filename}`
      }))
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Lỗi tải lên hình ảnh'
    });
  }
};

export const getTrainingSession = (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  const session = trainingSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'Không tìm thấy phiên huấn luyện'
    });
  }

  res.json({
    success: true,
    session: {
      id: session.id,
      status: session.status,
      filesCount: session.files.length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      files: session.files.map(f => ({
        id: f.id,
        originalName: f.originalName,
        size: f.size,
        url: `/uploads/${f.filename}`
      }))
    }
  });
};

export const deleteUploadedFiles = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  const session = trainingSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'Không tìm thấy phiên huấn luyện'
    });
  }

  try {
    // Delete physical files
    for (const file of session.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    // Remove session from memory
    trainingSessions.delete(sessionId);

    res.json({
      success: true,
      message: 'Đã xóa phiên huấn luyện và các file thành công'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'Lỗi khi xóa files'
    });
  }
};