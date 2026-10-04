import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AdminEstimationVisual from '../AdminEstimationVisual.vue';

describe('AdminEstimationVisual', () => {
  it('keeps the animation decorative and out of the login form', () => {
    const wrapper = mount(AdminEstimationVisual);

    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('a, button, input, textarea, select, [tabindex], text').exists()).toBe(
      false,
    );
  });
});
