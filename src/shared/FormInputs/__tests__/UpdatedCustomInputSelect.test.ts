import SiteTeamController from '@/modules/MainOrganization/ExecutionQuotes/SiteTeam/presentation/controllers/site-team.controller';
import IndexSpaceParams from '@/modules/shared/Space/core/params/index.space.params';
import TitleInterface from '@/base/Data/Models/titleInterface';
import {
  mockNetwork,
  response,
} from '@/modules/MainOrganization/ExecutionQuotes/SiteTeam/__tests__/network';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PrimeVue from 'primevue/config';
import { flushPromises, mount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
import PaginationModel from '@/base/Core/Models/paginationModel';
import UpdatedCustomInputSelect from '../UpdatedCustomInputSelect.vue';

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => vi.unstubAllGlobals());

// Stubs
const MultiSelectStub = {
  name: 'MultiSelect',
  template: '<div class="multiselect-stub"><slot name="header" /><slot name="footer" /></div>',
  props: [
    'modelValue',
    'options',
    'placeholder',
    'loading',
    'emptyMessage',
    'selectionLimit',
    'showToggleAll',
  ],
  emits: ['update:modelValue'],
};
const SelectStub = {
  name: 'Select',
  template: '<div class="select-stub"><slot name="footer" /></div>',
  props: ['modelValue', 'options', 'placeholder', 'loading', 'emptyMessage'],
  emits: ['update:modelValue'],
};
const IconBackStageStub = {
  name: 'IconBackStage',
  template: '<span class="icon-backstage-stub" />',
};
const PlusIconStub = {
  name: 'PlusIcon',
  template: '<span class="plus-icon-stub" />',
};

vi.mock('@/base/Presentation/Utils/validationService', () => ({
  default: { clearError: vi.fn() },
}));

const makeTitleInterface = (id: number, title: string) => ({ id, title });

const createWrapper = (props: Record<string, unknown> = {}) =>
  mount(UpdatedCustomInputSelect, {
    props: {
      modelValue: null,
      placeholder: 'Select...',
      ...props,
    },
    global: {
      stubs: {
        MultiSelect: MultiSelectStub,
        Select: SelectStub,
        IconBackStage: IconBackStageStub,
        PlusIcon: PlusIconStub,
      },
      mocks: { $t: (key: string) => key },
    },
  });

