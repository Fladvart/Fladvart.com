import { readFileSync } from 'fs';
import { join } from 'path';

type Locale = 'en' | 'tr';

const translations: Record<Locale, any> = {
  en: {},
  tr: {}
};

// Load translations
function loadTranslations() {
  try {
    const enPath = join(process.cwd(), 'public', 'locales', 'en.json');
    const trPath = join(process.cwd(), 'public', 'locales', 'tr.json');
    
    translations.en = JSON.parse(readFileSync(enPath, 'utf-8'));
    translations.tr = JSON.parse(readFileSync(trPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
}

// Load translations on module initialization
loadTranslations();

export function getTranslation(key: string, locale: Locale = 'en'): string {
  // If translations are empty, try loading again
  if (Object.keys(translations[locale]).length === 0) {
    loadTranslations();
  }
  
  const translation = translations[locale]?.[key];
  
  // Fallback to English if translation not found
  if (!translation && locale !== 'en') {
    return translations.en?.[key] || key;
  }
  
  return translation || key;
}

export function getLocaleFromRequest(request: Request): Locale {
  // Try to get locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  
  if (acceptLanguage) {
    const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (primaryLang === 'tr') {
      return 'tr';
    }
  }
  
  // Check for custom locale header
  const customLocale = request.headers.get('x-locale');
  if (customLocale === 'tr' || customLocale === 'en') {
    return customLocale;
  }
  
  // Default to English
  return 'en';
}
