import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiImage } from 'react-icons/fi';

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

const ImageGeneration = () => {
  return (
    <Container>
      <Header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>
          <FiImage />
          Tạo hình ảnh nghệ thuật
        </Title>
        <Subtitle>
          Sử dụng Stable Diffusion để tạo ra những hình ảnh nghệ thuật độc đáo và ấn tượng
        </Subtitle>
      </Header>

      <ComingSoon
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2>🚧 Đang phát triển</h2>
        <p>Tính năng tạo hình ảnh với AI đang được hoàn thiện và sẽ có mặt trong phiên bản tiếp theo.</p>
      </ComingSoon>
    </Container>
  );
};

export default ImageGeneration;