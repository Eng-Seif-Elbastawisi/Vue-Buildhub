import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import SiteInfoDialog from '../SiteInfoDialog.vue';
import EngineerSelectionDialog from '../EngineerSelectionDialog.vue';
import SiteTeamController from '../../controllers/site-team.controller';
import { mockNetwork } from '../../../__tests__/network';

let post: ReturnType<typeof mockNetwork>;
let wrapper: VueWrapper | undefined;
beforeEach(() => {
  post = mockNetwork();
  SiteTeamController.getInstance().activate(140);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  vi.unstubAllGlobals();
});

it.each(
  (['en', 'ar'] as const).flatMap((locale) => [
    { locale, component: SiteInfoDialog, label: 'site_team.delivery_date', help: 'delivery_date' },
    { locale, component: EngineerSelectionDialog, label: 'site_team.employees', help: 'employees' },
  ]),
)('opens $help help in $locale without saving or closing the form', async (scenario) => {
  const i18n = createI18n({
    legacy: false,
    locale: scenario.locale,
    messages: { en, ar },
  });
  wrapper = mount(scenario.component, {
    attachTo: document.body,
    props: { visible: true, quoteId: 140 },
    global: {
      plugins: [PrimeVue, i18n],
      mocks: { $t: i18n.global.t },
      stubs: { Dialog: { template: '<section><slot /></section>' }, Transition: false },
    },
  });
  await flushPromises();
  post.mockClear();
  const label = i18n.global.t(scenario.label);
  const helpButton = wrapper.get(
    `button[aria-label="${i18n.global.t('field_help.show_for', { field: label })}"]`,
  );
  await helpButton.trigger('click');
  await flushPromises();
  expect(wrapper.get('[role="dialog"]').text()).toContain(
    i18n.global.t(`field_help.execution_fields.${scenario.help}`),
  );
  await vi.waitFor(() => expect(helpButton.attributes('aria-expanded')).toBe('true'));
  expect(post).not.toHaveBeenCalled();
  expect(wrapper.emitted('update:visible')).toBeUndefined();
});
