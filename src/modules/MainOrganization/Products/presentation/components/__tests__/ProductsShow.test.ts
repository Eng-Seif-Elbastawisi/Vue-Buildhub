import { flushPromises, mount } from '@vue/test-utils';
import type * as VueI18nModule from 'vue-i18n';
import type * as VueRouterModule from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import ProductsShowModel from '../../../core/models/products.show.model';
import ProductsShow from '../ProductsShow.vue';

const { controller, routerPush, toastSuccess } = vi.hoisted(() => ({
  controller: {
    fetchOne: vi.fn(),
    delete: vi.fn(),
    itemData: { value: undefined as ProductsShowModel | undefined },
    errorMessage: { value: '' },
  },
  routerPush: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../../controllers/products.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal<typeof VueRouterModule>();

  return {
    ...vueRouter,
    useRoute: () => ({ params: { products_id: '9' } }),
    useRouter: () => ({ push: routerPush }),
  };
});

vi.mock('vue-i18n', async (importOriginal) => {
  const vueI18n = await importOriginal<typeof VueI18nModule>();

  return {
    ...vueI18n,
    useI18n: () => ({ t: (key: string) => key }),
  };
});

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastSuccess },
}));

const mountShow = () =>
  mount(ProductsShow, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        ProductShowHeader: {
          template: '<button class="delete-product" @click="$emit(\'delete\')" />',
        },
        ProductShowHero: true,
        ProductShowInfo: true,
        ProductShowSortings: true,
        ProductShowStages: true,
        ProductShowDescription: true,
      },
    },
  });

describe('ProductsShow', () => {
  beforeEach(() => {
    controller.itemData.value = new ProductsShowModel({ id: 9, title: 'Cement' });
    controller.fetchOne.mockReset().mockResolvedValue(undefined);
    controller.delete.mockReset();
    routerPush.mockReset();
    toastSuccess.mockReset();
  });

  it('loads the requested product through the existing controller', async () => {
    mountShow();
    await flushPromises();

    expect(controller.fetchOne).toHaveBeenCalledOnce();
    expect(controller.fetchOne.mock.calls[0][0].toMap()).toEqual({ product_id: 9 });
  });

  it('uses the existing delete controller flow from the header action', async () => {
    controller.delete.mockResolvedValueOnce(new DataSuccess<void>({ message: 'Deleted' }));

    const wrapper = mountShow();
    await flushPromises();
    await wrapper.get('.delete-product').trigger('click');
    await flushPromises();

    expect(controller.delete).toHaveBeenCalledOnce();
    expect(controller.delete.mock.calls[0][0].toMap()).toEqual({ product_id: 9 });
    expect(toastSuccess).toHaveBeenCalledWith('Deleted');
    expect(routerPush).toHaveBeenCalledWith('/organization/products');
  });
});
