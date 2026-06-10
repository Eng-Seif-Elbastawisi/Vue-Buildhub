import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AddEducationTypeDialog from '../AddEducationTypeDialog.vue';

describe('AddEducationTypeDialog', () => {
  const defaultProps = {
    visible: true,
  };

  it('renders when visible', async () => {
    const wrapper = mount(AddEducationTypeDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template:
              '<div v-if="visible" class="dialog-stub"><slot name="header" /><slot /></div>',
            props: ['visible'],
          },
        },
      },
    });
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('add_education_type');
  });

  it('emits update:visible false when Cancel button is clicked', async () => {
    const wrapper = mount(AddEducationTypeDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible"><slot /></div>',
            props: ['visible'],
          },
        },
      },
    });

    await wrapper.find('button.btn-secondary').trigger('click');
    expect(wrapper.emitted('update:visible')).toBeTruthy();
    const emitted = wrapper.emitted('update:visible');
    expect(emitted?.[0]).toEqual([false]);
  });

  it('emits confirm with name when Add button is clicked', async () => {
    const wrapper = mount(AddEducationTypeDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible"><slot /></div>',
            props: ['visible'],
          },
        },
      },
    });

    const input = wrapper.find('input');
    await input.setValue('University');
    await wrapper.find('button.btn-primary').trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    const emitted = wrapper.emitted('confirm');
    expect(emitted?.[0]?.[0]).toEqual({ en: 'University' });
  });

  it('disables Add button when input is empty', async () => {
    const wrapper = mount(AddEducationTypeDialog, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: {
            template: '<div v-if="visible"><slot /></div>',
            props: ['visible'],
          },
        },
      },
    });

    const addButton = wrapper.find('button.btn-primary');
    expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.find('input').setValue('   ');
    expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

    await wrapper.find('input').setValue('School');
    expect((addButton.element as HTMLButtonElement).disabled).toBe(false);
  });
});
