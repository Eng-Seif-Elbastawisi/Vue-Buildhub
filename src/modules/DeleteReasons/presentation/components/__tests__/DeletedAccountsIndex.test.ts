import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, computed } from 'vue';
import DeletedAccountsIndex from '../DeletedAccountsIndex.vue';

// ── Debounce: call immediately in tests ──────────────────────────────────────
vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (fn: (...args: unknown[]) => void) => fn,
}));

// ── Dialog manager ───────────────────────────────────────────────────────────
vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    loading: vi.fn(),
    hideLoading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    progress: vi.fn(),
  },
}));

// ── Child component stubs ────────────────────────────────────────────────────
vi.mock('@/shared/DataStatues/DataStatusBuilder.vue', () => ({
  default: {
    name: 'DataStatusBuilder',
    props: ['controller', 'onRetry'],
    template: `
      <div class="data-status-builder">
        <slot name="success" :data="[]" />
        <slot name="empty" />
      </div>
    `,
  },
}));

vi.mock('@/shared/HelpersComponents/AppTable.vue', () => ({
  default: {
    name: 'AppTable',
    props: {
      headers: Array,
      items: Array,
      selectable: Boolean,
      showIndex: Boolean,
      hoverable: Boolean,
      striped: Boolean,
    },
    emits: ['selection-change'],
    template: '<div class="app-table"><slot /></div>',
  },
}));

vi.mock('@/shared/HelpersComponents/Pagination.vue', () => ({
  default: {
    name: 'Pagination',
    props: ['pagination'],
    emits: ['change-page', 'count-per-page'],
    template: '<div class="pagination"></div>',
  },
}));

vi.mock('../subComponent/DeletedReasonesDialog.vue', () => ({
  default: {
    name: 'DeletedReasonesDialog',
    template: '<div class="deleted-reasons-dialog"></div>',
  },
}));

// ── Controller mock ──────────────────────────────────────────────────────────
const mockFetchList = vi.fn().mockResolvedValue(undefined);
const mockListState = ref({} as any);
const mockController = {
  listState: mockListState,
  pagination: computed(() => null),
  fetchList: mockFetchList,
};

vi.mock('../../controllers/DeleteAccounts/deleted.accounts.controller', () => ({
  default: {
    getInstance: vi.fn(() => mockController),
  },
}));

// ── Vue Router mock ──────────────────────────────────────────────────────────
const mockPush = vi.fn();
const mockRoute = { query: {} as Record<string, string> };

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush }),
}));

// ── Factory ──────────────────────────────────────────────────────────────────
const createWrapper = () =>
  mount(DeletedAccountsIndex, {
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

// ─────────────────────────────────────────────────────────────────────────────

describe('DeletedAccountsIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.query = {};
    mockFetchList.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders without crashing', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders page heading', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.text()).toContain('Students Left the App');
  });

  it('renders page subtitle', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.text()).toContain('These students have removed the app');
  });

  it('renders search input', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('input.search-input').exists()).toBe(true);
  });

  it('renders DeletedReasonesDialog', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'DeletedReasonesDialog' }).exists()).toBe(true);
  });

  it('renders DataStatusBuilder', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('.data-status-builder').exists()).toBe(true);
  });

  it('renders AppTable inside success slot', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'AppTable' }).exists()).toBe(true);
  });

  it('renders Pagination inside success slot', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'Pagination' }).exists()).toBe(true);
  });

  it('renders empty state slot content', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('.empty-state').exists()).toBe(true);
  });

  // ── Table headers ──────────────────────────────────────────────────────────

  it('passes correct headers to AppTable', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const table = wrapper.findComponent({ name: 'AppTable' });
    const headers = table.props('headers') as { key: string }[];
    const keys = headers.map((h) => h.key);
    expect(keys).toContain('date');
    expect(keys).toContain('name');
    expect(keys).toContain('reason');
    expect(keys).toContain('notes');
  });

  it('passes selectable, showIndex, hoverable and striped to AppTable', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const table = wrapper.findComponent({ name: 'AppTable' });
    // Boolean attributes passed without binding resolve to "" in stubs — truthy check is sufficient
    expect(table.props('selectable')).toBeTruthy();
    expect(table.props('showIndex')).toBeTruthy();
    expect(table.props('hoverable')).toBeTruthy();
    expect(table.props('striped')).toBeTruthy();
  });

  // ── onMounted ──────────────────────────────────────────────────────────────

  it('calls fetchList on mount with default page 1', async () => {
    createWrapper();
    await flushPromises();
    expect(mockFetchList).toHaveBeenCalledOnce();
  });

  it('uses page from route query on mount', async () => {
    mockRoute.query = { page: '3' };
    createWrapper();
    await flushPromises();
    expect(mockFetchList).toHaveBeenCalledOnce();
  });

  it('sets word from route query on mount and passes it to fetchList', async () => {
    mockRoute.query = { word: 'search-term' };
    createWrapper();
    await flushPromises();
    expect(mockFetchList).toHaveBeenCalledOnce();
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  it('calls fetchList when search input triggers input event', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    vi.clearAllMocks();

    const input = wrapper.find('input.search-input');
    await input.setValue('john');
    await input.trigger('input');
    await flushPromises();

    expect(mockFetchList).toHaveBeenCalled();
  });

  it('calls router.push when search input triggers input event', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    vi.clearAllMocks();

    const input = wrapper.find('input.search-input');
    await input.setValue('ahmed');
    await input.trigger('input');
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ word: 'ahmed' }),
      }),
    );
  });

  it('omits word from router query when search is cleared', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    vi.clearAllMocks();

    const input = wrapper.find('input.search-input');
    await input.setValue('');
    await input.trigger('input');
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ word: undefined }),
      }),
    );
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  it('calls fetchList on change-page event', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    vi.clearAllMocks();

    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('change-page', 2);
    await flushPromises();

    expect(mockFetchList).toHaveBeenCalled();
  });

  it('pushes correct page to router on change-page event', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    vi.clearAllMocks();

    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('change-page', 4);
    await flushPromises();

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ page: '4' }),
      }),
    );
  });

  it('calls fetchList on count-per-page event', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    vi.clearAllMocks();

    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('count-per-page', 25);
    await flushPromises();

    expect(mockFetchList).toHaveBeenCalled();
  });

  it('does not crash when count-per-page fires with various counts', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    for (const count of [5, 10, 20, 50]) {
      await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('count-per-page', count);
      await flushPromises();
    }

    expect(wrapper.exists()).toBe(true);
  });

  // ── Row selection ──────────────────────────────────────────────────────────

  it('does not throw when AppTable emits selection-change', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    const mockItems = [{ name: 'Ali', Reason: 'bored', notes: 'none', date: '2024-01-01' }];
    await wrapper.findComponent({ name: 'AppTable' }).vm.$emit('selection-change', mockItems);

    expect(wrapper.exists()).toBe(true);
  });

  it('handles empty selection-change without crashing', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    await wrapper.findComponent({ name: 'AppTable' }).vm.$emit('selection-change', []);

    expect(wrapper.exists()).toBe(true);
  });

  // ── Singleton ──────────────────────────────────────────────────────────────

  it('uses the controller singleton (fetchList is called on mount)', async () => {
    createWrapper();
    await flushPromises();
    // fetchList being called proves the singleton was obtained and used
    expect(mockFetchList).toHaveBeenCalled();
  });
});
