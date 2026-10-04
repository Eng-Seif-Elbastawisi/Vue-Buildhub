import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import DashboardLayout from '../DashboardLayout.vue';
import FeatureHeader from '../../FeatureHeader/FeatureHeader.vue';
import AnimatedBreadcrumb from '../../FeatureHeader/AnimatedBreadcrumb.vue';
import SidebarNavigation from '../SubComponents/SidebarNavigation.vue';
import Navbar from '../SubComponents/Navbar.vue';

describe('DashboardLayout.vue', () => {
  const mountLayout = () => {
    const route = reactive({ fullPath: '/organization' });
    const wrapper = shallowMount(DashboardLayout, {
      slots: {
        default: '<div class="test-slot-content">Slot Content</div>',
      },
      global: {
        provide: { [routeLocationKey as symbol]: route },
      },
    });

    return { wrapper, route };
  };

  it('renders the layout components', () => {
    const { wrapper } = mountLayout();

    expect(wrapper.findComponent(SidebarNavigation).exists()).toBe(true);
    expect(wrapper.findComponent(Navbar).exists()).toBe(true);
    expect(wrapper.findComponent(FeatureHeader).exists()).toBe(true);
    expect(wrapper.findComponent(AnimatedBreadcrumb).exists()).toBe(true);
  });

  it('renders the default slot content', () => {
    const { wrapper } = mountLayout();

    expect(wrapper.html()).toContain('Slot Content');
    expect(wrapper.find('.test-slot-content').exists()).toBe(true);
  });

  it('places one shared breadcrumb between the topbar and page content', () => {
    const { wrapper } = mountLayout();
    const markup = wrapper.html();

    expect(wrapper.findAllComponents(AnimatedBreadcrumb)).toHaveLength(1);
    expect(markup.indexOf('desktop-navbar')).toBeLessThan(
      markup.indexOf('dashboard-breadcrumb-row'),
    );
    expect(markup.indexOf('dashboard-breadcrumb-row')).toBeLessThan(markup.indexOf('main-content'));
    expect(wrapper.find('.dashboard-route-accent').exists()).toBe(false);
  });
});
