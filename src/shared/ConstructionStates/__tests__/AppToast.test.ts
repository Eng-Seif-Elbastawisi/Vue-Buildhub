import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AppToast from '../AppToast.vue';

describe('AppToast', () => {
  it('shows the backend message verbatim with the error scene', () => {
    const wrapper = mount(AppToast, {
      props: { type: 'error', message: 'Backend error: linked item' },
    });
    expect(wrapper.find('p').text()).toBe('Backend error: linked item');
    expect(wrapper.find('.construction-scene--toast-error').exists()).toBe(true);
  });
});
