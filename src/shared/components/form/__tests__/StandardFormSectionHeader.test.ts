import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StandardFormSectionHeader from '../StandardFormSectionHeader.vue';

describe('StandardFormSectionHeader', () => {
  it('renders supplied section text without changing it', () => {
    const wrapper = mount(StandardFormSectionHeader, {
      props: { title: 'Department', description: 'Enter department details' },
    });

    expect(wrapper.get('h2').text()).toBe('Department');
    expect(wrapper.get('p').text()).toBe('Enter department details');
    expect(wrapper.get('.standard-form-section-header__icon').attributes('aria-hidden')).toBe(
      'true',
    );
  });

  it('omits the description when none exists', () => {
    const wrapper = mount(StandardFormSectionHeader, { props: { title: 'Client source' } });

    expect(wrapper.find('p').exists()).toBe(false);
  });
});
