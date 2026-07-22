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

  it('defers breadcrumb rendering to the hero on the project show route', () => {
    mockRoute.name = 'show-project';

    const wrapper = mount(FeatureHeader, { global: globalConfig });

    expect(wrapper.find('.feature-header-container').exists()).toBe(false);
  });
});
