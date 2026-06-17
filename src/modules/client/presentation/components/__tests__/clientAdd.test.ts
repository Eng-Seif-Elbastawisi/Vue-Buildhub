import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, onMounted } from 'vue';
import ClientAdd from '../clientAdd.vue';

const create = vi.fn().mockResolvedValue({});
const params = { validate: vi.fn(), toMap: vi.fn() };

vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/client/add' }) }));
vi.mock('../../controllers/client.controller.ts', () => ({
  default: { getInstance: () => ({ create, errorMessage: { value: null } }) },
}));
vi.mock('../clientForm.vue', () => ({
  default: defineComponent({
    emits: ['updateData'],
    setup(_, { emit }) {
      onMounted(() => emit('updateData', params));
      return () => h('div');
    },
  }),
}));

describe('ClientAdd', () => {
  it('creates with the latest emitted params', async () => {
    const wrapper = mount(ClientAdd, { global: { mocks: { $t: (key: string) => key } } });

    await wrapper.find('button').trigger('click');

    expect(create).toHaveBeenCalledWith(params, undefined, '/client/add');
  });
});
