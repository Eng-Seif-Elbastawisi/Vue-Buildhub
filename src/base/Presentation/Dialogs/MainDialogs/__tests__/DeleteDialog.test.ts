import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import DeleteDialog from '../DeleteDialog.vue';

describe('shared DeleteDialog', () => {
  it('arms the containing row only when deletion is confirmed', async () => {
    const arm = vi.fn();
    const wrapper = mount(DeleteDialog, {
      global: {
        provide: { 'dashboard-destructive-motion': arm },
        mocks: { $t: (key: string) => key },
        stubs: {
          Dialog: {
            props: ['visible'],
            template: '<div v-if="visible" class="dialog-stub"><slot name="container" /></div>',
          },
        },
      },
    });

    await wrapper.find('button').trigger('click');
    expect(arm).not.toHaveBeenCalled();
    await wrapper.find('.btn-delete-danger').trigger('click');

    expect(arm).toHaveBeenCalledWith(wrapper.find('button').element);
    expect(wrapper.emitted('delete')).toHaveLength(1);
  });
});
