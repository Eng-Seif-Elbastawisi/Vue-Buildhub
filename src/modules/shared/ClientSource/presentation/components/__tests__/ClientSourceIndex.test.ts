import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientSourceController from '../../controllers/client.source.controller';
import ClientSourceIndex from '../ClientSourceIndex.vue';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    query: {},
  }),
}));

vi.mock('../../controllers/client.source.controller', () => ({
  default: { getInstance: vi.fn() },
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (fn: () => void) => fn,
}));

describe('ClientSourceIndex', () => {
  let mockFetchList: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchList = vi.fn().mockResolvedValue({});
    (ClientSourceController.getInstance as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      fetchList: mockFetchList,
      fetchOne: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      itemData: ref(null),
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
        ClientSourceAdd: true,
        Pagination: true,
        DeleteDialog: true,
        EditIcon: true,
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
      },
    },
  };

  it('renders the index wrapper', () => {
    const wrapper = mount(ClientSourceIndex, mountOptions);
    expect(wrapper.find('.client-source-page').exists()).toBe(true);
  });

  it('renders the search input', () => {
    const wrapper = mount(ClientSourceIndex, mountOptions);
    expect(wrapper.find('input.search-input').exists()).toBe(true);
  });

  it('shows client-source-specific copy when the list is empty', () => {
    const wrapper = mount(ClientSourceIndex, mountOptions);

    expect(wrapper.text()).toContain('client_source.empty_title');
    expect(wrapper.text()).toContain('client_source.empty_description');
    expect(wrapper.text()).not.toContain('no_emails_yet');
  });

  it('calls fetchList on mount', () => {
    mount(ClientSourceIndex, mountOptions);
    expect(mockFetchList).toHaveBeenCalledTimes(1);
  });
});
