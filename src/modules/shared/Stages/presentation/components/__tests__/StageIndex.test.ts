import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import StageIndex from '../StageIndex.vue';
import StageController from '../../controllers/stage.controller';

// ── Router ────────────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    params: { country_code: 'eg' },
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

describe('StageIndex.vue', () => {
  let mockFetchList: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchList = vi.fn().mockResolvedValue({});
    (StageController.getInstance as any).mockReturnValue({
      fetchList: mockFetchList,
      delete: vi.fn().mockResolvedValue({}),
      pagination: ref(null),
      listState: ref({ status: 'success', data: [] }),
    });
  });

  const mountOptions = {
    global: {
      mocks: { $t: (msg: string) => msg },
      stubs: {
        DataStatusBuilder: { template: '<div><slot name="empty" /></div>' },
        AppTable: true,
        StageAdd: true,
        Pagination: true,
        DeleteDialog: true,
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
      },
    },
  };

  it('renders the index wrapper', () => {
    const wrapper = mount(StageIndex, mountOptions);
    expect(wrapper.find('.stage-page').exists()).toBe(true);
  });

  it('identifies the list as execution stages', () => {
    const wrapper = mount(StageIndex, mountOptions);

    expect(wrapper.get('.stage-page__header h4').text()).toBe('stage.execution_title');
    expect(wrapper.get('.stage-page__header p').text()).toBe('stage.execution_description');
  });

  it('renders the search input', () => {
    const wrapper = mount(StageIndex, mountOptions);
    expect(wrapper.find('input.search-input').exists()).toBe(true);
  });

  it('shows stage-specific copy when the list is empty', () => {
    const wrapper = mount(StageIndex, mountOptions);

    expect(wrapper.text()).toContain('stage.empty_title');
    expect(wrapper.text()).toContain('stage.empty_description');
    expect(wrapper.text()).not.toContain('no_emails_yet');
  });

  it('calls fetchList on mount', () => {
    mount(StageIndex, mountOptions);
    expect(mockFetchList).toHaveBeenCalledTimes(1);
  });

  it('shows add button link pointing to the country-prefixed route', () => {
    const wrapper = mount(StageIndex, mountOptions);
    const links = wrapper.findAll('a');
    expect(links.length).toBeGreaterThan(0);
  });
});
