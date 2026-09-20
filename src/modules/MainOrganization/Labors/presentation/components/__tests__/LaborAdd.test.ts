import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AddLaborParams from '../../../core/params/add.labor.params';
import LaborAdd from '../LaborAdd.vue';

const create = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('../../controllers/labor.controller', () => ({
  default: {
    getInstance: () => ({ create, errorMessage: { value: '' } }),
  },
}));

vi.mock('vue-router', async (importOriginal) => {
  const vueRouter = await importOriginal();
  return {
    ...vueRouter,
    useRoute: () => ({ fullPath: '/organization/labor/add' }),
  };
});

describe('LaborAdd', () => {
  it('submits the Labor form payload', async () => {
    const params = new AddLaborParams({
      price: 100,
      measurementId: 5,
      translations: { title: { en: 'Installation' } },
      itemTypeId: 10,
      stageId: 20,
      subStageId: 30,
    });
    const wrapper = mount(LaborAdd, {
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

    wrapper.findComponent({ name: 'LaborForm' }).vm.$emit('update-data', params);
    await wrapper.get('button').trigger('click');

    expect(create).toHaveBeenCalledWith(params, undefined, '/organization/labor/add');
    expect(wrapper.text()).toContain('labor.save');
  });
});
