import { LanguageProvider } from './contexts/LanguageContext';
import ButtonShowcase from './pages/ButtonShowcase';
import './App.css';
import HomePage from './pages/HomePage';

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <div className="text-center">
        <HomePage />
      </div>
    </LanguageProvider>
  );
}

export default App;
