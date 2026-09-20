import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import EditMaterialParams from '../../../core/params/edit.materials.params';
import MaterialsEdit from '../MaterialsEdit.vue';

const controller = vi.hoisted(() => ({
  fetchOne: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  itemData: { value: {} },
  errorMessage: { value: '' },
}));

vi.mock('../../controllers/materials.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal();
  return {
    ...vueRouter,
    useRoute: () => ({
      fullPath: '/organization/material/edit/9',
      params: { material_id: '9' },
    }),
  };
});

describe('MaterialsEdit', () => {
  it('preserves relation IDs and status in the update request', async () => {
    const wrapper = mount(MaterialsEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MaterialsForm: {
            name: 'MaterialsForm',
            template: '<div />',
          },
        },
      },
    });
    await flushPromises();

    const editParams = new EditMaterialParams({
      material_id: 9,
      price: 100,
      brandId: 2,
      measurementId: 3,
      translations: { title: { en: 'Steel' } },
      itemTypeId: 4,
      stageId: 5,
      subStageId: 6,
      status: false,
    });

    wrapper.findComponent({ name: 'MaterialsForm' }).vm.$emit('update-data', editParams);
    await wrapper.get('button').trigger('click');

    const submittedParams = controller.update.mock.calls[0]?.[0] as EditMaterialParams;
    expect(submittedParams).toBeInstanceOf(EditMaterialParams);
    expect(submittedParams.toMap()).toMatchObject({
      material_id: 9,
      item_type_id: 4,
      stage_id: 5,
      sub_stage_id: 6,
      status: false,
    });
  });
});
