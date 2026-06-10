import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import DropList from '../DropList.vue';

describe('DropList', () => {
  it('renders without errors', () => {
    const wrapper = mount(DropList, {
      props: { actionList: [] },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
