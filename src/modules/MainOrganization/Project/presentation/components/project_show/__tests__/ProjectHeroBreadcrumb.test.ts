import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProjectHeroBreadcrumb from '../ProjectHeroBreadcrumb.vue';

const showProjectRoute = vi.hoisted(() => ({
  name: 'show-project',
  path: '/organization/project/show/:project_id',
  meta: { breadcrumb: 'Show project' },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { project_id: '24' }, matched: [showProjectRoute] }),
  useRouter: () => ({ getRoutes: () => [showProjectRoute] }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
    t: (key: string) => (key === 'home' ? 'Home' : key),
  }),
}));

const BreadcrumbStub = {
  props: ['model'],
  template:
    '<div><template v-for="item in model"><slot name="item" :item="item" /></template></div>',
};

describe('ProjectHeroBreadcrumb', () => {
  it('keeps route links and uses the real project title for the active crumb', () => {
    const wrapper = mount(ProjectHeroBreadcrumb, {
      props: { currentLabel: 'New Cairo Villa' },
      global: {
        stubs: {
          Breadcrumb: BreadcrumbStub,
          RouterLink: {
            props: ['to'],
            template: '<a :data-to="to"><slot /></a>',
          },
        },
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.text()).toContain('Home');
    expect(wrapper.text()).toContain('New Cairo Villa');
    expect(wrapper.findAll('a')).toHaveLength(2);
    expect(wrapper.find('.pi-home').exists()).toBe(true);
    expect(wrapper.findAll('a')[1].attributes('aria-current')).toBe('page');
  });
});
