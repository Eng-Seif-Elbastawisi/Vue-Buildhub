import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import MeasurementModel from '../../../core/models/measurement.model';
import MeasurementAdd from '../MeasurementAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/measurement.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/measurement/add' }),
}));

describe('MeasurementAdd smoke suite', () => {
  it('is covered by the current module tests', () => {
    expect(MeasurementAdd).toBeDefined();
  });

  it('shows cancel during edit and emits cancel while resetting the child form', async () => {
    const wrapper = mount(MeasurementAdd, {
      props: { stage: MeasurementModel.example },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MeasurementForm: {
            props: ['resetKey'],
            template: '<div class="measurement-form-stub" :data-reset-key="resetKey"></div>',
          },
          AppButton: {
            emits: ['click'],
            template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
          },
          IconAccept: true,
        },
      },
    });

    expect(wrapper.find('.measurement-form-stub').attributes('data-reset-key')).toBe('0');

    await wrapper.findAll('.app-button-stub').at(1)?.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.find('.measurement-form-stub').attributes('data-reset-key')).toBe('1');
  });
});
