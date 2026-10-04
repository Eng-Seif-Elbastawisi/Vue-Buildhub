import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import DepartmentModel from '../../../core/models/department.model';
import { Type } from '../../../core/constants/Type.enum';
import DepartmentAdd from '../DepartmentAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  resetItem: vi.fn(),
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
            props: ['resetKey', 'type'],
            template:
              '<div class="department-form-stub" :data-reset-key="resetKey" :data-type="type"></div>',
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

  it.each([Type.DESIGN, Type.SUPERVISION])(
    'keeps type %s in the shared inline form layout',
    (type) => {
      const wrapper = mount(DepartmentAdd, {
        props: { type },
        global: {
          mocks: { $t: (key: string) => key },
          stubs: {
            DepartmentForm: {
              props: ['type'],
              template: '<div class="department-form-stub" :data-type="type"></div>',
            },
            AppButton: true,
          },
        },
      });

      expect(wrapper.get('section.department-inline-form').exists()).toBe(true);
      expect(wrapper.find('section.department-page').exists()).toBe(false);
      expect(wrapper.find('.department-form-stub').attributes('data-type')).toBe(String(type));
    },
  );
});
