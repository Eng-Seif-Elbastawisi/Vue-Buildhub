import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { notifyDeleteOutcome } from '@/base/Presentation/Controller/dataMutationEvent';
import DeleteDialog from '../DeleteDialog.vue';

const mountDialog = (onDelete: () => unknown, arm = vi.fn()) =>
  mount(
    {
      components: { DeleteDialog },
      setup: () => ({ onDelete }),
      template:
        '<DeleteDialog title="Remove item?" message="This cannot be undone." @delete="onDelete" />',
    },
    {
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
    },
  );

describe('shared DeleteDialog', () => {
  it('keeps the dialog open and prevents duplicate clicks until deletion succeeds', async () => {
    let resolveDelete: (() => void) | undefined;
    const onDelete = vi.fn(() => new Promise<void>((resolve) => (resolveDelete = resolve)));
    const arm = vi.fn();
    const wrapper = mountDialog(onDelete, arm);

    await wrapper.find('button').trigger('click');
    expect(arm).not.toHaveBeenCalled();
    await wrapper.get('.btn-delete-danger').trigger('click');

    expect(arm).toHaveBeenCalledWith(wrapper.find('button').element);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
    expect(wrapper.get('.btn-delete-danger').attributes('disabled')).toBeDefined();
    await wrapper.get('.btn-delete-danger').trigger('click');
    expect(onDelete).toHaveBeenCalledTimes(1);

    notifyDeleteOutcome({ status: 'success' });
    resolveDelete?.();
    await nextTick();
    await nextTick();
    expect(wrapper.find('.dashboard-destructive-dialog__mark--success').exists()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 400));
    await nextTick();
    expect(wrapper.find('.dialog-stub').exists()).toBe(false);
    wrapper.unmount();
  });

  it('keeps the backend error in the dialog and allows another attempt', async () => {
    let resolveDelete: (() => void) | undefined;
    const onDelete = vi.fn(() => new Promise<void>((resolve) => (resolveDelete = resolve)));
    const wrapper = mountDialog(onDelete);
    const backendMessage = 'This item is linked to another record.';

    await wrapper.find('button').trigger('click');
    await wrapper.get('.btn-delete-danger').trigger('click');
    notifyDeleteOutcome({ status: 'error', errorMessage: backendMessage });
    resolveDelete?.();
    await nextTick();
    await nextTick();

    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
    expect(wrapper.find('.dashboard-destructive-dialog__mark--error').exists()).toBe(true);
    expect(wrapper.get('.dialog-message').text()).toBe(backendMessage);
    expect(wrapper.get('.btn-delete-danger').attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });
});
