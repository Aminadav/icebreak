import { LanguageProvider } from './contexts/LanguageContext';
import { SocketProvider } from './contexts/SocketContext';
import './App.css';
import HomePage from './pages/HomePage';

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <SocketProvider>
        <div className="text-center">
          <HomePage />
        </div>
      </SocketProvider>
    </LanguageProvider>
  );
}

export default App;
