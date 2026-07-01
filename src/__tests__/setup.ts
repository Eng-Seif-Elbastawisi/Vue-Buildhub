import { config } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { beforeEach, vi } from 'vitest';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import { useUserStore } from '@/stores/user';

const expandFlatMessages = (messages: Record<string, string>) => {
  const expanded: Record<string, unknown> = { ...messages };

  for (const [key, value] of Object.entries(messages)) {
    if (!key.includes('.')) continue;

    const parts = key.split('.');
    let current = expanded;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = value;
        return;
      }

      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }

      current = current[part] as Record<string, unknown>;
    });
  }

  return expanded;
};

const translate = (key: string, params?: Record<string, unknown>) => {
  const messages = en as Record<string, string>;
  const value = messages[key] ?? key;

  if (!params) return value;

  return Object.entries(params).reduce(
    (message, [param, replacement]) =>
      message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(replacement)),
    value,
  );
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: expandFlatMessages(en as Record<string, string>),
    ar: expandFlatMessages(ar as Record<string, string>),
  },
  missing: (_locale, key) => key,
});

config.global.plugins = [...(config.global.plugins ?? []), i18n];
config.global.mocks = {
  ...(config.global.mocks ?? {}),
  $t: translate,
  $d: (value: unknown) => value,
  $n: (value: unknown) => value,
  $tc: translate,
};

config.global.stubs = {
  ...(config.global.stubs ?? {}),
  Teleport: true,
  Transition: true,
  TransitionGroup: true,
};

const setDefaultUser = () => {
  setActivePinia(createPinia());
  useUserStore().setUser({ id: 1, name: 'Admin', type: 1, isMaster: true } as any);
};

setDefaultUser();

beforeEach(() => {
  setDefaultUser();
});

vi.stubGlobal('fetch', vi.fn());
