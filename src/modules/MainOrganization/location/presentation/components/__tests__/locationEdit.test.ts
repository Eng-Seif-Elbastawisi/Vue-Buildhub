import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, onMounted } from 'vue';
import { LocationTypeEnum } from '../../../core/constant/location.type.enum';
import LocationEdit from '../locationEdit.vue';

const fetchOne = vi.fn().mockResolvedValue({});
const update = vi.fn().mockResolvedValue({});
const addParams = {
  parentId: 2,
  code: 'B-01',
  type: LocationTypeEnum.building,
  translations: { title: { en: 'Building', ar: 'مبنى' } },
};

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/location/edit/7', params: { location_id: '7' } }),
}));
vi.mock('../../controllers/location.controller.ts', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      update,
      itemData: { value: null },
      errorMessage: { value: null },
    }),
  },
}));
vi.mock('../locationForm.vue', () => ({
  default: defineComponent({
    emits: ['updateData'],
    setup(_, { emit }) {
      onMounted(() => emit('updateData', addParams));
      return () => h('div');
    },
  }),
}));

describe('LocationEdit', () => {
  it('wraps form params with the route location id before update', async () => {
    const wrapper = mount(LocationEdit, { global: { mocks: { $t: (key: string) => key } } });

    await wrapper.find('button').trigger('click');

    const submitted = update.mock.calls[0][0] as { toMap: () => Record<string, unknown> };
    expect(fetchOne).toHaveBeenCalledOnce();
    expect(submitted.toMap()).toEqual({
      location_id: 7,
      parent_id: 2,
      code: 'B-01',
      type: LocationTypeEnum.building,
      translations: { title: { en: 'Building', ar: 'مبنى' } },
    });
  });
});
