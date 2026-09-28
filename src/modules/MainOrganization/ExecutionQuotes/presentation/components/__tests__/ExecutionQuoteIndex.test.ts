import { flushPromises, mount } from '@vue/test-utils';
import type * as VueRouterModule from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataInitial } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

import ExecutionQuoteApiService from '../../../data/api/execution.quote.api-service';
import ExecutionQuoteController from '../../controllers/execution.quote.controller';
import ExecutionQuoteIndex from '../ExecutionQuoteIndex.vue';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof VueRouterModule>()),
  useRouter: () => ({ push }),
}));

const createIndexResponse = (page: number, projectTitle: string, quoteType = 1) => ({
  statusCode: 200,
  data: {
    status: true,
    data: {
      data: [
        {
          id: 37 + page,
          quote_source: 1,
          project: { id: 207, title: projectTitle },
          client: { id: 30, name: 'شارع', phone: '111', status: 1 },
          quote_type: quoteType,
          price_employee: { id: 92, name: 'fwffefefe' },
          quote_stages: [
            {
              id: 1,
              stage: { id: 129, title: 'Main stage' },
              items: [{ id: 1 }, { id: 2 }, { id: 3 }],
            },
          ],
          total_quote_price: '5200.00',
          created_at: '2026-09-23 11:56:21',
        },
      ],
      links: {
        first: 'https://api.buildhub.techlabeg.com/supervision/organization/fetch_quotes?page=1',
        last: 'https://api.buildhub.techlabeg.com/supervision/organization/fetch_quotes?page=2',
        prev:
          page > 1
            ? 'https://api.buildhub.techlabeg.com/supervision/organization/fetch_quotes?page=1'
            : null,
        next:
          page < 2
            ? 'https://api.buildhub.techlabeg.com/supervision/organization/fetch_quotes?page=2'
            : null,
      },
      meta: {
        current_page: page,
        from: page,
        last_page: 2,
        links: [],
        path: 'https://api.buildhub.techlabeg.com/supervision/organization/fetch_quotes',
        per_page: 20,
        to: page,
        total: 21,
      },
    },
  },
});

const mountIndex = () =>
  mount(ExecutionQuoteIndex, {
    global: {
      mocks: {
        $t: (key: string, params?: { count?: number }) => {
          if (key === 'execution_quote.sources.execution_only.title') return 'Execution only';
          if (key === 'execution_quote.quote_types.lump_sum.title') return 'Lump sum';
          if (key === 'execution_quote.quote_types.supervision.title') return 'Supervision';
          if (key === 'execution_quote.table.currency_egp') return 'EGP';
          if (key === 'execution_quote.table.stages_count') return `Stages: ${params?.count}`;
          if (key === 'execution_quote.table.items_count_value') return `Items: ${params?.count}`;
          return key;
        },
      },
      stubs: {
        UpdatedCustomInputSelect: true,
      },
    },
  });

describe('ExecutionQuoteIndex', () => {
  const controller = ExecutionQuoteController.getInstance();
  const indexRequest = vi.spyOn(ExecutionQuoteApiService.getInstance(), 'index');

  beforeEach(() => {
    controller.setListState(new DataInitial());
    indexRequest.mockReset();
    push.mockReset();
  });

  it('shows the important execution quote fields returned by the index endpoint', async () => {
    indexRequest.mockResolvedValue(createIndexResponse(1, '007'));

    const wrapper = mountIndex();

    await flushPromises();

    expect(wrapper.text()).toContain('Execution only');
    expect(wrapper.text()).toContain('007');
    expect(wrapper.text()).toContain('شارع');
    expect(wrapper.text()).toContain('111');
    expect(wrapper.text()).toContain('Lump sum');
    expect(wrapper.text()).toContain('fwffefefe');
    expect(wrapper.text()).toContain('Active');
    expect(wrapper.text()).toContain('Contains items');
    expect(wrapper.text()).toContain('5,200');
    expect(wrapper.text()).toContain('EGP');
    expect(wrapper.text()).toContain('Stages: 1');
    expect(wrapper.text()).toContain('Items: 3');
    expect(wrapper.text()).not.toContain('execution_quote.table.id');
    expect(wrapper.text()).not.toContain('#207');
    expect(wrapper.text()).not.toContain('#92');
  });

  it('loads the selected page from the pagination control', async () => {
    indexRequest.mockImplementation(async (params) => {
      const page = Number(params?.toMap().page ?? 1);
      return createIndexResponse(page, page === 1 ? 'First page project' : 'Second page project');
    });

    const wrapper = mountIndex();
    await flushPromises();

    expect(wrapper.text()).toContain('First page project');
    expect(wrapper.find('.pagination-wrapper').exists()).toBe(true);

    await wrapper.findAll('.pagination-item')[1].trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Second page project');
    expect(wrapper.text()).not.toContain('First page project');
  });

  it('renders a numeric supervision quote type returned by the index endpoint', async () => {
    indexRequest.mockResolvedValue(createIndexResponse(1, 'Supervision project', 2));

    const wrapper = mountIndex();
    await flushPromises();

    expect(wrapper.get('.execution-quote-index__type').text()).toContain('Supervision');
    expect(wrapper.get('.execution-quote-index__type').classes()).toContain(
      'execution-quote-index__type--supervision',
    );
  });

  it('opens the stage selector and direct item entry from the row actions', async () => {
    indexRequest.mockResolvedValue(createIndexResponse(1, 'Action project'));

    const wrapper = mountIndex();
    await flushPromises();

    await wrapper.get('.execution-quote-index__add-stage-button').trigger('click');
    expect(push).toHaveBeenLastCalledWith({
      name: 'Build Execution Quote',
      query: { id: '38' },
    });

    await wrapper.get('.execution-quote-index__add-item-button').trigger('click');
    expect(push).toHaveBeenLastCalledWith({
      name: 'Build Execution Quote',
      params: { stageId: '129' },
      query: { id: '38' },
    });
  });

  it('applies and clears the supported API filters', async () => {
    indexRequest.mockResolvedValue(createIndexResponse(1, 'Filtered project'));

    const wrapper = mountIndex();
    await flushPromises();

    const filters = wrapper.findAllComponents(UpdatedCustomInputSelect);
    expect(filters).toHaveLength(4);

    const selectFilter = (index: number, id: number, title: string) => {
      const filter = filters[index];
      if (!filter) throw new Error(`Missing execution quote filter at index ${index}`);

      filter.vm.$emit('update:modelValue', { id, title });
    };

    selectFilter(0, 1, 'Execution only');
    selectFilter(1, 241, 'Project 241');
    selectFilter(2, 46, 'Quote customer');
    selectFilter(3, 2, 'Supervision');
    await flushPromises();

    await wrapper.find('.execution-quote-index__filter-apply').trigger('click');
    await flushPromises();

    expect(indexRequest.mock.calls.at(-1)?.[0]?.toMap()).toMatchObject({
      quote_source: 1,
      project_id: 241,
      client_id: 46,
      quote_type: 2,
      page: 1,
    });

    await wrapper.find('.execution-quote-index__filter-clear').trigger('click');
    await flushPromises();

    expect(indexRequest.mock.calls.at(-1)?.[0]?.toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 20,
    });
  });
});
