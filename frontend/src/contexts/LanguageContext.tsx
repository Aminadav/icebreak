import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getText, setLanguage as setGlobalLanguage } from '../localization/texts';

interface LanguageContextType {
  language: Language;
  texts: ReturnType<typeof getText>;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('he');
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setGlobalLanguage(lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
  };

  useEffect(() => {
    // Set initial document direction
    document.dir = getText(language).direction;
  }, [language]);

  const value = {
    language,
    texts: getText(language),
    setLanguage,
    toggleLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
