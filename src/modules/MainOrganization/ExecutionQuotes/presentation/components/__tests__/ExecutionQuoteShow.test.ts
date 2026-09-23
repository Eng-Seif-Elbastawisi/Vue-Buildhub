import { flushPromises, mount } from '@vue/test-utils';
import type * as VueRouterModule from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataInitial } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import ExecutionQuoteApiService from '../../../data/api/execution.quote.api-service';
import ExecutionQuoteController from '../../controllers/execution.quote.controller';
import ExecutionQuoteShow from '../ExecutionQuoteShow.vue';

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof VueRouterModule>()),
  useRoute: () => ({ params: { id: '41' } }),
}));

describe('ExecutionQuoteShow', () => {
  const controller = ExecutionQuoteController.getInstance();
  const showRequest = vi.spyOn(ExecutionQuoteApiService.getInstance(), 'show');

  beforeEach(() => {
    controller.setItemState(new DataInitial());
    showRequest.mockReset();
  });

  it('shows the quote returned by the show endpoint', async () => {
    showRequest.mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: {
          id: 41,
          organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
          employee: { id: 1, name: 'Techlab Employee' },
          quote_source: 1,
          project: {
            id: 207,
            client: { id: 30, title: 'شارع' },
            title: '007',
            description: null,
            date: '2026-08-09',
            created_at: '2026-08-09 06:13:43',
          },
          client: {
            id: 30,
            organization: { id: 1, name: 'Techlab', address: 'Techlab Headquarters' },
            employee: { id: 4, name: 'rawan mamdooh' },
            name: 'شارع',
            phone: '111',
            email: '1012@test.com',
            address: 'mansoura',
            type: 1,
            client_source: null,
            status: 1,
            created_at: '2026-07-22 13:29:29',
          },
          quote_type: { id: 1, title: 'Lump_SUM' },
          price_employee: { id: 68, name: 'type test' },
          quote_stages: [
            {
              id: 5,
              quote_id: 41,
              project_id: 207,
              stage_id: 129,
              sub_stage_id: 150,
              items: [
                {
                  id: 7,
                  item_type: 1,
                  itemable_id: 17,
                  itemable_type: 'Product',
                  itemable: { id: 17, title: 'تيست1' },
                  expected_price: '44444444.00',
                  quantity: 1,
                },
              ],
              created_at: '2026-09-23 12:42:40',
            },
          ],
          created_at: '2026-09-23 12:42:30',
        },
      },
    });

    const wrapper = mount(ExecutionQuoteShow, {
      global: {
        mocks: {
          $t: (key: string, params?: { id?: number }) => {
            if (key === 'execution_quote.show.title') return 'Execution quote details';
            if (key === 'execution_quote.show.eyebrow') return `Quote #${params?.id}`;
            if (key === 'execution_quote.quote_types.lump_sum.title') return 'Lump sum';
            return key;
          },
        },
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Execution quote details');
    expect(wrapper.text()).toContain('Quote #41');
    expect(wrapper.text()).toContain('Techlab');
    expect(wrapper.text()).toContain('007');
    expect(wrapper.text()).toContain('شارع');
    expect(wrapper.text()).toContain('type test');
    expect(wrapper.text()).toContain('Lump sum');
    expect(wrapper.text()).toContain('#129');
    expect(wrapper.text()).toContain('#150');
    expect(wrapper.text()).toContain('تيست1');
    expect(wrapper.text()).toContain('44,444,444');
    expect(wrapper.text()).toContain('#17');

    const projectCard = wrapper.findAll('.execution-quote-show__card')[0];
    expect(projectCard.text()).toContain('type test');
    expect(wrapper.text()).not.toContain('execution_quote.show.ownership_section');

    const accordionHeaders = wrapper.findAll('.p-accordionheader');
    expect(accordionHeaders).toHaveLength(2);
    expect(accordionHeaders[0].attributes('aria-expanded')).toBe('true');

    await accordionHeaders[0].trigger('click');

    expect(accordionHeaders[0].attributes('aria-expanded')).toBe('false');
  });
});
