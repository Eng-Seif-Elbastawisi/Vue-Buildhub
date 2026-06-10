import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import StageForm from '../StageForm.vue';

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
    params: {},
    fullPath: '/stages/add',
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
    UpdatedCustomInputSelect: true,
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

describe('StageForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the form card', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.find('.email-form-card').exists()).toBe(true);
  });

  it('renders the title input field', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.find('input#title').exists()).toBe(true);
  });

  it('shows the Add header when no id param', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.find('h3').text()).toContain('Add New');
  });

  it('does not show edit-badge in add mode', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.find('.edit-badge').exists()).toBe(false);
  });

  it('emits updateData when title input changes', async () => {
    const wrapper = mount(StageForm, { global: globalConfig, props: { formKey: '/stages/add' } });
    const input = wrapper.find('input#title');
    await input.setValue('Primary Stage');
    await input.trigger('input');
    expect(wrapper.emitted('updateData') ?? wrapper.emitted('update-data')).toBeTruthy();
  });
});
