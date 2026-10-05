import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import LoginLanguageSwitcher from '../LoginLanguageSwitcher.vue';

const originalPlugins = config.global.plugins;

describe('LoginLanguageSwitcher.vue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    config.global.plugins = originalPlugins;
  });

  it('shows a translated switch action without submitting the login form', async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          auth_switch_to_arabic: 'Switch language to Arabic',
          auth_switch_to_english: 'Switch language to English',
        },
        ar: {
          auth_switch_to_arabic: 'التبديل إلى العربية',
          auth_switch_to_english: 'التبديل إلى الإنجليزية',
        },
      },
    });
    config.global.plugins = [i18n];
    const wrapper = mount(LoginLanguageSwitcher, {
      global: { mocks: { $t: (key: string) => i18n.global.t(key) } },
    });
    const button = wrapper.get('button');

    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-label')).toBe('Switch language to Arabic');
    expect(button.text()).toContain('EN');

    await button.trigger('click');

    expect(button.attributes('aria-label')).toBe('التبديل إلى الإنجليزية');
    expect(button.text()).toContain('AR');
  });
});
