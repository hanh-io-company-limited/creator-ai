import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Chip,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Settings,
  Info,
  Wifi,
  WifiOff
} from '@mui/icons-material';

import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import GenerationPage from './pages/GenerationPage';
import AnimationPage from './pages/AnimationPage';
import VideoPage from './pages/VideoPage';
import { apiService } from './services/api';

function App() {
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [appVersion, setAppVersion] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Check server connection
    checkServerConnection();
    
    // Get app version
    getAppVersion();
    
    // Set up Electron menu handlers
    if (window.electronAPI) {
      window.electronAPI.onMenuNavigate((route: string) => {
        navigate(route);
      });
      
      window.electronAPI.onMenuNewProject(() => {
        navigate('/');
        // Could add logic to reset application state
      });
      
      window.electronAPI.onMenuOpenFolder((path: string) => {
        console.log('Open folder:', path);
        // Could add logic to load project from folder
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-navigate');
        window.electronAPI.removeAllListeners('menu-new-project');
        window.electronAPI.removeAllListeners('menu-open-folder');
      }
    };
  }, [navigate]);

  const checkServerConnection = async () => {
    try {
      await apiService.healthCheck();
      setServerStatus('connected');
    } catch (error) {
      setServerStatus('disconnected');
      console.error('Server connection failed:', error);
    }
  };

  const getAppVersion = async () => {
    try {
      const version = await apiService.getAppVersion();
      setAppVersion(version);
    } catch (error) {
      console.error('Failed to get app version:', error);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAbout = () => {
    // Could show about dialog or navigate to about page
    console.log('About Creator AI Desktop');
    handleMenuClose();
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎨 Creator AI Desktop {appVersion && `v${appVersion}`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={serverStatus === 'connected' ? <Wifi /> : <WifiOff />}
              label={serverStatus === 'connected' ? 'Sẵn sàng' : 'Đang kết nối...'}
              color={serverStatus === 'connected' ? 'success' : 'warning'}
              size="small"
              variant="filled"
            />
            
            <IconButton
              color="inherit"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              <Settings />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleAbout}>
                <ListItemIcon>
                  <Info fontSize="small" />
                </ListItemIcon>
                <ListItemText>Về Creator AI</ListItemText>
              </MenuItem>
              <MenuItem onClick={checkServerConnection}>
                <ListItemIcon>
                  <Wifi fontSize="small" />
                </ListItemIcon>
                <ListItemText>Kiểm tra kết nối</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {serverStatus === 'disconnected' && (
        <Alert severity="warning" sx={{ m: 2 }}>
          Không thể kết nối đến máy chủ nội bộ. Vui lòng khởi động lại ứng dụng.
        </Alert>
      )}
      
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: 2, 
          mb: 2, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'auto'
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/generation" element={<GenerationPage />} />
          <Route path="/animation" element={<AnimationPage />} />
          <Route path="/video" element={<VideoPage />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;