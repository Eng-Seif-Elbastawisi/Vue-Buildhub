import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import arabicMessages from '@/locales/ar.json';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';
import DeleteProductsStageParams from '../../../../core/params/delete.products.stage.params';
import ProductShowStages from '../ProductShowStages.vue';

const controllerMocks = vi.hoisted(() => ({
  deleteProductStage: vi.fn(),
  storeProductStage: vi.fn(),
}));

const stageControllerMocks = vi.hoisted(() => ({
  fetchList: vi.fn(),
}));

vi.mock('../../../controllers/products.controller.ts', () => ({
  default: {
    getInstance: () => controllerMocks,
  },
}));

vi.mock('@/modules/shared/Stages/presentation/controllers/stage.controller', () => ({
  default: {
    getInstance: () => stageControllerMocks,
  },
}));

const DialogStub = defineComponent({
  props: {
    visible: Boolean,
  },
  template: '<div v-if="visible" class="dialog-stub"><slot name="container" /></div>',
});

const arabicLabels: Record<string, string> = {
  'Products.delete_item_dialog.title': arabicMessages.Products.delete_item_dialog.title,
  'Products.delete_item_dialog.message': arabicMessages.Products.delete_item_dialog.message,
  confirm: arabicMessages.confirm,
  cancel: arabicMessages.cancel,
};

const subStage = new StageModel({
  id: 2,
  parentId: 1,
  title: 'Sub Stage',
  children: [],
});

const mountStages = async () => {
  const wrapper = mount(ProductShowStages, {
    props: {
      productId: 9,
      stages: [subStage],
      stageIds: [2],
    },
    global: {
      mocks: {
        $t: (key: string) => arabicLabels[key] ?? key,
      },
      stubs: {
        Dialog: DialogStub,
      },
    },
  });

  await flushPromises();

  return wrapper;
};

describe('ProductShowStages', () => {
  beforeEach(() => {
    controllerMocks.deleteProductStage.mockReset().mockResolvedValue({
      data: { status: false },
    });
    stageControllerMocks.fetchList.mockReset().mockResolvedValue({
      data: [
        { id: 1, parent_id: null, title: 'Main Stage' },
        { id: 2, parent_id: 1, title: 'Sub Stage' },
      ],
    });
  });

  it('keeps the stage when the confirmation dialog is canceled', async () => {
    const wrapper = await mountStages();

    await wrapper.get('.delete-stage-btn').trigger('click');

    expect(wrapper.get('.dialog-title').text()).toBe('هل تريد المسح؟');
    expect(wrapper.get('.dialog-message').text()).toBe('هل أنت متأكد أنك تريد حذف هذا العنصر؟');
    expect(wrapper.get('.btn-dialog-confirm').text()).toBe('تأكيد');
    expect(wrapper.get('.btn-dialog-cancel').text()).toBe('إلغاء');
    expect(controllerMocks.deleteProductStage).not.toHaveBeenCalled();

    await wrapper.get('.btn-dialog-cancel').trigger('click');

    expect(controllerMocks.deleteProductStage).not.toHaveBeenCalled();
  });

  it('deletes the stage only after confirmation', async () => {
    const wrapper = await mountStages();

    await wrapper.get('.delete-stage-btn').trigger('click');
    expect(controllerMocks.deleteProductStage).not.toHaveBeenCalled();

    await wrapper.get('.btn-dialog-confirm').trigger('click');
    await flushPromises();

    expect(controllerMocks.deleteProductStage).toHaveBeenCalledOnce();
    const deleteParams = controllerMocks.deleteProductStage.mock.calls[0][0];

    expect(deleteParams).toBeInstanceOf(DeleteProductsStageParams);
    expect(deleteParams.toMap()).toEqual({ product_id: 9, stage_ids: [2] });
  });
});
