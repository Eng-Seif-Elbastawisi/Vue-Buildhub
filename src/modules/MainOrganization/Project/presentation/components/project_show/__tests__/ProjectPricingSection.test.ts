import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectPricingSection from '../ProjectPricingSection.vue';

describe('ProjectPricingSection', () => {
  it('renders project pricing summary rows', () => {
    const wrapper = mount(ProjectPricingSection, {
      props: {
        title: 'Project Pricing',
        pricing: {
          id: 6,
          total_tax: 14,
          discount_type: 2,
          discount_value: 10,
          price_after_discount: 661.77,
        },
        emptyLabel: 'No pricing',
        items: [
          { icon: 'pi pi-percentage', label: 'Total tax', value: '14.00' },
          { icon: 'pi pi-calculator', label: 'Final total', value: '661.77' },
        ],
      },
    });

    expect(wrapper.text()).toContain('Project Pricing');
    expect(wrapper.text()).toContain('Total tax');
    expect(wrapper.text()).toContain('14.00');
    expect(wrapper.text()).toContain('661.77');
  });
});
