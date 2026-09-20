import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
import UpdatedCustomInputSelect from '../UpdatedCustomInputSelect.vue';

// Stubs
const MultiSelectStub = {
  name: 'MultiSelect',
  template: '<div class="multiselect-stub" />',
  props: ['modelValue', 'options', 'placeholder', 'loading', 'emptyMessage'],
  emits: ['update:modelValue'],
};
const SelectStub = {
  name: 'Select',
  template: '<div class="select-stub" />',
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
