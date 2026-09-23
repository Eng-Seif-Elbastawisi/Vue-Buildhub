import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppTable from '@/shared/HelpersComponents/AppTable.vue';

import { ExecutionQuoteItemSourceEnum } from '../../../../core/constants/execution.quote.item.source.enum';
import ExecutionQuoteItemsTable from '../ExecutionQuoteItemsTable.vue';

const quoteItem = {
  id: 'item-1',
  stage_id: 1,
  sub_stage_id: 2,
  source_type: ExecutionQuoteItemSourceEnum.PRODUCT,
  source_id: 3,
  quantity: 2,
  unit_price: 10,
};

describe('ExecutionQuoteItemsTable', () => {
  it('uses the shared table and emits removal from the shared action button', async () => {
    const wrapper = mount(ExecutionQuoteItemsTable, {
      props: { items: [quoteItem] },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.findComponent(AppTable).exists()).toBe(true);
    expect(wrapper.text()).toContain('execution_quote.table.main_stage');

    await wrapper.get('.app-btn').trigger('click');
    expect(wrapper.emitted('remove')?.[0]?.[0]).toEqual(quoteItem);
  });

  it('removes price columns for supervision quotes', () => {
    const wrapper = mount(ExecutionQuoteItemsTable, {
      props: { items: [quoteItem], showPricing: false },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    const headers = wrapper.getComponent(AppTable).props('headers') as Array<{ key: string }>;
    const headerKeys = headers.map((header) => header.key);

    expect(headerKeys).not.toContain('unit_price');
    expect(headerKeys).not.toContain('total');
  });
});
