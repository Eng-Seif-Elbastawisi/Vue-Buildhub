import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import StageForm from '../StageForm.vue';
import StageModel from '../../../core/models/stage.model';
import EditStageParams from '../../../core/params/edit.stage.params';

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

  it('renders the form fields', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.find('.form-fields').exists()).toBe(true);
  });

  it('renders the title input field', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.find('input#title').exists()).toBe(true);
  });

  it('fills the title input and emits edit params when a stage is provided', () => {
    const wrapper = mount(StageForm, {
      global: globalConfig,
      props: { stage: StageModel.example },
    });

    expect(wrapper.find<HTMLInputElement>('input#title').element.value).toBe(
      StageModel.example.title,
    );
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0];
    expect(emittedParams).toBeInstanceOf(EditStageParams);
    expect((emittedParams as EditStageParams).id).toBe(StageModel.example.id);
  });

  it('emits updateData when title input changes', async () => {
    const wrapper = mount(StageForm, { global: globalConfig, props: { formKey: '/stages/add' } });
    const input = wrapper.find('input#title');
    await input.setValue('Primary Stage');
    await input.trigger('input');
    expect(wrapper.emitted('updateData') ?? wrapper.emitted('update-data')).toBeTruthy();
  });
});
