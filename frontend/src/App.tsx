import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import { TrackingProvider } from './contexts/TrackingContext';
import { ModalProvider } from './contexts/ModalContext';
import StartPage from './pages/StartPage';
import GameRouter from './components/GameRouter';
import AdminPageSimple from './pages/AdminPage';
import EditQuestionsPage from './pages/EditQuestionsPage';
import AboutPage from './components/AboutPage';
import ComponentsShowcase from './pages/ComponentsShowcase';
import ModalRenderer from './components/ModalRenderer';
import './App.css';
import { useEffect } from 'react';
import { env } from './env';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ModalProvider>
          <SocketProvider>
            <TrackingProvider>
              <Routes>
                {/* Start page */}
                <Route path="/" element={<StartPage />} />
                
                {/* Game routes - all under /game/:gameId/* */}
                <Route path="/game/:gameId/*" element={<GameRouter />} />
                
                {/* Admin page */}
                <Route path="/admin" element={<AdminPageSimple />} />
                <Route path="/admin/edit_questions" element={<EditQuestionsPage />} />
                
                {/* Menu pages - now as proper routes */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/components" element={<ComponentsShowcase />} />
              </Routes>
              
              {/* Global modal renderer - enables modals across all routes */}
              <ModalRenderer />
            </TrackingProvider>
          </SocketProvider>
        </ModalProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
