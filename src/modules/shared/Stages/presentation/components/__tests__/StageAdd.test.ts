import { describe, it, expect, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import StageAdd from '../StageAdd.vue';
import StageModel from '../../../core/models/stage.model';
import EditStageParams from '../../../core/params/edit.stage.params';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  errorMessage: { value: null },
}));

vi.mock('../../controllers/stage.controller', () => ({
  default: { getInstance: () => mockController },
}));

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
    StageForm: true,
    AppButton: true,
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

describe('StageAdd', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
  });

  it('renders without crashing', () => {
    const wrapper = mount(StageAdd, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('does not show error section when there is no error', () => {
    const wrapper = mount(StageAdd, { global: globalConfig });
    expect(wrapper.find('.error').exists()).toBe(false);
  });

  it('renders the AppButton for saving', () => {
    const wrapper = mount(StageAdd, { global: globalConfig });
    expect(wrapper.find('app-button-stub').exists()).toBe(true);
  });

  it('calls update with edit params when a fetched stage is saved', async () => {
    const wrapper = mount(StageAdd, {
      global: {
        ...globalConfig,
        stubs: { ...globalConfig.stubs, StageForm: false },
      },
      props: { stage: StageModel.example },
    });

    await wrapper.find('app-button-stub').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledTimes(1);
    expect(mockController.update.mock.calls[0]?.[0]).toBeInstanceOf(EditStageParams);
    expect(mockController.update.mock.calls[0]?.[0].id).toBe(StageModel.example.id);
    expect(mockController.create).not.toHaveBeenCalled();
  });

  it('emits cancel when editing and the cancel button is clicked', async () => {
    const wrapper = mount(StageAdd, {
      global: globalConfig,
      props: { stage: StageModel.example },
    });

    const buttons = wrapper.findAll('app-button-stub');
    await buttons.at(1)?.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
