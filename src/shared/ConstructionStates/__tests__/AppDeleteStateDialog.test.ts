import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AppDeleteStateDialog from '../AppDeleteStateDialog.vue';

describe('AppDeleteStateDialog', () => {
  it('preserves the related-record error text', () => {
    const backendMessage = 'هذا العنصر مرتبط ببيانات أخرى ولا يمكن حذفه حالياً';
    const wrapper = mount(AppDeleteStateDialog, {
      props: { state: 'error', title: 'لا يمكن حذف هذا العنصر', message: backendMessage },
    });
    expect(wrapper.text()).toContain(backendMessage);
    expect(wrapper.find('.scene-stuck-block').exists()).toBe(true);
  });
});
