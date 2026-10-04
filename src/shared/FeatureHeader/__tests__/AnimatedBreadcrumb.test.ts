import { mount } from '@vue/test-utils';
import { nextTick, reactive, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnimatedBreadcrumb from '../AnimatedBreadcrumb.vue';

const { mockRoute, locale, indexRoute, addRoute } = vi.hoisted(() => {
  const indexRoute = {
    name: 'Clients',
    path: '/organization/clients',
    meta: { breadcrumb: 'clients' },
  };
  const addRoute = {
    name: 'Add Client',
    path: '/organization/clients/add',
    meta: { breadcrumb: 'add_client', parent: 'Clients' },
  };

  return {
    mockRoute: {
      name: 'Clients',
      path: '/organization/clients',
      fullPath: '/organization/clients',
      params: {},
      matched: [indexRoute] as Array<typeof indexRoute | typeof addRoute>,
    },
    locale: { value: 'en' },
    indexRoute,
    addRoute,
  };
});

const reactiveRoute = reactive(mockRoute);
const reactiveLocale = ref(locale.value);

vi.mock('vue-router', () => ({
  useRoute: () => reactiveRoute,
  useRouter: () => ({ getRoutes: () => [indexRoute, addRoute] }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: reactiveLocale,
    t: (key: string) => `${reactiveLocale.value}:${key}`,
  }),
}));

const BreadcrumbStub = {
  props: ['model'],
  template:
    '<nav><template v-for="item in model"><slot name="item" :item="item" /></template></nav>',
};

const globalConfig = {
  stubs: {
    Breadcrumb: BreadcrumbStub,
    RouterLink: {
      props: ['to'],
      template: '<a :href="to"><slot /></a>',
    },
  },
  mocks: { $t: (key: string) => key },
};

describe('AnimatedBreadcrumb', () => {
  beforeEach(() => {
    reactiveRoute.name = 'Clients';
    reactiveRoute.path = '/organization/clients';
    reactiveRoute.fullPath = '/organization/clients';
    reactiveRoute.matched = [indexRoute];
    reactiveLocale.value = 'en';
  });

  it('changes the trail key on navigation while keeping parent URLs and the current page marker', async () => {
    const wrapper = mount(AnimatedBreadcrumb, { global: globalConfig });
    const initialKey = wrapper.findComponent(BreadcrumbStub).vm.$.vnode.key;

    reactiveRoute.name = 'Add Client';
    reactiveRoute.path = '/organization/clients/add';
    reactiveRoute.fullPath = '/organization/clients/add';
    reactiveRoute.matched = [addRoute];
    await nextTick();

    expect(wrapper.findComponent(BreadcrumbStub).vm.$.vnode.key).not.toBe(initialKey);
    expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual([
      '/',
      '/organization/clients',
      '/organization/clients/add',
    ]);
    expect(wrapper.find('[aria-current="page"]').text()).toBe('en:add_client');
  });

  it('updates translated labels without restarting the trail transition', async () => {
    const wrapper = mount(AnimatedBreadcrumb, { global: globalConfig });
    const trailKey = wrapper.findComponent(BreadcrumbStub).vm.$.vnode.key;

    reactiveLocale.value = 'ar';
    await nextTick();

    expect(wrapper.text()).toContain('ar:clients');
    expect(wrapper.findComponent(BreadcrumbStub).vm.$.vnode.key).toBe(trailKey);
  });

  it('uses a provided project title as the current label without changing its route URL', () => {
    const wrapper = mount(AnimatedBreadcrumb, {
      props: { currentLabel: 'New Cairo Villa', showHomeIcon: true },
      global: globalConfig,
    });

    expect(wrapper.find('[aria-current="page"]').text()).toBe('New Cairo Villa');
    expect(wrapper.find('[aria-current="page"]').attributes('href')).toBe('/organization/clients');
    expect(wrapper.find('.pi-home').exists()).toBe(true);
  });
});
