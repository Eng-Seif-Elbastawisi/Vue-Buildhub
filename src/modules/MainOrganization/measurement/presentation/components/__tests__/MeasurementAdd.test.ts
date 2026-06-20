import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MeasurementModel from '../../../core/models/stage.model';
import AddMeasurementParams from '../../../core/params/add.measurement.params';
import EditMeasurementParams from '../../../core/params/edit.measurement.params';
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
  useRoute: () => ({ fullPath: '/measurements/add' }),
}));

const global = {
  stubs: {
    MeasurementForm: {
      props: ['stage', 'loading'],
      emits: ['updateData'],
      template:
        '<div class="measurement-form-stub" @click="$emit(\'updateData\', stage ? newEditParams() : newAddParams())"></div>',
      methods: {
        newAddParams: () =>
          new AddMeasurementParams({ translations: { title: { en: 'Primary' } } }),
        newEditParams: () =>
          new EditMeasurementParams({
            id: MeasurementModel.example.id!,
            translations: { title: { en: 'Primary' } },
          }),
      },
    },
    AppButton: {
      emits: ['click'],
      template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
    },
    IconAccept: true,
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('MeasurementAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates a measurement from form params and emits saved', async () => {
    const wrapper = mount(MeasurementAdd, { global });

    await wrapper.find('.measurement-form-stub').trigger('click');
    await wrapper.find('.app-button-stub').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(expect.any(AddMeasurementParams), undefined);
    expect(mockController.update).not.toHaveBeenCalled();
    expect(wrapper.emitted('saved')).toHaveLength(1);
  });

  it('updates a measurement when edit params are emitted', async () => {
    const wrapper = mount(MeasurementAdd, { global, props: { stage: MeasurementModel.example } });

    await wrapper.find('.measurement-form-stub').trigger('click');
    await wrapper.find('.app-button-stub').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditMeasurementParams),
      undefined,
    );
    expect(mockController.create).not.toHaveBeenCalled();
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(MeasurementAdd, { global });
    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
