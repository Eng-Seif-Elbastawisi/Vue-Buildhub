import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MainLoader from '../MainLoader.vue';

describe('MainLoader', () => {
  it('renders the loading image with translated alt text', () => {
    const wrapper = mount(MainLoader);

    expect(wrapper.find('.main-loader').exists()).toBe(true);
    expect(wrapper.find('img').attributes('alt')).toBe('Loading image');
  });
});
