import { flushPromises, mount } from '@vue/test-utils';
import type * as VueRouterModule from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataInitial } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import ExecutionQuoteApiService from '../../../data/api/execution.quote.api-service';
import ExecutionQuoteController from '../../controllers/execution.quote.controller';
import ExecutionQuoteShow from '../ExecutionQuoteShow.vue';

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof VueRouterModule>()),
  useRoute: () => ({ params: { id: '37' } }),
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
          id: 37,
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
            employee: { id: 4, name: 'rawan mamdooh' },
            name: 'شارع',
            phone: '111',
            email: '1012@test.com',
            address: 'mansoura',
            status: 1,
          },
          quote_type: { id: 1, title: 'Lump_SUM' },
          price_employee: { id: 92, name: 'fwffefefe' },
          created_at: '2026-09-23 11:56:21',
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
    expect(wrapper.text()).toContain('Quote #37');
    expect(wrapper.text()).toContain('Techlab');
    expect(wrapper.text()).toContain('007');
    expect(wrapper.text()).toContain('شارع');
    expect(wrapper.text()).toContain('fwffefefe');
    expect(wrapper.text()).toContain('Lump sum');
  });
});
