import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import QuoteStatusBadge from '../QuoteStatusBadge.vue';
import { QuoteStatusEnum } from '../../../core/constants/quote.status.enum';

describe('QuoteStatusBadge', () => {
  it('renders status label and class correctly', () => {
    const wrapper = mount(QuoteStatusBadge, {
      props: {
        status: QuoteStatusEnum.DRAFT,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('status-draft');
    expect(wrapper.text()).toMatch(/Draft|quote_status\.draft/);
  });
});
