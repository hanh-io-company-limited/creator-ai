import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
`;

const LoadingContent = styled.div`
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 24px;
`;

const LoadingText = styled.h2`
  font-family: var(--font-family-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.9;
`;

const LoadingSubtext = styled.p`
  font-size: 1rem;
  opacity: 0.7;
  max-width: 300px;
  line-height: 1.5;
`;

const LoadingScreen = ({ message = 'Đang khởi tạo Creator AI...', subtext = 'Vui lòng đợi một chút...' }) => {
  return (
    <LoadingContainer>
      <LoadingContent>
        <Spinner />
        <LoadingText>{message}</LoadingText>
        <LoadingSubtext>{subtext}</LoadingSubtext>
      </LoadingContent>
    </LoadingContainer>
  );
};

export default LoadingScreen;