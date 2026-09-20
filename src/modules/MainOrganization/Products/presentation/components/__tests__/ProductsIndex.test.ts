import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

import type IndexProductsParams from '../../../core/params/index.products.params';
import ProductsIndex from '../ProductsIndex.vue';

const { controller, routeQuery, routerPush, stageController, toastSuccess } = vi.hoisted(() => ({
  controller: {
    fetchList: vi.fn(),
    fetchStats: vi.fn(),
    delete: vi.fn(),
    listState: { value: { status: 'success' } },
    pagination: { value: { currentPage: 1, lastPage: 1 } },
  },
  routeQuery: {} as Record<string, string | undefined>,
  routerPush: vi.fn(),
  stageController: {
    fetchList: vi.fn(),
  },
  toastSuccess: vi.fn(),
}));

vi.mock('../../controllers/products.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('@/modules/shared/Stages/presentation/controllers/stage.controller', () => ({
  default: { getInstance: () => stageController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routeQuery }),
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastSuccess },
}));

const mountIndex = () =>
  mount(ProductsIndex, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        DataStatusBuilder: {
          template:
            '<div><slot name="success" :data="[{ id: 6, title: \'Door\', isActive: true }]" /></div>',
        },
        ChangeStatusButton: {
          props: ['id', 'type', 'initialIsActive'],
          template: '<div class="change-status" />',
        },
        DeleteDialog: true,
        Pagination: {
          emits: ['change-page'],
          template: '<button class="next-page" @click="$emit(\'change-page\', 2)" />',
        },
        IndexAddIcon: true,
        RouterLink: true,
      },
    },
  });

const mockGroupedStages = () => {
  stageController.fetchList
    .mockResolvedValueOnce({
      data: [
        new StageModel({ id: 1, title: 'Main Stage A', children: [] }),
        new StageModel({ id: 2, title: 'Main Stage B', children: [] }),
      ],
    })
    .mockResolvedValueOnce({
      data: [
        new StageModel({ id: 11, title: 'Sub 1', children: [] }),
        new StageModel({ id: 12, title: 'Sub 2', children: [] }),
      ],
    })
    .mockResolvedValueOnce({ data: [] });
};

describe('ProductsIndex', () => {
  beforeEach(() => {
    Object.keys(routeQuery).forEach((key) => delete routeQuery[key]);
    controller.fetchList.mockReset().mockResolvedValue(undefined);
    controller.fetchStats.mockReset().mockResolvedValue({});
    controller.delete.mockReset().mockResolvedValue(undefined);
    stageController.fetchList.mockReset().mockResolvedValue({ data: [] });
    routerPush.mockReset();
    toastSuccess.mockReset();
  });

  it('renders the product status action in each product card', async () => {
    const wrapper = mountIndex();
    await flushPromises();

    expect(wrapper.get('.change-status').exists()).toBe(true);
  });

  it('restores stage filters and preserves them across pagination and search', async () => {
    routeQuery.page = '3';
    routeQuery.word = 'door';
    routeQuery.stages = '11,12,invalid,11';

    const wrapper = mountIndex();
    await flushPromises();

    let params = controller.fetchList.mock.calls.at(-1)?.[0] as IndexProductsParams;
    expect(params.toMap()).toMatchObject({
      word: 'door',
      page: 3,
      stage_ids: [11, 12],
    });

    await wrapper.get('.next-page').trigger('click');

    params = controller.fetchList.mock.calls.at(-1)?.[0] as IndexProductsParams;
    expect(params.toMap()).toMatchObject({ word: 'door', page: 2, stage_ids: [11, 12] });
    expect(routerPush).toHaveBeenLastCalledWith({
      query: expect.objectContaining({ page: '2', word: 'door', stages: '11,12' }),
    });

    await wrapper.get('.search-box input').setValue('window');

    params = controller.fetchList.mock.calls.at(-1)?.[0] as IndexProductsParams;
    expect(params.toMap()).toMatchObject({ word: 'window', page: 1, stage_ids: [11, 12] });
    expect(routerPush).toHaveBeenLastCalledWith({
      query: expect.objectContaining({ page: '1', word: 'window', stages: '11,12' }),
    });
  });

  it('applies and clears selected sub-stage ids from a main stage', async () => {
    mockGroupedStages();

    const wrapper = mountIndex();
    await flushPromises();

    await wrapper.get('.stage-filter-button').trigger('click');

    const groupButtons = wrapper.findAll('.stage-filter-group-button');
    expect(groupButtons[1].attributes('disabled')).toBeDefined();

    await groupButtons[0].trigger('click');

    expect(
      wrapper
        .findAll<HTMLInputElement>('.stage-filter-option input')
        .map((input) => input.element.checked),
    ).toEqual([true, true]);
    expect(wrapper.get('.stage-filter-button').classes()).toContain('active');
    expect(wrapper.get('.stage-filter-button').text()).toContain('(2)');

    await wrapper.get('.stage-filter-apply').trigger('click');

    let params = controller.fetchList.mock.calls.at(-1)?.[0] as IndexProductsParams;
    expect(params.toMap()).toMatchObject({ page: 1, stage_ids: [11, 12] });
    expect(params.toMap().stage_ids).not.toContain(1);
    expect(routerPush).toHaveBeenLastCalledWith({
      query: expect.objectContaining({ page: '1', stages: '11,12' }),
    });
    expect(wrapper.find('.stage-filter-popover').exists()).toBe(false);

    await wrapper.get('.stage-filter-button').trigger('click');
    await wrapper.get('.stage-filter-clear').trigger('click');

    params = controller.fetchList.mock.calls.at(-1)?.[0] as IndexProductsParams;
    expect(params.toMap()).not.toHaveProperty('stage_ids');
    expect(routerPush).toHaveBeenLastCalledWith({
      query: expect.objectContaining({ page: '1', stages: undefined }),
    });
  });

  it('closes the stage filter when clicking outside', async () => {
    mockGroupedStages();

    const wrapper = mountIndex();
    await flushPromises();

    await wrapper.get('.stage-filter-button').trigger('click');
    expect(wrapper.find('.stage-filter-popover').exists()).toBe(true);

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.stage-filter-popover').exists()).toBe(false);
  });

  it('shows the backend success message after a product is deleted', async () => {
    controller.delete.mockResolvedValueOnce(
      new DataSuccess<void>({ message: 'تم حذف المنتج بنجاح' }),
    );

    const wrapper = mount(ProductsIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[{ id: 6, title: \'Door\' }]" /></div>',
          },
          ChangeStatusButton: true,
          DeleteDialog: {
            emits: ['delete'],
            template: '<button class="delete-dialog" @click="$emit(\'delete\')" />',
          },
          Pagination: true,
          IndexAddIcon: true,
          RouterLink: true,
        },
      },
    });
    await flushPromises();

    await wrapper.get('.delete-dialog').trigger('click');
    await flushPromises();

    expect(toastSuccess).toHaveBeenCalledWith('تم حذف المنتج بنجاح');
  });
});
