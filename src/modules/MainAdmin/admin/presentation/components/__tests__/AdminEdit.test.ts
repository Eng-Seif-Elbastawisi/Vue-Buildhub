import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminModel from '../../../core/models/admin.model';
import AddAdminParams from '../../../core/params/add.admin.params';
import EditAdminParams from '../../../core/params/edit.admin.params';
import ShowAdminParams from '../../../core/params/show.admin.params';
import AdminEdit from '../AdminEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as AdminModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/admin.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/admin/edit/12', params: { id: '12' } }),
}));

const addParams = new AddAdminParams({
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '01000000000',
  password: '',
});

const global = {
  stubs: {
    AdminForm: {
      emits: ['updateData'],
      template: '<div class="admin-form-stub" @click="$emit(\'updateData\', addParams)"></div>',
      setup: () => ({ addParams }),
    },
  },
  mocks: { $t: (key: string) => key },
};

describe('AdminEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = AdminModel.example;
    mockController.errorMessage.value = null;
  });

  it('fetches admin data on mount', async () => {
    mount(AdminEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowAdminParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].id).toBe(12);
  });

  it('updates an admin with converted edit params', async () => {
    const wrapper = mount(AdminEdit, { global });

    await wrapper.find('.admin-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditAdminParams),
      undefined,
      '/admin/edit/12',
    );
    expect(mockController.update.mock.calls[0]?.[0].id).toBe(12);
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(AdminEdit, { global });
    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
