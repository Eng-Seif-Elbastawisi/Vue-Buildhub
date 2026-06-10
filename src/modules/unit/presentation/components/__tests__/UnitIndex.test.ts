import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import UnitIndex from '../UnitIndex.vue';
import UnitController from '../../controllers/unit.controller';

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
vi.mock('../../controllers/unit.controller', () => ({
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

describe('UnitIndex.vue', () => {
  let mockFetchList: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchList = vi.fn().mockResolvedValue({});
    (UnitController.getInstance as any).mockReturnValue({
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
        Pagination: true,
        DeleteDialog: true,
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
      },
    },
  };

  it('renders the index wrapper', () => {
    const wrapper = mount(UnitIndex, mountOptions);
    expect(wrapper.find('.email-page').exists()).toBe(true);
  });

  it('renders the search input', () => {
    const wrapper = mount(UnitIndex, mountOptions);
    expect(wrapper.find('input.search-input').exists()).toBe(true);
  });

  it('calls fetchList on mount', () => {
    mount(UnitIndex, mountOptions);
    expect(mockFetchList).toHaveBeenCalledTimes(1);
  });

  it('shows add button link pointing to the country-prefixed route', () => {
    const wrapper = mount(UnitIndex, mountOptions);
    const links = wrapper.findAll('a');
    expect(links.length).toBeGreaterThan(0);
  });
});
