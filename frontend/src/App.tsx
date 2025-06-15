import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import { NavigationProvider } from './contexts/NavigationContext';
import AppRouter from './components/AppRouter';
import './App.css';

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <SocketProvider>
        <NavigationProvider initialPage="home">
          <AppRouter />
        </NavigationProvider>
      </SocketProvider>
    </LanguageProvider>
  );
}

export default App;
