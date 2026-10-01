import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import StageIndex from '../StageIndex.vue';
import StageController from '../../controllers/stage.controller';
import StageModel from '../../../core/models/stage.model';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

// ── Router ────────────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    path: '/organization/stages',
    params: {},
    query: {},
  }),
}));

// ── Controller ────────────────────────────────────────────────────────────────
vi.mock('../../controllers/stage.controller', () => ({
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

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 2 } }),
}));

describe('StageIndex.vue', () => {
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
          template:
            '<div class="app-table-stub"><button class="trigger-sort" @click="$emit(\'sort\', \'stageChildrenCount\', \'desc\')">Sort</button><button class="trigger-reorder" @click="$emit(\'reorder\', { movedItem: example, toIndex: 2, fromIndex: 0, items: [] })">Reorder</button></div>',
          props: ['headers', 'items', 'reorderable'],
          emits: ['sort', 'reorder'],
          data() {
            return { example: StageModel.example };
          },
        },
        StageAdd: true,
        Pagination: true,
        DeleteDialog: true,
        ChangeStatusButton: true,
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
      },
    },
  };

  it('uses the shared index header, toolbar, and table container', () => {
    const wrapper = mount(StageIndex, mountOptions);
    expect(wrapper.find('.stages-index-page').exists()).toBe(true);
    expect(wrapper.find('.index-page-header').exists()).toBe(true);
    expect(wrapper.find('.index-page-toolbar').exists()).toBe(true);
    expect(wrapper.find('.table-frame').exists()).toBe(true);
  });

  it('renders the list title and subtitle in the shared page header', () => {
    const wrapper = mount(StageIndex, mountOptions);

    expect(wrapper.get('header h1').text()).toBe('stage.list_title');
    expect(wrapper.get('header p').text()).toBe('stage.list_description');
  });

  it('renders the search input', () => {
    const wrapper = mount(StageIndex, mountOptions);
    expect(wrapper.find('input.search-input').exists()).toBe(true);
  });

  it('calls fetchList on mount', () => {
    mount(StageIndex, mountOptions);
    expect(mockFetchList).toHaveBeenCalledTimes(1);
  });

  it('handles reorder event by calling controller.changeOrder and refetching stages', async () => {
    const wrapper = mount(StageIndex, mountOptions);
    const reorderBtn = wrapper.find('.trigger-reorder');
    await reorderBtn.trigger('click');

    expect(mockChangeOrder).toHaveBeenCalledTimes(1);
    expect(mockFetchList).toHaveBeenCalledTimes(2);
  });

  it('fetches stages with server-side sort parameters', async () => {
    const wrapper = mount(StageIndex, mountOptions);

    await wrapper.find('.trigger-sort').trigger('click');
    await flushPromises();

    const request = mockFetchList.mock.calls.at(-1)?.[0];
    expect(request.toMap()).toMatchObject({
      sort_by: 'stage_children_count',
      sort_direction: 'desc',
    });
  });
});
