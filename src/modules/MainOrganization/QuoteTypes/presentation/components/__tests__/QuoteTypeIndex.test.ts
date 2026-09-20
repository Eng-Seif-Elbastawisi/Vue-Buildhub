import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import QuoteTypeModel from '../../../core/models/quote.types.model';
import QuoteTypeController from '../../controllers/quote.types.controller';
import QuoteTypeIndex from '../QuoteTypeIndex.vue';

const route = vi.hoisted(() => ({
  path: '/organization/quote-types',
  query: {} as Record<string, string>,
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../controllers/quote.types.controller', () => ({
  default: { getInstance: vi.fn() },
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

const quoteType = new QuoteTypeModel({
  id: 4,
  title: 'Lump sum',
  typeCode: 'LUMP_SUM',
  status: true,
});

describe('QuoteTypeIndex', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(QuoteTypeController.getInstance).mockReturnValue({
      fetchList: vi.fn().mockResolvedValue(undefined),
      changeOrder: vi.fn().mockResolvedValue(undefined),
      listState: ref({}),
      pagination: ref(null),
    } as unknown as QuoteTypeController);
    wrapper = mount(QuoteTypeIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[quoteType]" /></div>',
            data: () => ({ quoteType }),
          },
          AppTable: {
            props: ['headers'],
            template:
              '<div><span v-for="header in headers" :key="header.key" class="header">{{ header.label }}</span><slot name="cell-typeCode" :item="quoteType" /><slot name="actions" :item="quoteType" /></div>',
            data: () => ({ quoteType }),
          },
          Pagination: true,
          ChangeStatusButton: { template: '<button class="status-action" />' },
          IndexAddIcon: true,
          EditIcon: true,
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });
  });

  it('shows the quote type code in its own table column', () => {
    expect(wrapper.findAll('.header').map((header) => header.text())).toContain(
      'quote_type.type_code',
    );
    expect(wrapper.get('.type-code').text()).toBe('LUMP_SUM');
  });

  it('offers only status and edit actions for each quote type', () => {
    expect(wrapper.find('.status-action').exists()).toBe(true);
    expect(wrapper.find('.action-btn.edit').exists()).toBe(true);
    expect(wrapper.find('.action-btn.delete').exists()).toBe(false);
  });
});
