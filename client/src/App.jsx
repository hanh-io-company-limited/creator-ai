import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GlobalStyle } from './styles/GlobalStyle';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

// Components
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/UI/LoadingScreen';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TextGeneration from './pages/TextGeneration';
import ImageGeneration from './pages/ImageGeneration';
import SpeechRecognition from './pages/SpeechRecognition';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/text" element={
          <ProtectedRoute>
            <Layout>
              <TextGeneration />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/image" element={
          <ProtectedRoute>
            <Layout>
              <ImageGeneration />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/speech" element={
          <ProtectedRoute>
            <Layout>
              <SpeechRecognition />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const initApp = async () => {
      try {
        // Check if API is available
        const response = await fetch('/api/health');
        if (response.ok) {
          console.log('✅ API server is running');
        }
      } catch (error) {
        console.warn('⚠️ API server is not available');
      } finally {
        // Always mark as initialized after check
        setTimeout(() => {
          setIsInitialized(true);
        }, 1000); // Minimum loading time for better UX
      }
    };

    initApp();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <>
      <GlobalStyle />
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f9fafb',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </AuthProvider>
    </>
  );
}

export default App;