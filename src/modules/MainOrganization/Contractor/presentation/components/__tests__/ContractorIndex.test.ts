import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ContractorIndex from '../ContractorIndex.vue';

const fetchList = vi.fn().mockResolvedValue(undefined);
const routerPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: routerPush }),
}));
vi.mock('../../controllers/contractor.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: vi.fn(),
      listState: ref({}),
      pagination: ref(null),
    }),
  },
}));

describe('ContractorIndex', () => {
  it('loads contractors through index params and links to add', () => {
    const wrapper = mount(ContractorIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          IndexPageHeader: { template: '<div><slot name="search"/><slot name="actions"/></div>' },
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          RouterLink: { props: ['to'], template: '<a :href="to"><slot/></a>' },
        },
      },
    });

    expect(fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({ page: 1 });
    expect(wrapper.get('a').attributes('href')).toBe('/organization/contractors/add');
  });
});
