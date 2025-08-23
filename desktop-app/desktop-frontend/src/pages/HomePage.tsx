import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CloudUpload,
  AutoAwesome,
  Animation,
  HighQuality,
  VideoLibrary
} from '@mui/icons-material';

const steps = [
  {
    label: 'Tải lên hình ảnh',
    description: 'Tải lên 10 bức hình để huấn luyện mô hình diện mạo cá nhân',
    icon: <CloudUpload />,
    route: '/upload'
  },
  {
    label: 'Tạo diện mạo từ lời nhắc',
    description: 'Sử dụng AI để tạo hình ảnh đẹp từ mô tả văn bản',
    icon: <AutoAwesome />,
    route: '/generation'
  },
  {
    label: 'Chuyển thành animation',
    description: 'Biến hình ảnh thành mô hình động với Wav2Lip',
    icon: <Animation />,
    route: '/animation'
  },
  {
    label: 'Nâng cấp lên 4K',
    description: 'Tăng chất lượng hình ảnh lên độ phân giải cao',
    icon: <HighQuality />,
    route: '/animation'
  },
  {
    label: 'Tạo video cuối cùng',
    description: 'Đồng bộ âm thanh và tạo video hoàn chỉnh',
    icon: <VideoLibrary />,
    route: '/video'
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🎨 Creator AI
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Hệ thống tạo Avatar và Video AI
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
          Tạo ra avatar cá nhân và video chất lượng cao bằng công nghệ AI tiên tiến. 
          Từ hình ảnh cá nhân đến video hoàn chỉnh chỉ trong vài bước đơn giản.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                🚀 Bắt đầu ngay
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tải lên hình ảnh của bạn và bắt đầu tạo avatar AI
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="large" 
                variant="contained" 
                onClick={() => navigate('/upload')}
                startIcon={<CloudUpload />}
              >
                Tải lên hình ảnh
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                ✨ Tính năng nổi bật
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>Huấn luyện mô hình AI từ hình ảnh cá nhân</li>
                <li>Tạo hình ảnh từ mô tả văn bản</li>
                <li>Chuyển đổi thành animation sống động</li>
                <li>Nâng cấp chất lượng lên 4K</li>
                <li>Tạo video với đồng bộ âm thanh</li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
          Quy trình tạo
        </Typography>
        
        <Stepper orientation="vertical" sx={{ mt: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label} active={true}>
              <StepLabel icon={step.icon}>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(step.route)}
                  sx={{ mr: 1 }}
                >
                  Bắt đầu
                </Button>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Container>
  );
};

export default HomePage;