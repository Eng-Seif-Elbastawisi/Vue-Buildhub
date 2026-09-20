import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmployeeModel from '../../../core/models/employee.model';
import AddEmployeeParams from '../../../core/params/add.employee.params';
import { EmployeeType } from '../../../core/constants/type.enum';
import EmployeeForm from '../EmployeeForm.vue';

const route = vi.hoisted(() => ({ params: {} as Record<string, string> }));

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => route,
}));

vi.mock('@/shared/FormInputs/UpdatedCustomInputSelect.vue', () => ({
  default: {
    name: 'UpdatedCustomInputSelect',
    props: {
      id: {
        type: String,
        default: '',
      },
      modelValue: {
        type: Object,
        default: null,
      },
      staticOptions: {
        type: Array,
        default: () => [],
      },
      label: {
        type: String,
        default: '',
      },
      placeholder: {
        type: String,
        default: '',
      },
    },
    emits: ['update:modelValue'],
    template: `
      <select
        :id="id"
        data-testid="employee-type-select"
        :value="modelValue?.id ?? ''"
        @change="$emit(
          'update:modelValue',
          staticOptions.find((option) => String(option.id) === String($event.target.value)) ?? null
        )"
      >
        <option value="">Select</option>
        <option
          v-for="option in staticOptions"
          :key="option.id"
          :value="option.id"
        >
          {{ option.title }}
        </option>
      </select>
    `,
  },
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

    await wrapper
      .find('[data-testid="employee-type-select"]')
      .setValue(String(EmployeeType.ENGINEER));

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddEmployeeParams;

    expect(params).toBeInstanceOf(AddEmployeeParams);
    expect(params.toMap()).toEqual({
      name: 'Employee User',
      email: 'employee@example.com',
      phone: '01000000000',
      password: 'secret123',
      type: EmployeeType.ENGINEER,
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

    expect(wrapper.find<HTMLInputElement>('#admin-email').element.value).toBe(
      EmployeeModel.example.email,
    );

    expect(wrapper.find<HTMLInputElement>('#admin-phone').element.value).toBe(
      EmployeeModel.example.phone,
    );

    expect(wrapper.find('#admin-password').exists()).toBe(false);
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);

    const emittedParam = wrapper.emitted('updateData')?.at(-1)?.[0];

    expect(emittedParam).toBeInstanceOf(AddEmployeeParams);
  });
});
