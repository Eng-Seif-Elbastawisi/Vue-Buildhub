import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import { QuoteStatusEnum } from '../../../core/constants/quote.status.enum';
import QuoteStatusModel from '../../../core/models/quote.status.model';
import ExecutionQuoteStatusHistory from '../ExecutionQuoteStatusHistory.vue';

describe('ExecutionQuoteStatusHistory', () => {
  it('keeps the recorded transition, employee and note when collapsed and expanded', async () => {
    const history = QuoteStatusModel.fromJson({
      id: 3,
      employee: { id: 1, name: 'Techlab Employee' },
      from_status: QuoteStatusEnum.DRAFT,
      to_status: QuoteStatusEnum.PENDING_VALIDATION,
      note: 'Update the client price',
      created_at: '2026-09-30 07:50:08',
    });
    const wrapper = mount(ExecutionQuoteStatusHistory, {
      props: {
        state: new DataSuccess({ data: [history] }),
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    const statusLabels = wrapper.findAll('.quote-status-badge').map((badge) => badge.text());

    expect(statusLabels[0]).toMatch(/Draft|quote_status\.draft/);
    expect(statusLabels[1]).toMatch(/Pending Validation|quote_status\.pending_validation/);
    expect(wrapper.text()).toContain('Techlab Employee');
    expect(wrapper.text()).toContain('Update the client price');
    expect(wrapper.get('time').attributes('datetime')).toBe('2026-09-30 07:50:08');

    const sectionHeader = wrapper.get('.execution-quote-history__header');
    expect(sectionHeader.attributes('aria-expanded')).toBe('true');

    await sectionHeader.trigger('click');
    expect(sectionHeader.attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('.execution-quote-history__timeline').exists()).toBe(false);
    expect(wrapper.find('.execution-quote-history__content').exists()).toBe(false);
    expect(sectionHeader.find('.execution-quote-history__icon').exists()).toBe(true);
    expect(sectionHeader.get('.execution-quote-history__toggle i').classes()).not.toContain(
      'is-open',
    );

    await sectionHeader.trigger('click');
    expect(sectionHeader.attributes('aria-expanded')).toBe('true');
    expect(wrapper.text()).toContain('Update the client price');
  });
});
