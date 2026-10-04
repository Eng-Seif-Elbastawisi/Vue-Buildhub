import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AppEmptyState from '../AppEmptyState.vue';

describe('AppEmptyState', () => {
  it('renders the supplied empty copy and action slot', () => {
    const wrapper = mount(AppEmptyState, {
      props: { title: 'No entries', message: 'Add the first entry.' },
      slots: { default: '<button>Add</button>' },
    });
    expect(wrapper.text()).toContain('No entries');
    expect(wrapper.find('button').text()).toBe('Add');
  });
});
