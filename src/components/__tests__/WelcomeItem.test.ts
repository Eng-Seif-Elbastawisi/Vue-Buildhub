import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import WelcomeItem from '../WelcomeItem.vue';

describe('WelcomeItem.vue', () => {
  it('renders named and default slot content', () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        icon: '<span data-test="icon">Icon</span>',
        heading: 'Heading text',
        default: 'Body text',
      },
    });

    expect(wrapper.find('[data-test="icon"]').text()).toBe('Icon');
    expect(wrapper.find('h3').text()).toBe('Heading text');
    expect(wrapper.text()).toContain('Body text');
  });
});
