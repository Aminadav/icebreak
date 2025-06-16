import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { TrackingProvider } from './contexts/TrackingContext';
import { ModalProvider } from './contexts/ModalContext';
import AppRouter from './components/AppRouter';
import HomePage from './pages/HomePage';
import AdminPageSimple from './pages/AdminPageSimple';
import './App.css';

function App(): JSX.Element {
  // Determine initial component based on URL path
  const getInitialComponent = () => {
    const path = window.location.pathname;
    console.log('🛣️ Current URL path:', path);
    
    switch (path) {
      case '/admin':
        console.log('🔧 Loading admin page from URL');
        return <AdminPageSimple />;
      default:
        console.log('🏠 Loading home page as default');
        return <HomePage />;
    }
  };

  return (
    <LanguageProvider>
      <ModalProvider>
        <NavigationProvider initialComponent={getInitialComponent()}>
          <SocketProvider>
            <TrackingProvider>
              <AppRouter />
            </TrackingProvider>
          </SocketProvider>
        </NavigationProvider>
      </ModalProvider>
    </LanguageProvider>
  );
}

export default App;
