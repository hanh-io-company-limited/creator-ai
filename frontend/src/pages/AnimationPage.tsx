import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Animation,
  PlayArrow,
  Pause,
  Download
} from '@mui/icons-material';

const AnimationPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState('lip_sync');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationResult, setAnimationResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const animationTypes = [
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

  const sampleImages = [
    'https://via.placeholder.com/300x300/4285f4/ffffff?text=Portrait+1',
    'https://via.placeholder.com/300x300/34a853/ffffff?text=Portrait+2',
    'https://via.placeholder.com/300x300/ea4335/ffffff?text=Portrait+3',
    'https://via.placeholder.com/300x300/fbbc04/ffffff?text=Portrait+4'
  ];

  const createAnimation = async () => {
    if (!selectedImage) {
      setError('Vui lòng chọn hình ảnh để tạo animation');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      const response = await fetch('http://localhost:3001/api/animation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: selectedImage,
          animationType
        }),
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) {
        throw new (window as any).Error('Animation creation failed');
      }

      // For demo, use a placeholder gif
      setAnimationResult('https://via.placeholder.com/400x400/4285f4/ffffff?text=Animation+Result');
      
    } catch (error) {
      setError('Lỗi tạo animation. Vui lòng thử lại.');
      console.error('Animation error:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        🎬 Tạo Animation
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Chuyển đổi hình ảnh tĩnh thành animation sống động bằng công nghệ Wav2Lip và AI.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Input Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chọn hình ảnh
              </Typography>
              
              <Grid container spacing={2}>
                {sampleImages.map((image, index) => (
                  <Grid item xs={6} key={index}>
                    <Box
                      onClick={() => setSelectedImage(image)}
                      sx={{
                        cursor: 'pointer',
                        border: selectedImage === image ? '3px solid' : '2px solid',
                        borderColor: selectedImage === image ? 'primary.main' : 'grey.300',
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <Box
                        component="img"
                        src={image}
                        alt={`Portrait ${index + 1}`}
                        sx={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      {selectedImage === image && (
                        <Chip
                          label="Đã chọn"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Loại Animation
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Chọn loại animation</InputLabel>
                <Select
                  value={animationType}
                  label="Chọn loại animation"
                  onChange={(e) => setAnimationType(e.target.value)}
                >
                  {animationTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {type.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description} - {type.duration}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Animation />}
                onClick={createAnimation}
                disabled={isProcessing || !selectedImage}
                sx={{ mb: 2 }}
              >
                {isProcessing ? 'Đang xử lý...' : 'Tạo Animation'}
              </Button>

              {isProcessing && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Đang tạo animation... {progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Thời gian ước tính: {animationTypes.find(t => t.id === animationType)?.duration}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Result Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kết quả Animation
              </Typography>

              {!animationResult && !isProcessing && (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}
                >
                  <Typography color="text.secondary">
                    Animation sẽ hiển thị ở đây
                  </Typography>
                </Box>
              )}

              {animationResult && (
                <Box>
                  <Box
                    component="img"
                    src={animationResult}
                    alt="Animation Result"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.300'
                    }}
                  />
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                    >
                      Phát
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Pause />}
                    >
                      Dừng
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      href={animationResult}
                      download="animation.gif"
                    >
                      Tải xuống
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ✨ Animation đã được tạo thành công!
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bạn có thể tiếp tục nâng cấp lên 4K hoặc tạo video
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnimationPage;