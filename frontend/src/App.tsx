import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import { NavigationProvider } from './contexts/NavigationContext';
import AppRouter from './components/AppRouter';
import HomePage from './pages/HomePage';
import './App.css';

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <SocketProvider>
        <NavigationProvider initialComponent={<HomePage />}>
          <AppRouter />
        </NavigationProvider>
      </SocketProvider>
    </LanguageProvider>
  );
}

export default App;
