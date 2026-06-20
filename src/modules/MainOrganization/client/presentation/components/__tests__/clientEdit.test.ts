import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, onMounted } from 'vue';
import ClientEdit from '../clientEdit.vue';

const fetchOne = vi.fn().mockResolvedValue({});
const update = vi.fn().mockResolvedValue({});
const addParams = {
  toMap: () => ({ phone: 20100100100, name: 'Ali', email: 'ali@example.com', address: 'Cairo' }),
};

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/client/edit/7', params: { client_id: '7' } }),
}));
vi.mock('../../controllers/client.controller.ts', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      update,
      itemData: { value: null },
      errorMessage: { value: null },
    }),
  },
}));
vi.mock('../clientForm.vue', () => ({
  default: defineComponent({
    emits: ['updateData'],
    setup(_, { emit }) {
      onMounted(() => emit('updateData', addParams));
      return () => h('div');
    },
  }),
}));

describe('ClientEdit', () => {
  it('wraps form params with the route client id before update', async () => {
    const wrapper = mount(ClientEdit, { global: { mocks: { $t: (key: string) => key } } });

    await wrapper.find('button').trigger('click');

    const submitted = update.mock.calls[0][0] as { toMap: () => Record<string, unknown> };
    expect(fetchOne).toHaveBeenCalledOnce();
    expect(submitted.toMap()).toEqual({
      client_id: 7,
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });
  });
});
