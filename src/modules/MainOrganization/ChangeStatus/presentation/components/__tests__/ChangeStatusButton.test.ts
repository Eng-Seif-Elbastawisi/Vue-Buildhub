import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { StatusTypeEnum } from '../../../core/constant/change_status.type.enum';
import ChangeStatusButton from '../ChangeStatusButton.vue';

const changeStatus = vi.fn();
vi.mock('../../controllers/change_status.controller', () => ({
  default: { getInstance: () => ({ changeStatus }) },
}));

describe('ChangeStatusButton', () => {
  it('shows controlled deactivation feedback while retaining its reload behavior', async () => {
    let resolveChange!: () => void;
    changeStatus.mockReturnValueOnce(new Promise<void>((resolve) => (resolveChange = resolve)));

    const wrapper = mount(ChangeStatusButton, {
      props: { id: 5, type: StatusTypeEnum.STAGE, initialIsActive: true },
      global: {
        stubs: {
          ToggleSwitch: {
            template: '<button class="toggle-stub" @click="$emit(\'update:modelValue\', false)" />',
          },
        },
      },
    });

    await wrapper.find('.toggle-stub').trigger('click');
    expect(wrapper.find('.change-status-wrapper').classes()).toContain(
      'change-status-wrapper--deactivating',
    );

    resolveChange();
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('reload')).toHaveLength(1);
    expect(wrapper.find('.change-status-wrapper').classes()).not.toContain(
      'change-status-wrapper--deactivating',
    );
  });
});
