import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSettings } from 'react-icons/fi';

const Container = styled.div`
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  text-align: center;
`;

const Title = styled.h1`
  font-family: var(--font-family-display);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    margin-right: 1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
  line-height: 1.6;
`;

const ComingSoon = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  padding: 3rem;
  color: white;
  text-align: center;
`;

const Settings = () => {
  return (
    <Container>
      <Header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>
          <FiSettings />
          Cài đặt hệ thống
        </Title>
        <Subtitle>
          Tùy chỉnh và cấu hình hệ thống Creator AI theo sở thích của bạn
        </Subtitle>
      </Header>

      <ComingSoon
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2>🚧 Đang phát triển</h2>
        <p>Trang cài đặt hệ thống đang được hoàn thiện và sẽ có mặt trong phiên bản tiếp theo.</p>
      </ComingSoon>
    </Container>
  );
};

export default Settings;