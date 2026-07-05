import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import EmployeeEdit from '../EmployeeEdit.vue';

const fetchOne = vi.fn();
const updateEmployee = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/organization/employee/edit/42', params: { employee_id: '42' } }),
}));

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      update: updateEmployee,
      itemData: { value: { id: 42, name: 'Mona' } },
      errorMessage: { value: '' },
    }),
  },
}));

describe('EmployeeEdit', () => {
  it('loads the employee and submits edit params', async () => {
    const wrapper = mount(EmployeeEdit, {
      global: {
        stubs: {
          EmployeeForm: {
            emits: ['updateData'],
            template: `
              <button
                class="employee-form-stub"
                @click="$emit('updateData', {
                  name: 'Mona',
                  email: 'mona@example.com',
                  phone: '01000000000',
                  password: '',
                  type: 2
                })"
              >
                form
              </button>
            `,
          },
        },
      },
    });

    expect(fetchOne).toHaveBeenCalled();
    expect(fetchOne.mock.calls[0][0].toMap()).toEqual({ employee_id: 42 });
    expect(wrapper.text()).toContain('Update Employee');

    await wrapper.find('.employee-form-stub').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');

    expect(updateEmployee).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      '/organization/employee/edit/42',
    );
    expect(updateEmployee.mock.calls[0][0].toMap()).toMatchObject({
      employee_id: 42,
      name: 'Mona',
      email: 'mona@example.com',
      phone: '01000000000',
      password: undefined,
      type: 2,
    });
  });
});
