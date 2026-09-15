import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddMeasurementParams from '../../../core/params/add.measurement.params';
import MeasurementAdd from '../MeasurementAdd.vue';

const mockPush = vi.fn();
const mockController = vi.hoisted(() => ({
  create: vi.fn().mockResolvedValue(true),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/measurement.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/organization/measurement/add', fullPath: '/organization/measurement/add' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('MeasurementAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and saves measurement params including status', async () => {
    const wrapper = mount(MeasurementAdd, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MeasurementForm: {
            emits: ['updateData'],
            template: '<div class="measurement-form-stub"></div>',
          },
          AppButton: {
            props: ['loading', 'disabled'],
            emits: ['click'],
            template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
          },
          IconAccept: true,
        },
      },
    });

    const addParams = new AddMeasurementParams({
      translations: { title: { en: 'Kg', ar: 'كجم' } },
      code: 'KG',
      precision: 2,
      status: true,
    });

    // Emit updateData from child form
    wrapper.findComponent({ name: 'MeasurementForm' }).vm.$emit('updateData', addParams);

    // Click Save
    const saveBtn = wrapper.findAll('.app-button-stub')[0];
    await saveBtn.trigger('click');

    expect(mockController.create).toHaveBeenCalledWith(addParams, undefined, '/organization/measurement/add');
  });

  it('navigates to measurement list on cancel', async () => {
    const wrapper = mount(MeasurementAdd, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MeasurementForm: true,
          AppButton: {
            emits: ['click'],
            template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
          },
          IconAccept: true,
        },
      },
    });

    const cancelBtn = wrapper.findAll('.app-button-stub')[1];
    await cancelBtn.trigger('click');

    expect(mockPush).toHaveBeenCalledWith('/organization/measurement');
  });
});
