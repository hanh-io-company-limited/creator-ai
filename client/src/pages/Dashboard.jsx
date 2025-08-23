import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiEdit, 
  FiImage, 
  FiMic, 
  FiActivity, 
  FiTrendingUp,
  FiStar,
  FiClock
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.jsx';
import axios from 'axios';

const DashboardContainer = styled.div`
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
`;

const WelcomeTitle = styled.h1`
  font-family: var(--font-family-display);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-family-display);
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ActionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
  }
`;

const ActionCardHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  align-items: center;
`;

const ActionIcon = styled.div`
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.9;
`;

const ActionInfo = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  font-family: var(--font-family-display);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  opacity: 0.7;
  line-height: 1.4;
`;

const ActionCardBody = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius-md);
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    color: white;
  }
`;

const SystemStatusSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  color: white;
`;

const StatusTitle = styled.h3`
  font-family: var(--font-family-display);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
`;

const StatusLabel = styled.span`
  font-size: 0.875rem;
`;

const StatusIndicator = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.status === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.status === 'online' ? '#10b981' : '#ef4444'};
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState({
    gpt: { available: false },
    stableDiffusion: { available: false },
    whisper: { available: false }
  });

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await axios.get('/api/ai/models/status');
        setSystemStatus(response.data.data.models);
      } catch (error) {
        console.warn('Could not fetch system status:', error);
      }
    };

    fetchSystemStatus();
  }, []);

  const stats = [
    {
      icon: <FiEdit />,
      title: 'Văn bản đã tạo',
      value: '0',
    },
    {
      icon: <FiImage />,
      title: 'Hình ảnh đã tạo',
      value: '0',
    },
    {
      icon: <FiMic />,
      title: 'File âm thanh xử lý',
      value: '0',
    },
    {
      icon: <FiClock />,
      title: 'Thời gian sử dụng',
      value: '< 1h',
    },
  ];

  const actions = [
    {
      icon: <FiEdit />,
      title: 'Tạo văn bản với AI',
      description: 'Sử dụng GPT để tạo văn bản sáng tạo, viết lách và hỗ trợ nội dung',
      link: '/text',
    },
    {
      icon: <FiImage />,
      title: 'Tạo hình ảnh nghệ thuật',
      description: 'Sử dụng Stable Diffusion để tạo ra những hình ảnh nghệ thuật độc đáo',
      link: '/image',
    },
    {
      icon: <FiMic />,
      title: 'Nhận diện giọng nói',
      description: 'Sử dụng Whisper để chuyển đổi giọng nói thành văn bản',
      link: '/speech',
    },
  ];

  return (
    <DashboardContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WelcomeTitle>
          Chào mừng, {user?.username}! 🎨
        </WelcomeTitle>
        <WelcomeSubtitle>
          Hệ thống Creator AI của bạn đã sẵn sàng. Hãy bắt đầu tạo ra những tác phẩm nghệ thuật tuyệt vời cùng với trí tuệ nhân tạo!
        </WelcomeSubtitle>
      </WelcomeSection>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <StatIcon>{stat.icon}</StatIcon>
            <StatTitle>{stat.title}</StatTitle>
            <StatValue>{stat.value}</StatValue>
          </StatCard>
        ))}
      </StatsGrid>

      <ActionsGrid>
        {actions.map((action, index) => (
          <ActionCard
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <ActionCardHeader>
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionInfo>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDescription>{action.description}</ActionDescription>
              </ActionInfo>
            </ActionCardHeader>
            <ActionCardBody>
              <ActionButton to={action.link}>
                Bắt đầu sáng tạo
              </ActionButton>
            </ActionCardBody>
          </ActionCard>
        ))}
      </ActionsGrid>

      <SystemStatusSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <StatusTitle>
          <FiActivity />
          Trạng thái hệ thống AI
        </StatusTitle>
        <StatusGrid>
          <StatusItem>
            <StatusLabel>GPT (Text AI)</StatusLabel>
            <StatusIndicator status={systemStatus.gpt?.available ? 'online' : 'offline'}>
              {systemStatus.gpt?.available ? 'Hoạt động' : 'Chưa kết nối'}
            </StatusIndicator>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Stable Diffusion</StatusLabel>
            <StatusIndicator status={systemStatus.stableDiffusion?.available ? 'online' : 'offline'}>
              {systemStatus.stableDiffusion?.available ? 'Hoạt động' : 'Chưa kết nối'}
            </StatusIndicator>
          </StatusItem>
          <StatusItem>
            <StatusLabel>Whisper (Speech AI)</StatusLabel>
            <StatusIndicator status={systemStatus.whisper?.available ? 'online' : 'offline'}>
              {systemStatus.whisper?.available ? 'Hoạt động' : 'Chưa kết nối'}
            </StatusIndicator>
          </StatusItem>
        </StatusGrid>
      </SystemStatusSection>
    </DashboardContainer>
  );
};

export default Dashboard;