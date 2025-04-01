
import React, { useEffect } from 'react';
import LoginPage from '../components/auth/LoginPage';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return <LoginPage />;
};

export default Index;
