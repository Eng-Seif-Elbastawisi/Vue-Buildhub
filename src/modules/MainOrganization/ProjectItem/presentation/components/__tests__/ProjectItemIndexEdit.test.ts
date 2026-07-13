import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import ProjectItemModel from '../../../core/models/project.Item.model';
import ProjectItemIndexEdit from '../ProjectItemIndexEdit.vue';

const { mockController, routeMock } = vi.hoisted(() => ({
  mockController: {
    fetchList: vi.fn(),
    delete: vi.fn(),
    listState: { value: { data: [] as ProjectItemModel[] } },
    pagination: { value: null },
  },
  routeMock: {
    query: { page: '2', word: 'paint' } as Record<string, string>,
  },
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({ global: { t: (key: string) => key } }),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 1 } }),
}));

vi.mock('../../controllers/project.Item.controller', () => ({
  default: { getInstance: () => mockController },
}));

const item = new ProjectItemModel({
  id: 7,
  item: { id: 9, title: 'Paint' },
  pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
  quantity: 2,
  price: 100,
  final_price: 200,
});

const global = {
  stubs: {
    RouterLink: {
      props: ['to'],
      template: '<a><slot /></a>',
    },
    DataStatusBuilder: {
      props: ['controller'],
      template: '<div><slot name="success" :data="controller.data" /></div>',
    },
    AppTable: {
      props: ['headers', 'items'],
      template: `
        <div class="app-table-stub">
          <div v-for="item in items" :key="item.id" class="row">
            <span class="item-title"><slot name="cell-item_id" :item="item" /></span>
            <span class="pricing-method"><slot name="cell-pricing_method" :item="item" /></span>
            <slot name="actions" :item="item" />
          </div>
        </div>
      `,
    },
    DeleteDialog: {
      emits: ['delete'],
      template: '<div class="delete-dialog" @click="$emit(\'delete\')"><slot name="btn" /></div>',
    },
    Pagination: true,
    TableSkelaton: true,
    IndexAddIcon: true,
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectItemIndexEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeMock.query = { page: '2', word: 'paint' };
    mockController.listState.value = { data: [item] };
    mockController.fetchList.mockResolvedValue({});
    mockController.delete.mockResolvedValue({});
  });

  it('fetches and renders project items from the list controller', async () => {
    const wrapper = mount(ProjectItemIndexEdit, { global });
    await flushPromises();

    expect(mockController.fetchList).toHaveBeenCalledTimes(1);
    expect(mockController.fetchList.mock.calls[0][0].toMap()).toMatchObject({
      word: 'paint',
      page: 2,
      per_page: 10,
      with_pagination: 1,
    });
    expect(wrapper.text()).toContain('Paint');
    expect(wrapper.text()).toContain('project_item.pricing_methods.GENERAL_ITEM');
  });

  it('deletes a project item and refreshes the list', async () => {
    const wrapper = mount(ProjectItemIndexEdit, { global });
    await flushPromises();

    await wrapper.find('.delete-dialog').trigger('click');
    await flushPromises();

    expect(mockController.delete.mock.calls[0][0].toMap()).toEqual({ project_item_id: 7 });
    expect(mockController.fetchList).toHaveBeenCalledTimes(2);
  });
});
