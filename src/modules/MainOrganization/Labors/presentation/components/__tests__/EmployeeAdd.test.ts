import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import EmployeeAdd from '../EmployeeAdd.vue';

const createEmployee = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/organization/employee/add' }),
}));

vi.mock('../../controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      create: createEmployee,
      errorMessage: { value: '' },
    }),
  },
}));

describe('EmployeeAdd', () => {
  it('creates an employee after the form emits params', async () => {
    const employeeParams = { toMap: () => ({ name: 'Mona' }) };
    const wrapper = mount(EmployeeAdd, {
      global: {
        stubs: {
          EmployeeForm: {
            emits: ['updateData'],
            template:
              '<button class="employee-form-stub" @click="$emit(`updateData`, employeeParams)">form</button>',
            setup: () => ({ employeeParams }),
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Save Employee');

    await wrapper.find('.employee-form-stub').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');

    expect(createEmployee).toHaveBeenCalledWith(
      employeeParams,
      undefined,
      '/organization/employee/add',
    );
  });
});
