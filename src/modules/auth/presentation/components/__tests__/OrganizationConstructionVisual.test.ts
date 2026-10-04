import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import OrganizationConstructionVisual from '../OrganizationConstructionVisual.vue';

describe('OrganizationConstructionVisual', () => {
  it('keeps the login illustration decorative and out of keyboard navigation', () => {
    const wrapper = mount(OrganizationConstructionVisual);

    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('a, button, input, textarea, select, [tabindex], img').exists()).toBe(
      false,
    );
  });
});
