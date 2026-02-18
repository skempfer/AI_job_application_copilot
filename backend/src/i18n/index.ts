import { en, ErrorMessages } from './en.js';
import { pt } from './pt.js';

type Language = 'en' | 'pt';

const translations = {
  en,
  pt,
};

export function getErrorMessage(
  key: keyof ErrorMessages,
  language: Language = 'en',
  replacements?: Record<string, string>
): string {
  const lang = translations[language] || translations.en;
  let message = lang.errors[key] || translations.en.errors[key];

  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      message = message.replace(`{{${placeholder}}}`, value);
    });
  }

  return message;
}

export function getLanguageFromRequest(language?: string): Language {
  if (language === 'pt' || language === 'en') {
    return language;
  }
  return 'en';
}

export { en, pt };
export type { ErrorMessages, Language };
