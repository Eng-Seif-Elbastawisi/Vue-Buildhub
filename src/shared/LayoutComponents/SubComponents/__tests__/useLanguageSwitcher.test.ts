import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useLanguageSwitcher } from '../useLanguageSwitcher';

const TestSwitcher = {
  setup: useLanguageSwitcher,
  template: '<button type="button" @click="toggleLanguage">{{ currentLanguage }}</button>',
};
const originalPlugins = config.global.plugins;

describe('useLanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('lang');
    document.documentElement.removeAttribute('dir');
    document.body.removeAttribute('dir');
  });

  afterEach(() => {
    config.global.plugins = originalPlugins;
  });

  it('persists the selected language and updates document direction for dashboard navigation', async () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {}, ar: {} } });
    config.global.plugins = [i18n];
    const wrapper = mount(TestSwitcher);

    await wrapper.get('button').trigger('click');

    expect(i18n.global.locale.value).toBe('ar');
    expect(localStorage.getItem('locale')).toBe('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.body.dir).toBe('rtl');

    await wrapper.get('button').trigger('click');

    expect(i18n.global.locale.value).toBe('en');
    expect(localStorage.getItem('locale')).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
