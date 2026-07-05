import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TimeLine from '../TimeLine.vue';

describe('TimeLine', () => {
  it('renders the translated timeline label', () => {
    const wrapper = mount(TimeLine);

    expect(wrapper.text()).toBe('Timeline');
  });
});
