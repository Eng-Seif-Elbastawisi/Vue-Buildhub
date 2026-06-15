import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import MaterialsIndex from '../MaterialsIndex.vue';

const fetchList = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ locale: ref('en'), t: (key: string) => key }) }));
vi.mock('../../controllers/materials.controller', () => ({
  default: {
    getInstance: () => ({ fetchList, delete: vi.fn(), listState: ref({}), pagination: ref(null) }),
  },
}));

describe('MaterialsIndex', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses Material labels and fetches the list on mount', () => {
    const wrapper = mount(MaterialsIndex, {
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
    expect(wrapper.text()).toContain('material.list_title');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
