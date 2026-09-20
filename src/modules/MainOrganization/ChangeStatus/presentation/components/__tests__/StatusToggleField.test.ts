import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatusToggleField from '../StatusToggleField.vue';

describe('StatusToggleField', () => {
  it('emits the selected status and displays its translated state', async () => {
    const wrapper = mount(StatusToggleField, {
      props: {
        modelValue: true,
        inputId: 'entity-status',
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          ToggleSwitch: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
              '<button type="button" @click="$emit(\'update:modelValue\', false)">{{ modelValue }}</button>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('active');
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
