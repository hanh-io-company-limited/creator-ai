import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiZap, FiShield, FiGlobe } from 'react-icons/fi';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: var(--primary-gradient);
  position: relative;
  overflow: hidden;
`;

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  position: relative;
`;

const HeroContent = styled(motion.div)`
  max-width: 800px;
  color: white;
  z-index: 2;
`;

const HeroTitle = styled(motion.h1)`
  font-family: var(--font-family-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  background: ${props => props.primary ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    text-decoration: none;
    color: white;
  }

  svg {
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

const FeaturesSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  padding: 2rem;
  text-align: center;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
`;

const FeatureTitle = styled.h3`
  font-family: var(--font-family-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  opacity: 0.8;
  line-height: 1.6;
`;

const BackgroundElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s linear infinite;
  }

  @keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(-50px, -50px) rotate(360deg); }
  }
`;

const Home = () => {
  const features = [
    {
      icon: <FiZap />,
      title: 'AI Mạnh mẽ',
      description: 'Tích hợp GPT, Stable Diffusion, và Whisper cho khả năng sáng tạo vô hạn'
    },
    {
      icon: <FiShield />,
      title: 'Bảo mật Cao',
      description: 'Chạy trên máy chủ riêng với các biện pháp bảo mật tiên tiến'
    },
    {
      icon: <FiStar />,
      title: 'Giao diện Độc đáo',
      description: 'Thiết kế nghệ thuật thân thiện phản ánh phong cách cá nhân'
    },
    {
      icon: <FiGlobe />,
      title: 'Kết nối Web',
      description: 'Hoạt động trực tiếp trên web với domain riêng'
    }
  ];

  return (
    <HomeContainer>
      <BackgroundElements />
      
      <HeroSection>
        <HeroContent
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Creator AI
          </HeroTitle>
          
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Hệ thống AI sáng tạo độc lập với khả năng tạo văn bản, hình ảnh và nhận diện giọng nói. 
            Đồng hành cùng bạn trong mọi hoạt động sáng tạo.
          </HeroSubtitle>
          
          <CTAContainer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <CTAButton to="/register" primary>
              Bắt đầu sáng tạo
              <FiArrowRight />
            </CTAButton>
            <CTAButton to="/login">
              Đăng nhập
            </CTAButton>
          </CTAContainer>

          <FeaturesSection>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesSection>
        </HeroContent>
      </HeroSection>
    </HomeContainer>
  );
};

export default Home;