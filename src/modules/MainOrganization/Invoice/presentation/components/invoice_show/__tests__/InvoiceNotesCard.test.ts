import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoiceNotesCard from '../InvoiceNotesCard.vue';

describe('InvoiceNotesCard', () => {
  it('renders notes when provided', () => {
    const wrapper = mount(InvoiceNotesCard, {
      props: {
        notes: 'First design invoice',
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('First design invoice');
  });
});
