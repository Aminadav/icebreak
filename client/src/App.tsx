import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { socketService } from './services/socketService';

// Components
import Layout from './components/Layout/Layout';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import HomePage from './components/Home/HomePage';
import GameRoom from './components/Game/GameRoom';
import CreateRoom from './components/Game/CreateRoom';
import JoinRoom from './components/Game/JoinRoom';

// i18n
import './i18n';

function App() {
  const { isAuthenticated, token } = useAuthStore();
  const { language, setLanguage } = useUIStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initialize i18n language
    i18n.changeLanguage(language);
    setLanguage(language); // This will also set RTL
  }, [language, setLanguage, i18n]);

  useEffect(() => {
    // Connect to socket when authenticated
    if (isAuthenticated && token) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<GameRoom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
