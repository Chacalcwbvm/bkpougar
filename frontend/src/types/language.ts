
export type Language = "en" | "pt";

// Recursive type that allows for nested translations
export type TranslationRecord = {
  [key: string]: string | TranslationRecord;
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Record<Language, TranslationRecord>;
  t: (key: string) => string;
}
