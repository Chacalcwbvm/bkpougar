
import React, { createContext, useState, useContext, ReactNode } from "react";
import translations from "../translations";
import { Language, LanguageContextType } from "../types/language";

// Create a context with a default value
const LanguageContext = createContext<LanguageContextType>({
  language: "pt",
  setLanguage: () => {},
  translations,
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Default to Portuguese language
  const [language, setLanguage] = useState<Language>("pt");

  // Translation function
  const t = (key: string): string => {
    // Get the current language translations
    const currentTranslations = translations[language];
    
    // Handle nested keys with dot notation (e.g., "rooms.name")
    const keyParts = key.split('.');
    
    if (keyParts.length === 1) {
      // Simple key
      const value = currentTranslations[key];
      return typeof value === 'string' ? value : key;
    } else {
      // Nested key
      let current: any = currentTranslations;
      
      for (const part of keyParts) {
        if (!current || typeof current !== 'object') {
          return key; // Key path doesn't exist
        }
        current = current[part];
      }
      
      return typeof current === 'string' ? current : key;
    }
  };

  const value = {
    language,
    setLanguage,
    translations,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
