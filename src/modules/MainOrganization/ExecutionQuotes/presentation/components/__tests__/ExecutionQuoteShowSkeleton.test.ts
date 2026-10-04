import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExecutionQuoteShowSkeleton from '../ExecutionQuoteShowSkeleton.vue';

describe('ExecutionQuoteShowSkeleton', () => {
  it('mirrors the quote detail layout and announces its loading state', () => {
    const wrapper = mount(ExecutionQuoteShowSkeleton, {
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    const skeleton = wrapper.get('[role="status"]');
    expect(skeleton.attributes('aria-busy')).toBe('true');
    expect(skeleton.attributes('aria-live')).toBe('polite');
    expect(skeleton.text()).toContain('loading');
    expect(wrapper.findAll('.execution-quote-show-skeleton__finance')).toHaveLength(1);
    expect(wrapper.findAll('.execution-quote-show-skeleton__attachment')).toHaveLength(3);
    expect(wrapper.findAll('.execution-quote-show-skeleton__history-entry')).toHaveLength(2);
    expect(
      wrapper.find('.execution-quote-show-skeleton__table-row')?.findAll('.p-skeleton'),
    ).toHaveLength(8);
  });
});
