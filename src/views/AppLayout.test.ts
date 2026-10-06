import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import AppLayout from './AppLayout.vue';

describe('AppLayout home content', () => {
  it.each([
    ['/organization', 'organization'],
    ['/mainportal', 'organization'],
    ['/admin', 'admin'],
  ])('shows the %s home inside the shared shell', (path, workspace) => {
    const route = reactive({ path });
    const wrapper = mount(AppLayout, {
      global: {
        provide: { [routeLocationKey as symbol]: route },
        stubs: {
          DashboardLayout: { template: '<div class="shell-stub"><slot /></div>' },
          HomeDashboard: {
            props: ['workspace'],
            template: '<div class="home-stub">{{ workspace }}</div>',
          },
          RouterView: { template: '<div class="route-stub" />' },
        },
      },
    });

    expect(wrapper.find('.shell-stub').exists()).toBe(true);
    expect(wrapper.find('.home-stub').text()).toBe(workspace);
    expect(wrapper.find('.route-stub').exists()).toBe(false);
  });

  it('keeps child pages in the existing router view', () => {
    const route = reactive({ path: '/organization/project' });
    const wrapper = mount(AppLayout, {
      global: {
        provide: { [routeLocationKey as symbol]: route },
        stubs: {
          DashboardLayout: { template: '<div class="shell-stub"><slot /></div>' },
          HomeDashboard: { template: '<div class="home-stub" />' },
          RouterView: { template: '<div class="route-stub" />' },
        },
      },
    });

    expect(wrapper.find('.route-stub').exists()).toBe(true);
    expect(wrapper.find('.home-stub').exists()).toBe(false);
  });
});
