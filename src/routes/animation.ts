import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Convert image to animation using Wav2Lip
router.post('/create', async (req: Request, res: Response) => {
  const { imageId, audioFile, animationType = 'lip_sync' } = req.body;
  
  try {
    if (!imageId) {
      return res.status(400).json({
        error: 'Missing image',
        message: 'Vui lòng chọn hình ảnh để tạo animation'
      });
    }

    // TODO: Integrate with Wav2Lip AI model
    // For now, return mock response
    
    const animationResult = {
      id: `anim_${Date.now()}`,
      imageId,
      type: animationType,
      status: 'processing',
      outputUrl: null,
      createdAt: new Date().toISOString(),
      estimatedTime: '3-5 phút'
    };

    res.json({
      success: true,
      message: 'Bắt đầu tạo animation',
      animation: animationResult
    });

  } catch (error) {
    console.error('Animation error:', error);
    res.status(500).json({
      error: 'Animation failed',
      message: 'Lỗi tạo animation từ hình ảnh'
    });
  }
});

// Get animation status
router.get('/status/:animationId', (req: Request, res: Response) => {
  const { animationId } = req.params;
  
  // TODO: Get actual status from AI service
  res.json({
    success: true,
    animationId,
    status: 'processing', // processing, completed, failed
    progress: 45,
    message: 'Đang xử lý animation...',
    estimatedTimeRemaining: '2 phút',
    outputUrl: null
  });
});

// Get supported animation types
router.get('/types', (req: Request, res: Response) => {
  const types = [
    {
      id: 'lip_sync',
      name: 'Đồng bộ môi',
      description: 'Tạo animation đồng bộ chuyển động môi với âm thanh',
      duration: '3-5 phút'
    },
    {
      id: 'head_movement',
      name: 'Chuyển động đầu',
      description: 'Tạo chuyển động tự nhiên của đầu và cổ',
      duration: '2-3 phút'
    },
    {
      id: 'eye_blink',
      name: 'Chớp mắt',
      description: 'Thêm chuyển động chớp mắt tự nhiên',
      duration: '1-2 phút'
    },
    {
      id: 'facial_expression',
      name: 'Biểu cảm khuôn mặt',
      description: 'Tạo các biểu cảm khuôn mặt đa dạng',
      duration: '4-6 phút'
    }
  ];

  res.json({
    success: true,
    types
  });
});

// Preview animation
router.get('/preview/:animationId', (req: Request, res: Response) => {
  const { animationId } = req.params;
  
  res.json({
    success: true,
    animationId,
    previewUrl: '/uploads/animation-preview.gif',
    duration: '5.2 giây'
  });
});

export default router;