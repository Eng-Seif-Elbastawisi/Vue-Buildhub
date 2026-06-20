import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminModel from '../../../core/models/admin.model';
import AddAdminParams from '../../../core/params/add.admin.params';
import AdminForm from '../AdminForm.vue';

const route = vi.hoisted(() => ({ params: {} as Record<string, string> }));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => route,
}));

const global = {
  stubs: { DocumentIcon: true },
  mocks: { $t: (key: string) => key },
};

describe('AdminForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    route.params = {};
  });

  it('emits add params from form inputs', async () => {
    const wrapper = mount(AdminForm, { global });

    await wrapper.find<HTMLInputElement>('#admin-name').setValue('Admin User');
    await wrapper.find<HTMLInputElement>('#admin-email').setValue('admin@example.com');
    await wrapper.find<HTMLInputElement>('#admin-phone').setValue('01000000000');
    await wrapper.find<HTMLInputElement>('#admin-password').setValue('secret123');

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddAdminParams;
    expect(params).toBeInstanceOf(AddAdminParams);
    expect(params.toMap()).toEqual({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '01000000000',
      password: 'secret123',
    });
  });

  it('prefills admin data and hides password on edit routes', () => {
    route.params = { id: '1' };
    const wrapper = mount(AdminForm, {
      global,
      props: { admin: AdminModel.example, loading: true },
    });

    expect(wrapper.find<HTMLInputElement>('#admin-name').element.value).toBe(
      AdminModel.example.name,
    );
    expect(wrapper.find('#admin-password').exists()).toBe(false);
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddAdminParams);
  });
});
