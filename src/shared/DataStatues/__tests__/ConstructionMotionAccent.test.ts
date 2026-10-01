import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ConstructionMotionAccent from '../ConstructionMotionAccent.vue';

describe('ConstructionMotionAccent', () => {
  it('renders a measurement trace for BOQ loading without values', () => {
    const wrapper = mount(ConstructionMotionAccent, { props: { variant: 'boq' } });

    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.construction-motion-accent__measure').exists()).toBe(true);
    expect(wrapper.text()).toBe('');
  });

  it('renders three structural floors for project loading', () => {
    const wrapper = mount(ConstructionMotionAccent, { props: { variant: 'building' } });

    expect(wrapper.findAll('.construction-motion-accent__floor')).toHaveLength(3);
    expect(wrapper.find('.construction-motion-accent__base').exists()).toBe(true);
  });
});
