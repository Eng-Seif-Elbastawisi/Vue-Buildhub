import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import SubStageIndex from '../SubStageIndex.vue';
import StageController from '../../../controllers/stage.controller';
import StageModel from '../../../../core/models/stage.model';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

// ── Router ────────────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    useRoute: () => ({
      path: '/organization/stages/5/sub-stages',
      params: { parent_id: '5' },
      query: {},
    }),
  };
});

// ── Controller ────────────────────────────────────────────────────────────────
vi.mock('../../../controllers/stage.controller', () => ({
  default: { getInstance: vi.fn() },
}));

// ── Debounce passthrough ───────────────────────────────────────────────────────
vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (fn: any) => fn,
}));

// ── Stores ────────────────────────────────────────────────────────────────────
vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ formData: {} }),
}));

describe('SubStageIndex.vue', () => {
  let mockFetchList: ReturnType<typeof vi.fn>;
  let mockChangeOrder: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchList = vi.fn().mockResolvedValue({});
    mockChangeOrder = vi.fn().mockResolvedValue(new DataSuccess({ data: StageModel.example }));
    (StageController.getInstance as any).mockReturnValue({
      fetchList: mockFetchList,
      changeOrder: mockChangeOrder,
      delete: vi.fn().mockResolvedValue({}),
      pagination: ref(null),
      listState: ref({ status: 'success', data: [StageModel.example] }),
    });
  });

  const mountOptions = {
    global: {
      mocks: { $t: (msg: string) => msg },
      stubs: {
        DataStatusBuilder: {
          template: '<div><slot name="success" :data="[example]" /><slot name="empty" /></div>',
          data() {
            return { example: StageModel.example };
          },
        },
        AppTable: {
          template: '<div class="app-table-stub"><button class="trigger-reorder" @click="$emit(\'reorder\', { movedItem: example, toIndex: 1, fromIndex: 0, items: [] })">Reorder</button></div>',
          props: ['headers', 'items', 'reorderable'],
          emits: ['reorder'],
          data() {
            return { example: StageModel.example };
          },
        },
        Pagination: true,
        DeleteDialog: true,
        ChangeStatusButton: true,
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
      },
    },
  };

  it('renders the index wrapper', () => {
    const wrapper = mount(SubStageIndex, mountOptions);
    expect(wrapper.find('.stage-page').exists()).toBe(true);
  });

  it('renders the list title and subtitle in the shared page header', () => {
    const wrapper = mount(SubStageIndex, mountOptions);

    expect(wrapper.get('header h1').text()).toBe('sub_stage.list_title');
    expect(wrapper.get('header p').text()).toBe('sub_stage.list_description');
  });

  it('renders the search input', () => {
    const wrapper = mount(SubStageIndex, mountOptions);
    expect(wrapper.find('input.search-input').exists()).toBe(true);
  });

  it('calls fetchList on mount', () => {
    mount(SubStageIndex, mountOptions);
    expect(mockFetchList).toHaveBeenCalledTimes(1);
  });

  it('handles reorder event by calling controller.changeOrder and refetching substages', async () => {
    const wrapper = mount(SubStageIndex, mountOptions);
    const reorderBtn = wrapper.find('.trigger-reorder');
    await reorderBtn.trigger('click');

    expect(mockChangeOrder).toHaveBeenCalledTimes(1);
    expect(mockFetchList).toHaveBeenCalledTimes(2);
  });
});
