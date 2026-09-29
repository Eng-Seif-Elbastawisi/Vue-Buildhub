import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import AttachmentTypeIndex from '../AttachmentTypeIndex.vue';

const fetchList = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { type: 2 } }) }));
vi.mock('../../controllers/attachment.type.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: vi.fn(),
      listState: ref({}),
      pagination: ref(null),
    }),
  },
}));

describe('AttachmentTypeIndex', () => {
  it('renders and fetches attachment types', () => {
    const wrapper = mount(AttachmentTypeIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          RouterLink: true,
        },
      },
    });
    expect(wrapper.text()).toContain('attachment_types');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
