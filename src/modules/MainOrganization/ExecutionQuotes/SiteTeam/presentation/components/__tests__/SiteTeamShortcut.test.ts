import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createI18n } from 'vue-i18n';
import SiteTeamShortcut from '../SiteTeamShortcut.vue';
import { mockNetwork } from '../../../__tests__/network';
import en from '@/locales/en.json';
it('opens the current Quote workspace without making up summary counts', async () => {
  const post = mockNetwork();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/mainportal/execution-quotes/show/:id', component: SiteTeamShortcut }],
  });
  await router.push('/mainportal/execution-quotes/show/140');
  const wrapper = mount(SiteTeamShortcut, {
    props: { quoteId: 140 },
    global: { plugins: [router, createI18n({ legacy: false, locale: 'en', messages: { en } })] },
  });
  expect(wrapper.get('a').attributes('href')).toBe(
    '/mainportal/execution-quotes/show/140/site-team',
  );
  expect(wrapper.text()).toContain('Site & Team');
  expect(wrapper.findAll('dd')).toHaveLength(0);
  expect(post).not.toHaveBeenCalled();
  wrapper.unmount();
});
