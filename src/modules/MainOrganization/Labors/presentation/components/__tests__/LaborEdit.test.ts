import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import EditLaborParams from '../../../core/params/edit.labor.params';
import LaborEdit from '../LaborEdit.vue';

const controller = vi.hoisted(() => ({
  fetchOne: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  itemData: { value: {} },
  errorMessage: { value: '' },
}));

vi.mock('../../controllers/labor.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal();
  return {
    ...vueRouter,
    useRoute: () => ({
      fullPath: '/organization/labor/edit/7',
      params: { labor_id: '7' },
    }),
  };
});

describe('LaborEdit', () => {
  it('preserves item, stage, and sub-stage IDs in the update request', async () => {
    const wrapper = mount(LaborEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          LaborForm: {
            name: 'LaborForm',
            template: '<div />',
          },
        },
      },
    });
    await flushPromises();

    wrapper.findComponent({ name: 'LaborForm' }).vm.$emit(
      'update-data',
      new EditLaborParams({
        laborId: 7,
        price: 150,
        measurementId: 6,
        translations: { title: { en: 'Painting' } },
        itemTypeId: 11,
        stageId: 21,
        subStageId: 31,
      }),
    );
    await wrapper.get('button').trigger('click');

    const updateParams = controller.update.mock.calls[0]?.[0];
    expect(updateParams.toMap()).toMatchObject({
      labor_id: 7,
      item_type_id: 11,
      stage_id: 21,
      sub_stage_id: 31,
    });
    expect(controller.fetchOne).toHaveBeenCalledOnce();
  });
});
