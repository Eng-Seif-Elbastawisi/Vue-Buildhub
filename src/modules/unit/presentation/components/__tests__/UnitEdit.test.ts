import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import UnitEdit from '../UnitEdit.vue';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  useRoute: () => ({
    query: {},
    params: { id: '1' },
    fullPath: '/units/edit/1',
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('primevue/config', () => ({
  usePrimeVue: () => ({ config: { ripple: true } }),
}));

const globalConfig = {
  stubs: {
    Teleport: true,
    Transition: true,
    TransitionGroup: true,
    'router-link': true,
    'router-view': true,
    DataTable: true,
    Column: true,
    Button: true,
    InputText: true,
    Dialog: true,
    Toast: true,
    Select: true,
    MultiSelect: true,
    Dropdown: true,
    FileUpload: true,
    Card: true,
    Accordion: true,
    AccordionTab: true,
    Tree: true,
    Breadcrumb: true,
    UnitForm: true,
  },
  mocks: {
    $t: (msg: string) => msg,
    $d: (d: unknown) => d,
    $n: (n: unknown) => n,
    $tc: (msg: string) => msg,
  },
  directives: {
    ripple: {},
    tooltip: {},
  },
};

describe('UnitEdit', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mount(UnitEdit, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the save button', () => {
    const wrapper = mount(UnitEdit, { global: globalConfig });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('does not show error section when there is no error', () => {
    const wrapper = mount(UnitEdit, { global: globalConfig });
    expect(wrapper.find('.error').exists()).toBe(false);
  });
});
