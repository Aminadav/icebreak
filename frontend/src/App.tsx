import { LanguageProvider } from './contexts/LanguageContext';
import { SimpleGameProvider } from './contexts/SimpleGameContext';
import './App.css';
import HomePage from './pages/HomePage';

function App(): JSX.Element {
  return (
    <LanguageProvider>
      <SimpleGameProvider>
        <div className="text-center">
          <HomePage />
        </div>
      </SimpleGameProvider>
    </LanguageProvider>
  );
}

export default App;
