import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppTable from '@/shared/HelpersComponents/AppTable.vue';
import ar from '@/locales/ar.json';

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
  unit_id: 9,
  unit_name: 'Piece',
};

describe('ExecutionQuoteItemsTable', () => {
  it('uses the shared table and exposes edit and delete before submission', async () => {
    const wrapper = mount(ExecutionQuoteItemsTable, {
      props: { items: [quoteItem] },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.findComponent(AppTable).exists()).toBe(true);
    expect(wrapper.text()).toContain('execution_quote.table.main_stage');

    const itemCells = wrapper.get('tbody tr').findAll('td');
    expect(itemCells[4]?.text()).toBe('2');
    expect(itemCells[5]?.text()).toBe('Piece');

    await wrapper.get('.quote-item-actions__edit').trigger('click');
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(quoteItem);

    await wrapper.get('.quote-item-actions__delete').trigger('click');
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

  it('does not offer local removal for an item already stored by the API', () => {
    const wrapper = mount(ExecutionQuoteItemsTable, {
      props: { items: [{ ...quoteItem, persisted: true }] },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.find('.app-btn').exists()).toBe(false);
  });

  it('renders the edit action in Arabic', () => {
    const wrapper = mount(ExecutionQuoteItemsTable, {
      props: { items: [quoteItem] },
      global: {
        mocks: {
          $t: (key: keyof typeof ar) => ar[key] ?? key,
        },
      },
    });

    expect(wrapper.get('.quote-item-actions__edit').text()).toContain('تعديل');
  });
});
