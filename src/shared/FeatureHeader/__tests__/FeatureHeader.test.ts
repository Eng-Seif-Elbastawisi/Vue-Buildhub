import { beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FeatureHeader from '../FeatureHeader.vue';

const { featureRoute, mockRoute } = vi.hoisted(() => {
  const routeRecord = {
    name: 'some-route',
    path: '/feature',
    meta: { breadcrumb: 'Feature' },
  };

  return {
    featureRoute: routeRecord,
    mockRoute: {
      path: '/feature',
      name: 'some-route',
      params: {},
      matched: [routeRecord],
    },
  };
});

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: vi.fn(),
    getRoutes: vi.fn(() => [featureRoute]),
  }),
}));

const globalConfig = {
  stubs: {
    Breadcrumb: true,
  },
  mocks: {
    $t: (key: string) => (key === 'home' ? 'Home' : key),
  },
};

describe('FeatureHeader.vue', () => {
  beforeEach(() => {
    mockRoute.name = 'some-route';
    mockRoute.path = '/feature';
  });

  it('renders the header image', () => {
    const wrapper = mount(FeatureHeader, { global: globalConfig });
    expect(wrapper.find('img.header-img').exists()).toBe(true);
  });

  it('displays the correct breadcrumb title based on items', () => {
    const wrapper = mount(FeatureHeader, { global: globalConfig });
    const title = wrapper.find('.title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toContain('Feature');
  });

  it('keeps the project show page header hidden while the layout supplies its breadcrumb', () => {
    mockRoute.name = 'show-project';

    const wrapper = mount(FeatureHeader, { global: globalConfig });

    expect(wrapper.find('.feature-header-container').exists()).toBe(false);
  });

  it('shows the shared form heading treatment only for normal Add/Edit routes', () => {
    mockRoute.path = '/organization/stages/add';
    const formHeader = mount(FeatureHeader, { global: globalConfig });

    expect(formHeader.find('.standard-form-header-icon .pi-clone').exists()).toBe(true);
    expect(formHeader.find('.standard-form-header-description').exists()).toBe(true);

    mockRoute.path = '/organization/execution-quotes/add';
    const specializedHeader = mount(FeatureHeader, { global: globalConfig });

    expect(specializedHeader.find('.standard-form-header-icon').exists()).toBe(false);
  });
});
