import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { TrackingProvider } from './contexts/TrackingContext';
import AppRouter from './components/AppRouter';
import HomePage from './pages/HomePage';
import './App.css';

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <SocketProvider>
        <TrackingProvider>
          <NavigationProvider initialComponent={<HomePage />}>
            <AppRouter />
          </NavigationProvider>
        </TrackingProvider>
      </SocketProvider>
    </LanguageProvider>
  );
}

export default App;
