import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  CheckCircle,
  Visibility
} from '@mui/icons-material';
import { apiService } from '../services/api';

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  url: string;
}

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > 10) {
      setError('Chỉ được tải lên tối đa 10 hình ảnh');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('images', file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 10;
        });
      }, 200);

      const result = await apiService.uploadImages(acceptedFiles);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setFiles(prev => [...prev, ...result.files]);
      setSessionId(result.sessionId);
      
    } catch (error) {
      setError('Lỗi tải lên hình ảnh. Vui lòng thử lại.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10 - files.length,
    disabled: isUploading
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startTraining = async () => {
    if (!sessionId) return;
    
    try {
      const result = await apiService.startTraining(sessionId);
      
      // Redirect to training status page or show success message
      alert(`Bắt đầu huấn luyện mô hình! Thời gian ước tính: ${result.estimatedTime}`);
      
    } catch (error) {
      setError('Lỗi khởi động quá trình huấn luyện');
      console.error('Training error:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        📤 Tải lên hình ảnh huấn luyện
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tải lên 5-10 hình ảnh chân dung của bạn để huấn luyện mô hình AI cá nhân. 
        Hình ảnh nên rõ nét, nhiều góc độ khác nhau và có ánh sáng tốt.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'action.hover' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Thả hình ảnh vào đây...' : 'Kéo thả hoặc click để chọn hình ảnh'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hỗ trợ định dạng: JPEG, PNG, WebP (Tối đa 10MB mỗi file)
            </Typography>
            <Chip 
              label={`${files.length}/10 hình ảnh`} 
              color={files.length >= 5 ? 'success' : 'default'}
              sx={{ mt: 2 }}
            />
          </Box>

          {isUploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Đang tải lên... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hình ảnh đã tải lên ({files.length})
            </Typography>
            
            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid item xs={6} sm={4} md={3} key={file.id}>
                  <Card>
                    <Box
                      sx={{
                        height: 120,
                        backgroundImage: `url(${file.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          display: 'flex',
                          gap: 1
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => setPreviewFile(file)}
                          sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => removeFile(file.id)}
                          sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" noWrap>
                        {file.originalName}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {Math.round(file.size / 1024)} KB
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {files.length >= 5 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircle />}
                  onClick={startTraining}
                  disabled={isUploading}
                >
                  Bắt đầu huấn luyện mô hình
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Quá trình huấn luyện sẽ mất 10-15 phút
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xem trước hình ảnh</DialogTitle>
        <DialogContent>
          {previewFile && (
            <Box
              component="img"
              src={previewFile.url}
              alt={previewFile.originalName}
              sx={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadPage;