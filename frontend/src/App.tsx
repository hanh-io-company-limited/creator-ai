import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import GenerationPage from './pages/GenerationPage';
import AnimationPage from './pages/AnimationPage';
import VideoPage from './pages/VideoPage';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎨 Creator AI - Tạo Avatar và Video AI
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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