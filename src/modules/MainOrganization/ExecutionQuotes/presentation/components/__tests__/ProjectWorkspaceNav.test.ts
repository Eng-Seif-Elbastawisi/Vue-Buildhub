import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { expect, it } from 'vitest';
import ProjectWorkspaceNav from '../ProjectWorkspaceNav.vue';

it.each(['/organization', '/mainportal'])(
  'keeps app navigation in the same Quote and workspace at %s',
  async (prefix) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
    });
    await router.push(`${prefix}/execution-quotes/show/140/site-team`);
    const wrapper = mount(ProjectWorkspaceNav, {
      props: { quoteId: 140, active: 'site-team' },
      global: { plugins: [router], mocks: { $t: (key: string) => key } },
    });
    expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual([
      `${prefix}/execution-quotes/show/140`,
      `${prefix}/execution-quotes/show/140/schedule`,
      `${prefix}/execution-quotes/show/140/site-team`,
      `${prefix}/execution-quotes/show/140/work-items`,
      `${prefix}/execution-quotes/show/140/procurement`,
    ]);
    expect(wrapper.get('[aria-current="page"]').text()).toBe('site_team.title');
    await wrapper.get('a[href$="/schedule"]').trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(`${prefix}/execution-quotes/show/140/schedule`);
    wrapper.unmount();
  },
);
