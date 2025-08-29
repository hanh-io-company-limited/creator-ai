import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingScreen from '../components/UI/LoadingScreen';

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const RegisterCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  color: white;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: color 0.2s ease;

  &:hover {
    color: white;
    text-decoration: none;
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-display);
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  text-align: center;
  opacity: 0.8;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  opacity: 0.9;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  padding-left: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  z-index: 1;
  opacity: 0.7;
  font-size: 1.1rem;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0;
  font-size: 1.1rem;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius-md);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  opacity: 0.8;
  
  a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  color: white;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tạo tài khoản..." />;
  }

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BackButton to="/">
          <FiArrowLeft />
          Quay lại
        </BackButton>

        <Title>Đăng ký</Title>
        <Subtitle>Tạo tài khoản để bắt đầu sáng tạo cùng AI</Subtitle>

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel htmlFor="username">Tên đăng nhập</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FiUser />
              </InputIcon>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </InputWrapper>
            {errors.username && (
              <ErrorMessage style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {errors.username}
              </ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="email">Email</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FiMail />
              </InputIcon>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </InputWrapper>
            {errors.email && (
              <ErrorMessage style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {errors.email}
              </ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="password">Mật khẩu</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputWrapper>
            {errors.password && (
              <ErrorMessage style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {errors.password}
              </ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="confirmPassword">Xác nhận mật khẩu</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputWrapper>
            {errors.confirmPassword && (
              <ErrorMessage style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {errors.confirmPassword}
              </ErrorMessage>
            )}
          </InputGroup>

          <SubmitButton 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </SubmitButton>
        </Form>

        <LinkText>
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập ngay</Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;