import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, onMounted } from 'vue';
import LocationAdd from '../locationAdd.vue';

const create = vi.fn().mockResolvedValue({});
const params = { validate: vi.fn(), toMap: vi.fn() };

vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/location/add' }) }));
vi.mock('../../controllers/location.controller.ts', () => ({
  default: { getInstance: () => ({ create, errorMessage: { value: null } }) },
}));
vi.mock('../locationForm.vue', () => ({
  default: defineComponent({
    emits: ['updateData'],
    setup(_, { emit }) {
      onMounted(() => emit('updateData', params));
      return () => h('div');
    },
  }),
}));

describe('LocationAdd', () => {
  it('creates with the latest emitted params', async () => {
    const wrapper = mount(LocationAdd, { global: { mocks: { $t: (key: string) => key } } });

    await wrapper.find('button').trigger('click');

    expect(create).toHaveBeenCalledWith(params, undefined, '/location/add');
  });
});
