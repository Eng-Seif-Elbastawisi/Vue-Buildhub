import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoiceShowSkeleton from '../InvoiceShowSkeleton.vue';

describe('InvoiceShowSkeleton', () => {
  it('renders loading skeleton blocks', () => {
    const wrapper = mount(InvoiceShowSkeleton);

    expect(wrapper.findAll('.invoice-show-skeleton').length).toBeGreaterThan(1);
  });
});
