import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  AutoAwesome,
  Download,
  Refresh
} from '@mui/icons-material';

const GenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [resolution, setResolution] = useState('512x512');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles = [
    { id: 'realistic', name: 'Thực tế', description: 'Phong cách thực tế, giống ảnh chụp' },
    { id: 'artistic', name: 'Nghệ thuật', description: 'Phong cách nghệ thuật, sáng tạo' },
    { id: 'anime', name: 'Anime', description: 'Phong cách anime/manga Nhật Bản' },
    { id: 'cartoon', name: 'Hoạt hình', description: 'Phong cách hoạt hình vui nhộn' },
    { id: 'portrait', name: 'Chân dung', description: 'Tập trung vào khuôn mặt và biểu cảm' }
  ];

  const resolutions = [
    '512x512',
    '768x768', 
    '1024x1024'
  ];

  const samplePrompts = [
    'Chân dung chuyên nghiệp của một người với nụ cười tự tin',
    'Hình ảnh phong cách nghệ thuật với ánh sáng ấm áp',
    'Chân dung phong cách anime với mắt to và tóc đẹp',
    'Hình ảnh chuyên nghiệp cho LinkedIn với vest lịch sự'
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả để tạo hình ảnh');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          resolution
        }),
      });

      if (!response.ok) {
        throw new (window as any).Error('Generation failed');
      }

      const result = await response.json();
      // For demo, use a placeholder image
      setGeneratedImage('https://via.placeholder.com/512x512/4285f4/ffffff?text=Generated+Image');
      
    } catch (error) {
      setError('Lỗi tạo hình ảnh. Vui lòng thử lại.');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ✨ Tạo hình ảnh từ lời nhắc
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Sử dụng AI để tạo ra hình ảnh đẹp và chi tiết từ mô tả văn bản của bạn.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Input Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cài đặt tạo ảnh
              </Typography>

              <TextField
                label="Mô tả hình ảnh"
                multiline
                rows={4}
                fullWidth
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Chân dung chuyên nghiệp của một người với nụ cười tự tin, ánh sáng tự nhiên..."
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Phong cách</InputLabel>
                <Select
                  value={style}
                  label="Phong cách"
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {styles.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} - {s.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Độ phân giải</InputLabel>
                <Select
                  value={resolution}
                  label="Độ phân giải"
                  onChange={(e) => setResolution(e.target.value)}
                >
                  {resolutions.map((res) => (
                    <MenuItem key={res} value={res}>
                      {res}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<AutoAwesome />}
                onClick={generateImage}
                disabled={isGenerating}
                sx={{ mb: 2 }}
              >
                {isGenerating ? 'Đang tạo...' : 'Tạo hình ảnh'}
              </Button>

              {isGenerating && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Đang xử lý với AI...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Sample Prompts */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gợi ý mô tả
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {samplePrompts.map((sample, index) => (
                  <Chip
                    key={index}
                    label={sample}
                    variant="outlined"
                    onClick={() => setPrompt(sample)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Result Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kết quả
              </Typography>

              {!generatedImage && !isGenerating && (
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
                    Hình ảnh sẽ hiển thị ở đây
                  </Typography>
                </Box>
              )}

              {generatedImage && (
                <Box>
                  <Box
                    component="img"
                    src={generatedImage}
                    alt="Generated"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1
                    }}
                  />
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      href={generatedImage}
                      download="generated-image.png"
                    >
                      Tải xuống
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={generateImage}
                      disabled={isGenerating}
                    >
                      Tạo lại
                    </Button>
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

export default GenerationPage;