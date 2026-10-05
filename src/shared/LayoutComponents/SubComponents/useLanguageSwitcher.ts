import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export type Language = 'ar' | 'en';

export const useLanguageSwitcher = () => {
  const { locale } = useI18n({ useScope: 'global' });
  const currentLanguage = computed<Language>(() => (locale.value === 'ar' ? 'ar' : 'en'));
  const nextLanguage = computed<Language>(() => (currentLanguage.value === 'ar' ? 'en' : 'ar'));

  const setLanguage = (language: Language) => {
    locale.value = language;
    localStorage.setItem('locale', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => setLanguage(nextLanguage.value);

  return { currentLanguage, nextLanguage, setLanguage, toggleLanguage };
};
