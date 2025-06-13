import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../stores/uiStore';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useUIStore();

  const handleLanguageChange = (newLanguage: 'he' | 'en') => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <button
        onClick={() => handleLanguageChange('he')}
        className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'he'
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        🇮🇱 עברית
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        🇺🇸 English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