describe('UpdatedCustomInputSelect', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders Select component in single mode (type=1)', () => {
    const wrapper = createWrapper({ type: 1 });
    expect(wrapper.findComponent(SelectStub).exists()).toBe(true);
    expect(wrapper.findComponent(MultiSelectStub).exists()).toBe(false);
  });

  it('renders MultiSelect component in multiselect mode (type=2)', () => {
    const wrapper = createWrapper({ type: 2 });
    expect(wrapper.findComponent(MultiSelectStub).exists()).toBe(true);
    expect(wrapper.findComponent(SelectStub).exists()).toBe(false);
  });

  it('shows the selection limit and a clear select-all action for limited multi-selects', async () => {
    const options = Array.from({ length: 7 }, (_, index) =>
      makeTitleInterface(index + 1, `Stage ${index + 1}`),
    );
    const wrapper = createWrapper({
      type: 2,
      modelValue: [],
      staticOptions: options,
      showSelectAll: true,
      selectionLimit: 5,
    });

    const select = wrapper.findComponent(MultiSelectStub);

    expect(select.props('selectionLimit')).toBe(5);
    expect(select.props('showToggleAll')).toBe(false);
    expect(wrapper.text()).toContain('of 5 selected');

    await wrapper.find('.multiselect-select-all').trigger('click');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(options.slice(0, 5));
  });

  it('caps programmatic multi-select values at the configured limit', async () => {
    const options = Array.from({ length: 6 }, (_, index) =>
      makeTitleInterface(index + 1, `Stage ${index + 1}`),
    );
    const wrapper = createWrapper({
      type: 2,
      modelValue: options,
      staticOptions: options,
      selectionLimit: 5,
    });

    await wrapper.setProps({ modelValue: options });

    expect(wrapper.findComponent(MultiSelectStub).props('modelValue')).toHaveLength(5);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('loads the next options page from the multi-select footer', async () => {
    const currentPage = ref(1);
    const controller = {
      fetchAsOptions: vi.fn().mockImplementation((params: IndexStageParams) => {
        currentPage.value = params.pageNumber;

        return Promise.resolve([
          makeTitleInterface(params.pageNumber, `Stage ${params.pageNumber}`),
        ]);
      }),
      isListFailed: () => false,
      isListSuccess: () => true,
      pagination: computed(() => PaginationModel.fromTotal(40, 20, currentPage.value)),
    };

    const wrapper = createWrapper({
      type: 2,
      modelValue: [],
      controller,
      params: new IndexStageParams({ parentId: 10, perPage: 20, withPage: 1 }),
      paginated: true,
      showSelectAll: true,
      selectionLimit: 5,
    });

    await flushPromises();
    const nextButton = wrapper.findAll('.multiselect-pagination__button')[1];

    expect(nextButton.exists()).toBe(true);
    await nextButton.trigger('click');
    await flushPromises();

    expect(controller.fetchAsOptions).toHaveBeenCalledTimes(2);
    expect(controller.fetchAsOptions.mock.calls[1][0].toMap()).toMatchObject({
      page: 2,
      per_page: 20,
      parent_id: 10,
    });
  });

  it('renders label when label prop is provided', () => {
    const wrapper = createWrapper({ label: 'My Label' });
    expect(wrapper.text()).toContain('My Label');
  });

  it('shows required asterisk when required is true', () => {
    const wrapper = createWrapper({ required: true, label: 'Name' });
    expect(wrapper.find('.text-red-500').exists()).toBe(true);
  });

  it('does not show required asterisk when required is false', () => {
    const wrapper = createWrapper({ required: false });
    expect(wrapper.find('.text-red-500').exists()).toBe(false);
  });

  it('shows optional text when optional is true', () => {
    const wrapper = createWrapper({ optional: true });
    expect(wrapper.find('.optional-text').exists()).toBe(true);
  });

  it('does not show optional text when optional is false', () => {
    const wrapper = createWrapper({ optional: false });
    expect(wrapper.find('.optional-text').exists()).toBe(false);
  });

  it('shows add button when onclick prop is provided', () => {
    const wrapper = createWrapper({ onclick: vi.fn() });
    expect(wrapper.find('.add-dialog').exists()).toBe(true);
  });

  it('does not show add button when onclick is not provided', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.add-dialog').exists()).toBe(false);
  });

  it('renders reload icon by default (reload=true)', () => {
    const wrapper = createWrapper({ reload: true });
    expect(wrapper.find('.reload-icon').exists()).toBe(true);
  });

  it('hides reload icon when reload=false', () => {
    const wrapper = createWrapper({ reload: false });
    expect(wrapper.find('.reload-icon').exists()).toBe(false);
  });

  it('renders static options when staticOptions is provided', () => {
    const opts = [makeTitleInterface(1, 'Option A'), makeTitleInterface(2, 'Option B')];
    const wrapper = createWrapper({ staticOptions: opts });
    const select = wrapper.findComponent(SelectStub);
    expect(select.props('options')).toEqual(opts);
  });

  it('renders hidden input with correct id', () => {
    const wrapper = createWrapper({ id: 'my-select' });
    const hidden = wrapper.find('input.hidden');
    expect(hidden.attributes('id')).toBe('my-select');
  });

  it('keeps options from the latest filter when requests finish out of order', async () => {
    let resolveFirstRequest!: (options: ReturnType<typeof makeTitleInterface>[]) => void;
    let resolveSecondRequest!: (options: ReturnType<typeof makeTitleInterface>[]) => void;

    const controller = {
      fetchAsOptions: vi
        .fn()
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveFirstRequest = resolve;
          }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveSecondRequest = resolve;
          }),
        ),
      isListFailed: () => false,
      isListSuccess: () => true,
    };

    const wrapper = createWrapper({
      controller,
      params: new IndexStageParams({ parentId: 10 }),
    });
    await wrapper.setProps({ params: new IndexStageParams({ parentId: 20 }) });

    resolveSecondRequest([makeTitleInterface(21, 'Latest sub-stage')]);
    await flushPromises();
    resolveFirstRequest([makeTitleInterface(11, 'Stale sub-stage')]);
    await flushPromises();

    expect(wrapper.findComponent(SelectStub).props('options')).toEqual([
      makeTitleInterface(21, 'Latest sub-stage'),
    ]);
  });
});

it.each([1, 2])(
  'gives the rendered selection control an accessible name and input ID in mode %s',
  (type) => {
    const wrapper = mount(UpdatedCustomInputSelect, {
      props: {
        modelValue: type === 2 ? [] : null,
        type,
        id: 'schedule-unit',
        placeholder: 'Choose a unit',
        staticOptions: [{ id: 1, title: 'Day' }],
        reload: false,
      },
      global: { plugins: [PrimeVue] },
    });
    expect(wrapper.get('label').attributes('for')).toBe('schedule-unit');
    expect(wrapper.get('[role="combobox"]').attributes('id')).toBe('schedule-unit');
    expect(wrapper.get('[role="combobox"]').attributes('aria-label')).toBe('Choose a unit');
    wrapper.unmount();
  },
);

it('pages single Space options while retaining a saved selection outside the current page', async () => {
  const post = mockNetwork();
  const controller = SiteTeamController.getInstance();
  controller.activate(140);
  post.mockImplementation(async (request) =>
    response({
      status: true,
      data: {
        data: [{ id: Number(request.data.page) + 20, title: 'Other space' }],
        meta: { current_page: request.data.page, last_page: 2, total: 11, per_page: 10 },
      },
    }),
  );
  const saved = new TitleInterface({ id: 13, title: 'Living Room' });
  const wrapper = createWrapper({
    type: 1,
    modelValue: saved,
    controller: controller.spaceOptions,
    params: new IndexSpaceParams(),
    paginated: true,
  });
  await flushPromises();
  await wrapper.findAll('.multiselect-pagination__button')[1].trigger('click');
  await flushPromises();
  expect(post.mock.calls[1]?.[0].data.page).toBe(2);
  expect(wrapper.findComponent(SelectStub).props('modelValue')).toEqual(saved);
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  wrapper.unmount();
});
