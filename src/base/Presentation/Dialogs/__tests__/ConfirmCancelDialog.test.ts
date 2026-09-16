import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ConfirmCancelDialog from '../ConfirmCancelDialog.vue';

describe('ConfirmCancelDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing with default props', () => {
    const wrapper = mount(ConfirmCancelDialog, {
      global: {
        stubs: {
          Dialog: {
            template: '<div class="p-dialog-stub"><slot name="container" /></div>',
          },
          AppButton: {
            template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
          },
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.dialog-title').text()).toBe('cancel_changes');
    expect(wrapper.find('.dialog-message').text()).toBe('are_you_sure_you_want_to_leave');
  });

  it('renders custom title and message', () => {
    const wrapper = mount(ConfirmCancelDialog, {
      props: {
        title: 'Custom Title',
        message: 'Custom Message',
        confirmLabel: 'Yes, Leave',
        cancelLabel: 'Stay',
      },
      global: {
        stubs: {
          Dialog: {
            template: '<div class="p-dialog-stub"><slot name="container" /></div>',
          },
          AppButton: {
            template: '<button class="app-button-stub"><slot /></button>',
          },
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    expect(wrapper.find('.dialog-title').text()).toBe('Custom Title');
    expect(wrapper.find('.dialog-message').text()).toBe('Custom Message');
    expect(wrapper.find('.btn-dialog-cancel').text()).toBe('Stay');
    expect(wrapper.find('.btn-dialog-confirm').text()).toBe('Yes, Leave');
  });

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmCancelDialog, {
      global: {
        stubs: {
          Dialog: {
            template: '<div class="p-dialog-stub"><slot name="container" /></div>',
          },
          AppButton: {
            template: '<button class="app-button-stub"><slot /></button>',
          },
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    await wrapper.find('.btn-dialog-confirm').trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(ConfirmCancelDialog, {
      global: {
        stubs: {
          Dialog: {
            template: '<div class="p-dialog-stub"><slot name="container" /></div>',
          },
          AppButton: {
            template: '<button class="app-button-stub"><slot /></button>',
          },
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    await wrapper.find('.btn-dialog-cancel').trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
