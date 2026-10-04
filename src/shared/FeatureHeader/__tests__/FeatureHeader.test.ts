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

  it('shows the shared page intro on Project Show', () => {
    mockRoute.name = 'show-project';
    mockRoute.path = '/organization/project/show/24';

    const wrapper = mount(FeatureHeader, { global: globalConfig });

    expect(wrapper.find('.feature-header-container--page-intro').exists()).toBe(true);
    expect(wrapper.find('.standard-form-header-icon[data-icon-kind="project"] svg').exists()).toBe(
      true,
    );
    expect(wrapper.find('.page-header-icon__accent').exists()).toBe(false);
    expect(wrapper.find('.standard-form-header-description').exists()).toBe(true);
  });

  it('uses the same page intro treatment for normal and targeted specialized routes', () => {
    mockRoute.path = '/organization/stages/add';
    const formHeader = mount(FeatureHeader, { global: globalConfig });

    expect(formHeader.find('.standard-form-header-icon[data-icon-kind="hierarchy"]').exists()).toBe(
      true,
    );
    expect(formHeader.find('.page-header-icon__accent').exists()).toBe(true);
    expect(formHeader.find('.standard-form-header-description').exists()).toBe(true);

    mockRoute.path = '/organization/execution-quotes/add';
    mockRoute.name = 'Add Execution Quote';
    const specializedHeader = mount(FeatureHeader, { global: globalConfig });

    expect(
      specializedHeader.find('.standard-form-header-icon[data-icon-kind="document"]').exists(),
    ).toBe(true);
    expect(specializedHeader.find('.standard-form-header-description').exists()).toBe(true);

    mockRoute.name = 'add-project';
    mockRoute.path = '/organization/project/add';
    const projectAddHeader = mount(FeatureHeader, { global: globalConfig });
    expect(
      projectAddHeader.find('.standard-form-header-icon[data-icon-kind="project"]').exists(),
    ).toBe(true);

    mockRoute.name = 'edit-project';
    mockRoute.path = '/organization/project/edit/24';
    const projectEditHeader = mount(FeatureHeader, { global: globalConfig });
    expect(
      projectEditHeader.find('.standard-form-header-icon[data-icon-kind="project"]').exists(),
    ).toBe(true);
    expect(projectEditHeader.find('.page-header-icon__accent path').exists()).toBe(true);
  });

  it('uses the employee SVG and delayed add accent on Add Employee', () => {
    mockRoute.name = 'Add Employee';
    mockRoute.path = '/organization/employee/add';

    const wrapper = mount(FeatureHeader, { global: globalConfig });

    expect(wrapper.find('.standard-form-header-icon[data-icon-kind="person"]').exists()).toBe(true);
    expect(wrapper.find('.page-header-icon__path[pathLength="1"]').exists()).toBe(true);
    expect(wrapper.find('.page-header-icon__accent').exists()).toBe(true);
    expect(wrapper.find('.page-header__title').exists()).toBe(true);
    expect(wrapper.find('.page-header__subtitle').exists()).toBe(true);
  });
});
