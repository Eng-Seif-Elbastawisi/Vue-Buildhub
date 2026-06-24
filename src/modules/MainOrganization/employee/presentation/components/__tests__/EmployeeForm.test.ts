import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmployeeModel from '../../../core/models/employee.model';
import AddEmployeeParams from '../../../core/params/add.employee.params';
import EmployeeForm from '../EmployeeForm.vue';

const route = vi.hoisted(() => ({ params: {} as Record<string, string> }));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => route,
}));

const global = {
  stubs: { DocumentIcon: true },
  mocks: { $t: (key: string) => key },
};

describe('EmployeeForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    route.params = {};
  });

  it('emits add params from form inputs', async () => {
    const wrapper = mount(EmployeeForm, { global });

    await wrapper.find<HTMLInputElement>('#admin-name').setValue('Employee User');
    await wrapper.find<HTMLInputElement>('#admin-email').setValue('employee@example.com');
    await wrapper.find<HTMLInputElement>('#admin-phone').setValue('01000000000');
    await wrapper.find<HTMLInputElement>('#admin-password').setValue('secret123');

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddEmployeeParams;
    expect(params).toBeInstanceOf(AddEmployeeParams);
    expect(params.toMap()).toEqual({
      name: 'Employee User',
      email: 'employee@example.com',
      phone: '01000000000',
      password: 'secret123',
    });
  });

  it('prefills employee data and hides password on edit routes', () => {
    route.params = { employee_id: '1' };
    const wrapper = mount(EmployeeForm, {
      global,
      props: { admin: EmployeeModel.example, loading: true },
    });

    expect(wrapper.find<HTMLInputElement>('#admin-name').element.value).toBe(
      EmployeeModel.example.name,
    );
    expect(wrapper.find('#admin-password').exists()).toBe(false);
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddEmployeeParams);
  });
});
