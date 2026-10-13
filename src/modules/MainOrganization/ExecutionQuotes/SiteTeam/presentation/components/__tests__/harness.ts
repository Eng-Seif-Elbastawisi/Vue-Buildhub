import { mount } from '@vue/test-utils';
import type { Component } from 'vue';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import { vi } from 'vitest';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
export function mountDialog(component: Component, props: Record<string, unknown> = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  return mount(component, {
    props: { visible: true, quoteId: 140, ...props },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', messages: { en, ar } })],
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
}
