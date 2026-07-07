import { createI18n } from 'vue-i18n';
import ar from './ar.json';
import en from './en.json';

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ar,
  },
});

export const translate = (key: string, params?: Record<string, unknown>): string => {
  const globalI18n = i18n.global as any;

  return params ? globalI18n.t(key, params) : globalI18n.t(key);
};

export const hasTranslation = (key: string): boolean => {
  const globalI18n = i18n.global as any;

  return globalI18n.te(key);
};

export const translateIfExists = (value?: string): string => {
  if (!value) return '';

  return hasTranslation(value) ? translate(value) : value;
};

export default i18n;
