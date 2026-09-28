import { flushPromises, mount } from '@vue/test-utils';
import type * as VueRouterModule from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataInitial } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import ExecutionQuoteApiService from '../../../data/api/execution.quote.api-service';
import ExecutionQuoteController from '../../controllers/execution.quote.controller';
import ExecutionQuoteShow from '../ExecutionQuoteShow.vue';

const routerLinkStub = {
  props: ['to'],
  template:
    '<a :data-route-name="to.name" :data-quote-id="to.query?.id" :data-stage-id="to.params?.stageId"><slot /></a>',
};

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
        stubs: { RouterLink: routerLinkStub },
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
          total_quote_price: '123456.78',
          client_quote_price: '150000.00',
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
                  measurement_unit: { id: 165, title: 'كيلومتر مربع' },
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
            if (key === 'execution_quote.show.total_quote_price') return 'Total quote price';
            if (key === 'execution_quote.show.client_quote_price') return 'Client quote price';
            if (key === 'execution_quote.show.financial_summary') return 'Financial summary';
            if (key === 'execution_quote.fields.price_employee') return 'Pricing owner';
            if (key === 'execution_quote.table.currency_egp') return 'EGP';
            if (key === 'execution_quote.quote_types.lump_sum.title') return 'Lump sum';
            if (key === 'INDIVIDUAL') return 'Individual';
            return key;
          },
        },
        stubs: { RouterLink: routerLinkStub },
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
    expect(wrapper.text()).toContain('fwffefefe');
    expect(wrapper.text()).not.toContain('1012@test.com');
    expect(wrapper.text()).not.toContain('execution_quote.show.project_id');
    expect(wrapper.text()).not.toContain('execution_quote.show.email');
    expect(wrapper.text()).toContain('Lump sum');
    expect(wrapper.text()).toContain('Site plan');
    expect(wrapper.findAll('.quote-attachments__card')).toHaveLength(1);
    expect(wrapper.text()).toContain('منعم');
    expect(wrapper.text()).toContain('sub stage');
    expect(wrapper.text()).toContain('تيست1');
    expect(wrapper.text()).toContain('كيلومتر مربع');
    expect(wrapper.text()).toContain('52,000,000');
    expect(wrapper.text()).toContain('44,444,444');
    expect(wrapper.text()).not.toContain('#41');
    expect(wrapper.text()).not.toContain('#17');

    const addItemsButton = wrapper.get('.execution-quote-show__add-items');
    expect(addItemsButton.attributes('data-route-name')).toBe('Build Execution Quote');
    expect(addItemsButton.attributes('data-quote-id')).toBe('41');

    const addStageButton = wrapper.get('.execution-quote-show__add-stage-button');
    expect(addStageButton.attributes('data-route-name')).toBe('Build Execution Quote');
    expect(addStageButton.attributes('data-quote-id')).toBe('41');
    expect(addStageButton.attributes('data-stage-id')).toBeUndefined();

    const addItemButton = wrapper.get('.execution-quote-show__add-item-button');
    expect(addItemButton.attributes('data-route-name')).toBe('Build Execution Quote');
    expect(addItemButton.attributes('data-quote-id')).toBe('41');
    expect(addItemButton.attributes('data-stage-id')).toBe('129');

    const quoteItemCells = wrapper.get('.execution-quote-show__items-table tbody tr').findAll('td');
    expect(quoteItemCells[4]?.text()).toBe('1');
    expect(quoteItemCells[5]?.text()).toBe('كيلومتر مربع');

    const stageHeader = wrapper.find('.execution-quote-show__stage-header');
    expect(stageHeader.text()).toContain('execution_quote.show.stage_total');
    expect(stageHeader.text()).toContain('44,444,444');

    const projectCard = wrapper.findAll('.execution-quote-show__card')[0];
    expect(projectCard.text()).toContain('Financial summary');
    expect(projectCard.text()).toContain('Total quote price');
    expect(projectCard.text()).toContain('123,456.78');
    expect(projectCard.text()).toContain('Client quote price');
    expect(projectCard.text()).toContain('150,000');
    expect(projectCard.text()).not.toContain('execution_quote.show.supervision_percentage');
    expect(projectCard.text()).not.toContain('execution_quote.show.supervision_price');
    expect(projectCard.text()).toContain('Pricing owner');
    expect(projectCard.text()).toContain('fwffefefe');
    expect(wrapper.text()).not.toContain('execution_quote.show.ownership_section');

    const accordionHeaders = wrapper.findAll('.p-accordionheader');
    expect(accordionHeaders).toHaveLength(2);
    expect(accordionHeaders[0].attributes('aria-expanded')).toBe('true');
    expect(accordionHeaders[1].attributes('aria-expanded')).toBe('true');
    expect(
      accordionHeaders[1].get('.execution-quote-show__accordion-toggle .pi-chevron-up').exists(),
    ).toBe(true);

    await accordionHeaders[1].trigger('click');

    expect(accordionHeaders[1].attributes('aria-expanded')).toBe('false');
    expect(
      accordionHeaders[1].get('.execution-quote-show__accordion-toggle .pi-chevron-down').exists(),
    ).toBe(true);

    await accordionHeaders[0].trigger('click');

    expect(accordionHeaders[0].attributes('aria-expanded')).toBe('false');
  });

  it('shows backend supervision percentage and price instead of lump-sum client price', async () => {
    showRequest.mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: {
          id: 135,
          quote_source: 1,
          project: { title: 'Supervision project' },
          client: { name: 'Omar ali' },
          quote_type: 2,
          supervision_value: '50.00',
          supervision_price: '1500.00',
          total_quote_price: 1000,
          client_quote_price: 0,
          quote_stages: [],
          attachments: [],
        },
      },
    });

    const wrapper = mount(ExecutionQuoteShow, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: { RouterLink: routerLinkStub },
      },
    });

    await flushPromises();

    const financialSummary = wrapper.get('.execution-quote-show__finance');
    const financeValues = financialSummary.findAll('.execution-quote-show__finance-value');
    expect(financialSummary.text()).toContain('execution_quote.show.total_quote_price');
    expect(financialSummary.text()).toContain('execution_quote.show.supervision_percentage');
    expect(financialSummary.text()).toContain('execution_quote.show.supervision_price');
    expect(financialSummary.text()).not.toContain('execution_quote.show.client_quote_price');
    expect(financeValues).toHaveLength(3);
    expect(financeValues[0].get('dd strong').text()).toBe('1,000');
    expect(financeValues[1].get('dd strong').text()).toBe('50');
    expect(financeValues[2].get('dd strong').text()).toBe('1,500');
  });

  it('hides the pricing owner when the show response does not include one', async () => {
    showRequest.mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: {
          id: 42,
          quote_source: 1,
          project: { title: 'Ownerless quote' },
          client: { name: 'Client' },
          quote_type: { id: 1, title: 'Lump_SUM' },
          quote_stages: [],
          attachments: [],
        },
      },
    });

    const wrapper = mount(ExecutionQuoteShow, {
      global: {
        mocks: {
          $t: (key: string) =>
            key === 'execution_quote.fields.price_employee' ? 'Pricing owner' : key,
        },
        stubs: { RouterLink: routerLinkStub },
      },
    });

    await flushPromises();

    expect(wrapper.text()).not.toContain('Pricing owner');
  });
});
