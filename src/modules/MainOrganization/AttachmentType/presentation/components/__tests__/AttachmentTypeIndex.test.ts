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
        stubs: {
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
        },
      },
    });
    expect(wrapper.get('.index-page-heading__title').text()).toBe('Attachment Types');
    expect(wrapper.get('.index-page-heading__subtitle').text()).toBe(
      'Manage and organize all attachment types',
    );
    expect(wrapper.get('.index-page-toolbar input').attributes('placeholder')).toBe(
      'Search attachment type...',
    );
    const addAction = wrapper.get('.index-page-toolbar__actions a');
    expect(addAction.text()).toBe('Add Attachment Type');
    expect(addAction.attributes('href')).toBe('/organization/attachment-types/add');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });
});
