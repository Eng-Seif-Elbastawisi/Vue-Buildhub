import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import DepartmentModel from '../../../core/models/department.model';
import DepartmentAdd from '../DepartmentAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/department.controller', () => ({
  default: { getInstance: () => mockController },
}));

describe('DepartmentAdd', () => {
  it('is defined', () => expect(DepartmentAdd).toBeDefined());

  it('shows cancel during edit and emits cancel while resetting the child form', async () => {
    const wrapper = mount(DepartmentAdd, {
      props: { department: DepartmentModel.example() },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DepartmentForm: {
            props: ['resetKey'],
            template: '<div class="department-form-stub" :data-reset-key="resetKey"></div>',
          },
          AppButton: {
            emits: ['click'],
            template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    });

    expect(wrapper.find('.department-form-stub').attributes('data-reset-key')).toBe('0');

    await wrapper.findAll('.app-button-stub').at(1)?.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.find('.department-form-stub').attributes('data-reset-key')).toBe('1');
  });
});
