import { LanguageProvider } from './contexts/LanguageContext';
import { GameProvider } from './contexts/GameContext';
import './App.css';
import HomePage from './pages/HomePage';

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <GameProvider>
        <div className="text-center">
          <HomePage />
        </div>
      </GameProvider>
    </LanguageProvider>
  );
}

export default App;
