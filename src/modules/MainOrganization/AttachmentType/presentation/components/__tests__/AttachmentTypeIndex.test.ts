import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AttachmentTypeIndex from '../AttachmentTypeIndex.vue';
import type DeleteAttachmentTypeParams from '../../../core/params/delete.attachment.type.params';

const fetchList = vi.fn().mockResolvedValue({});
const deleteAttachmentType = vi.fn().mockResolvedValue({});
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ user: { type: 2 } }) }));
vi.mock('../../controllers/attachment.type.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      delete: deleteAttachmentType,
      listState: ref({}),
      pagination: ref(null),
    }),
  },
}));

describe('AttachmentTypeIndex', () => {
  beforeEach(() => {
    fetchList.mockClear();
    deleteAttachmentType.mockClear();
  });

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
    const addAction = wrapper.get('.index-page-heading__actions a');
    expect(addAction.text()).toBe('Add Attachment Type');
    expect(addAction.attributes('href')).toBe('/organization/attachment-types/add');
    expect(fetchList).toHaveBeenCalledTimes(1);
  });

  it('shows bulk delete for selected rows and deletes every selected attachment type', async () => {
    const wrapper = mount(AttachmentTypeIndex, {
      global: {
        stubs: {
          DataStatusBuilder: {
            template: `
              <div>
                <slot
                  name="success"
                  :data="[
                    { id: 5, title: 'Photos' },
                    { id: 7, title: 'Contracts' }
                  ]"
                />
              </div>
            `,
          },
          DeleteDialog: {
            props: ['triggerLabel'],
            emits: ['delete'],
            template: `
              <button class="delete-dialog" type="button" @click="$emit('delete')">
                {{ triggerLabel }}
                <slot name="btn" />
              </button>
            `,
          },
          Pagination: true,
          TableSkelaton: true,
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
        },
      },
    });
    await flushPromises();

    await wrapper.get('.th-checkbox input[type="checkbox"]').trigger('change');

    expect(wrapper.find('.table-bulk-actions').exists()).toBe(true);

    fetchList.mockClear();
    await wrapper.get('.table-bulk-actions .delete-dialog').trigger('click');
    await flushPromises();

    const deletedIds = deleteAttachmentType.mock.calls.map(
      ([params]: [DeleteAttachmentTypeParams]) => params.toMap().attachment_type_id,
    );
    expect(deletedIds).toEqual([5, 7]);
    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.table-bulk-actions').exists()).toBe(false);
  });
});
