import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddAdminParams from '../../../core/params/add.admin.params';
import AdminAdd from '../AdminAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/admin.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/admin/add' }),
}));

const params = new AddAdminParams({
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '01000000000',
  password: 'secret123',
});

const global = {
  stubs: {
    AdminForm: {
      emits: ['updateData'],
      template: '<div class="admin-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
  },
  mocks: { $t: (key: string) => key },
};

describe('AdminAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates an admin with emitted form params', async () => {
    const wrapper = mount(AdminAdd, { global });

    await wrapper.find('.admin-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(params, undefined, '/admin/add');
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(AdminAdd, { global });
    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
