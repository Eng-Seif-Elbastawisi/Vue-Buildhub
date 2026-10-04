import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AppLoadingDialog from '../AppLoadingDialog.vue';

describe('AppLoadingDialog', () => {
  it('shows progress and the delete crane without changing the message', () => {
    const wrapper = mount(AppLoadingDialog, {
      props: { message: 'Deleting record…', progress: 66, deleting: true },
      global: { mocks: { $t: (key: string) => key } },
    });
    expect(wrapper.text()).toContain('Deleting record…');
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('66');
    expect(wrapper.find('.construction-scene--delete-loading').exists()).toBe(true);
  });
});
