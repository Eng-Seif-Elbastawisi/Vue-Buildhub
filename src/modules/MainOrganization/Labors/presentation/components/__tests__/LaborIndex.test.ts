import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeleteLaborParams from '../../../core/params/delete.labor.params';
import LaborIndex from '../LaborIndex.vue';

const routerPush = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const controller = vi.hoisted(() => ({
  fetchList: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 1 } },
}));

vi.mock('../../controllers/labor.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 1 } }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

const SelectStub = defineComponent({
  name: 'UpdatedCustomInputSelect',
  props: {
    id: { type: String, required: true },
    modelValue: { type: Object, default: null },
    staticOptions: { type: Array, required: true },
  },
  emits: ['update:modelValue'],
  template:
    '<button :id="id" type="button" @click="$emit(\'update:modelValue\', staticOptions[2])">{{ modelValue?.id }}</button>',
});

describe('LaborIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
  });

  it('uses translated Labor copy and admin Labor routes', async () => {
    const wrapper = mount(LaborIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template:
              '<div><slot name="success" :data="[{ id: 7, title: \'Painting\', price: 100 }]" /></div>',
          },
          AppTable: {
            props: ['items'],
            template: '<div><slot name="actions" :item="items[0]" /></div>',
          },
          DeleteDialog: {
            emits: ['delete'],
            template:
              '<button class="delete-dialog" @click="$emit(\'delete\')"><slot name="btn" /></button>',
          },
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          UpdatedCustomInputSelect: SelectStub,
          ChangeStatusButton: {
            props: ['id', 'type', 'initialIsActive'],
            template: '<div class="change-status" />',
          },
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    const destinations = wrapper.findAllComponents(RouterLinkStub).map((link) => link.props('to'));

    expect(wrapper.text()).toContain('labor.list_title');
    expect(destinations).toContain('/admin/labor/add');
    expect(destinations).toContain('/admin/labor/edit/7');
    expect(wrapper.get('.change-status').exists()).toBe(true);

    await wrapper.get('.delete-dialog').trigger('click');
    await flushPromises();

    expect(controller.delete).toHaveBeenCalledWith(expect.any(DeleteLaborParams));
  });

  it('filters inactive labor and keeps the filter in the URL', async () => {
    const wrapper = mount(LaborIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          UpdatedCustomInputSelect: SelectStub,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    await wrapper.get('#labor-active-filter').trigger('click');
    await flushPromises();

    expect(routerPush).toHaveBeenLastCalledWith({
      query: {
        page: '1',
        word: undefined,
        active: '0',
      },
    });
    expect(controller.fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({
      page: 1,
      active: 0,
    });
  });

  it('restores the active filter from the route query', async () => {
    route.query = { page: '2', word: 'paint', active: '1' };

    const wrapper = mount(LaborIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          UpdatedCustomInputSelect: SelectStub,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    expect(wrapper.findComponent(SelectStub).props('modelValue') as { id: string }).toMatchObject({
      id: '1',
    });
    expect(controller.fetchList.mock.calls[0]?.[0].toMap()).toMatchObject({
      word: 'paint',
      page: 2,
      active: 1,
    });
  });
});
