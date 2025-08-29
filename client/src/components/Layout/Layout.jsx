import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiEdit, 
  FiImage, 
  FiMic, 
  FiSettings, 
  FiLogOut, 
  FiUser,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth.jsx';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: var(--primary-gradient);
  position: relative;
`;

const Sidebar = styled(motion.aside)`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 0;
  z-index: 1000;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
`;

const SidebarHeader = styled.div`
  padding: 0 2rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
`;

const Logo = styled.h1`
  font-family: var(--font-family-display);
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
`;

const Nav = styled.nav`
  padding: 0 1rem;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    text-decoration: none;
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
`;

const UserSection = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 1rem;
  right: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserInfo = styled.div`
  color: white;
  margin-bottom: 1rem;
`;

const UserName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  opacity: 0.7;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const MainContent = styled.main`
  margin-left: 280px;
  min-height: 100vh;
  padding: 2rem;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  color: white;
  padding: 0.75rem;
  font-size: 1.25rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Tạo văn bản', href: '/text', icon: FiEdit },
    { name: 'Tạo hình ảnh', href: '/image', icon: FiImage },
    { name: 'Nhận diện giọng nói', href: '/speech', icon: FiMic },
    { name: 'Cài đặt', href: '/settings', icon: FiSettings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <LayoutContainer>
      <MobileMenuButton
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </MobileMenuButton>

      {sidebarOpen && <Overlay onClick={closeSidebar} />}

      <Sidebar
        className={sidebarOpen ? 'open' : ''}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <SidebarHeader>
          <Logo>Creator AI</Logo>
          <Subtitle>Hệ thống AI Sáng tạo</Subtitle>
        </SidebarHeader>

        <Nav>
          <NavList>
            {navigation.map((item) => (
              <NavItem key={item.name}>
                <NavLink
                  to={item.href}
                  className={location.pathname === item.href ? 'active' : ''}
                  onClick={closeSidebar}
                >
                  <item.icon />
                  {item.name}
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </Nav>

        <UserSection>
          <UserInfo>
            <UserName>
              <FiUser style={{ display: 'inline', marginRight: '0.5rem' }} />
              {user?.username}
            </UserName>
            <UserEmail>{user?.email}</UserEmail>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut />
            Đăng xuất
          </LogoutButton>
        </UserSection>
      </Sidebar>

      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
};

export default Layout;