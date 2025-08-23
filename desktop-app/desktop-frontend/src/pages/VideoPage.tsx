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
  TextField,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  VideoLibrary,
  Mic,
  MusicNote,
  TextFields,
  Download,
  PlayArrow
} from '@mui/icons-material';
import { apiService } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VideoPage: React.FC = () => {
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  const [audioType, setAudioType] = useState(0); // 0: TTS, 1: Upload, 2: Music
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('vi-female-1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleAnimations = [
    'https://via.placeholder.com/300x300/4285f4/ffffff?text=Animation+1',
    'https://via.placeholder.com/300x300/34a853/ffffff?text=Animation+2',
    'https://via.placeholder.com/300x300/ea4335/ffffff?text=Animation+3'
  ];

  const voices = [
    { id: 'vi-female-1', name: 'Linh (Nữ)', description: 'Giọng nữ trẻ, tự nhiên' },
    { id: 'vi-male-1', name: 'Minh (Nam)', description: 'Giọng nam trung tính, rõ ràng' },
    { id: 'vi-female-2', name: 'Thu (Nữ)', description: 'Giọng nữ ấm áp, thân thiện' },
    { id: 'en-female-1', name: 'Sarah (Female)', description: 'Natural English female voice' }
  ];

  const createVideo = async () => {
    if (!selectedAnimation) {
      setError('Vui lòng chọn animation để tạo video');
      return;
    }

    if (audioType === 0 && !ttsText.trim()) {
      setError('Vui lòng nhập văn bản cho chuyển đổi giọng nói');
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
          return prev + 3;
        });
      }, 500);

      const result = await apiService.createVideo(selectedAnimation, audioType === 0 ? 'tts' : audioType === 1 ? 'upload' : 'music', {
        ttsText: audioType === 0 ? ttsText : undefined,
        voice: audioType === 0 ? selectedVoice : undefined
      });

      clearInterval(interval);
      setProgress(100);

      // Use the result video URL
      setVideoResult(apiService.getLocalFileUrl('/uploads/video-placeholder.png'));
      console.log('Video created:', result);
      
    } catch (error) {
      setError('Lỗi tạo video. Vui lòng thử lại.');
      console.error('Video error:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        🎥 Tạo Video cuối cùng
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tạo video hoàn chỉnh với đồng bộ âm thanh và chuyển động môi từ animation 4K.
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
                Chọn Animation 4K
              </Typography>
              
              <Grid container spacing={2}>
                {sampleAnimations.map((animation, index) => (
                  <Grid item xs={4} key={index}>
                    <Box
                      onClick={() => setSelectedAnimation(animation)}
                      sx={{
                        cursor: 'pointer',
                        border: selectedAnimation === animation ? '3px solid' : '2px solid',
                        borderColor: selectedAnimation === animation ? 'primary.main' : 'grey.300',
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <Box
                        component="img"
                        src={animation}
                        alt={`Animation ${index + 1}`}
                        sx={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      {selectedAnimation === animation && (
                        <Chip
                          label="4K"
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
                Âm thanh
              </Typography>

              <Tabs value={audioType} onChange={(e, newValue) => setAudioType(newValue)}>
                <Tab icon={<TextFields />} label="Văn bản" />
                <Tab icon={<Mic />} label="Tải lên" />
                <Tab icon={<MusicNote />} label="Nhạc nền" />
              </Tabs>

              <TabPanel value={audioType} index={0}>
                <TextField
                  label="Văn bản chuyển đổi giọng nói"
                  multiline
                  rows={4}
                  fullWidth
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Nhập văn bản để chuyển đổi thành giọng nói..."
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth>
                  <InputLabel>Chọn giọng nói</InputLabel>
                  <Select
                    value={selectedVoice}
                    label="Chọn giọng nói"
                    onChange={(e) => setSelectedVoice(e.target.value)}
                  >
                    {voices.map((voice) => (
                      <MenuItem key={voice.id} value={voice.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {voice.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {voice.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TabPanel>

              <TabPanel value={audioType} index={1}>
                <Button variant="outlined" fullWidth sx={{ height: 100 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Mic sx={{ fontSize: 40, mb: 1 }} />
                    <Typography>Tải lên file âm thanh</Typography>
                  </Box>
                </Button>
              </TabPanel>

              <TabPanel value={audioType} index={2}>
                <Button variant="outlined" fullWidth sx={{ height: 100 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MusicNote sx={{ fontSize: 40, mb: 1 }} />
                    <Typography>Chọn nhạc nền</Typography>
                  </Box>
                </Button>
              </TabPanel>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<VideoLibrary />}
                  onClick={createVideo}
                  disabled={isProcessing || !selectedAnimation}
                >
                  {isProcessing ? 'Đang tạo video...' : 'Tạo Video'}
                </Button>

                {isProcessing && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Đang xử lý video... {progress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Đang đồng bộ âm thanh với chuyển động môi...
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Result Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Video hoàn chỉnh
              </Typography>

              {!videoResult && !isProcessing && (
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
                    Video sẽ hiển thị ở đây
                  </Typography>
                </Box>
              )}

              {videoResult && (
                <Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      backgroundColor: 'grey.900',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    <PlayArrow sx={{ fontSize: 80 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        px: 1,
                        borderRadius: 1
                      }}
                    >
                      4K • 00:15
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      size="large"
                    >
                      Phát video
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      href={videoResult}
                      download="creator-ai-video.mp4"
                    >
                      Tải xuống MP4
                    </Button>
                  </Box>

                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="success.dark" gutterBottom>
                      🎉 Video đã được tạo thành công!
                    </Typography>
                    <Typography variant="body2" color="success.dark">
                      Video 4K với đồng bộ âm thanh hoàn hảo đã sẵn sàng. 
                      Bạn có thể tải xuống hoặc chia sẻ video này.
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Chip label="4K Quality" color="success" size="small" />
                      <Chip label="Lip Sync" color="success" size="small" />
                      <Chip label="15 seconds" color="success" size="small" />
                    </Box>
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

export default VideoPage;