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

  it('shows the quote-shaped skeleton before the quote loads', () => {
    showRequest.mockImplementation(() => new Promise<never>(() => undefined));

    const wrapper = mount(ExecutionQuoteShow, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });

    expect(wrapper.text()).toContain('execution_quote.show.title');
    expect(wrapper.get('[role="status"]').attributes('aria-busy')).toBe('true');
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
            client_source: { id: 11, title: 'تست' },
            status: 1,
            created_at: '2026-07-22 13:29:29',
          },
          quote_type: { id: 1, title: 'Lump_SUM' },
          price_employee: { id: 92, name: 'fwffefefe' },
          attachments: [
            {
              id: 9,
              file: 'https://cdn.example.com/site-plan.png',
              file_size: '2 MB',
              alt: 'Site plan',
              created_at: '2026-09-23 12:42:35',
            },
          ],
          quote_stages: [
            {
              id: 5,
              quote_id: 41,
              project_id: 207,
              stage: { id: 129, title: 'منعم' },
              sub_stage: { id: 150, title: 'sub stage' },
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
              client_price: '52000000.00',
              total_price: '44444444.00',
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
          $t: (key: string) => {
            if (key === 'execution_quote.show.title') return 'Execution quote details';
            if (key === 'execution_quote.show.eyebrow') return 'Execution quote';
            if (key === 'execution_quote.quote_types.lump_sum.title') return 'Lump sum';
            if (key === 'INDIVIDUAL') return 'Individual';
            return key;
          },
        },
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Execution quote details');
    expect(wrapper.text()).toContain('Execution quote');
    expect(wrapper.text()).toContain('Techlab');
    expect(wrapper.text()).toContain('007');
    expect(wrapper.text()).toContain('شارع');
    expect(wrapper.text()).toContain('Individual');
    expect(wrapper.text()).toContain('تست');
    expect(wrapper.text()).not.toContain('fwffefefe');
    expect(wrapper.text()).not.toContain('1012@test.com');
    expect(wrapper.text()).not.toContain('execution_quote.show.project_id');
    expect(wrapper.text()).not.toContain('execution_quote.show.email');
    expect(wrapper.text()).toContain('Lump sum');
    expect(wrapper.text()).toContain('Site plan');
    expect(wrapper.findAll('.quote-attachments__card')).toHaveLength(1);
    expect(wrapper.text()).toContain('منعم');
    expect(wrapper.text()).toContain('sub stage');
    expect(wrapper.text()).toContain('تيست1');
    expect(wrapper.text()).toContain('52,000,000');
    expect(wrapper.text()).toContain('44,444,444');
    expect(wrapper.text()).not.toContain('#41');
    expect(wrapper.text()).not.toContain('#17');

    const stageHeader = wrapper.find('.execution-quote-show__stage-header');
    expect(stageHeader.text()).toContain('execution_quote.show.stage_total');
    expect(stageHeader.text()).toContain('44,444,444');

    const projectCard = wrapper.findAll('.execution-quote-show__card')[0];
    expect(projectCard.text()).not.toContain('fwffefefe');
    expect(wrapper.text()).not.toContain('execution_quote.show.ownership_section');

    const accordionHeaders = wrapper.findAll('.p-accordionheader');
    expect(accordionHeaders).toHaveLength(2);
    expect(accordionHeaders[0].attributes('aria-expanded')).toBe('true');

    await accordionHeaders[0].trigger('click');

    expect(accordionHeaders[0].attributes('aria-expanded')).toBe('false');
  });
});
