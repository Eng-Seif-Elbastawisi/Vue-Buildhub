import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MeasurementModel from '../../../core/models/stage.model';
import EditMeasurementParams from '../../../core/params/edit.measurement.params';
import ShowMeasurementParams from '../../../core/params/show.measurement.params';
import MeasurementEdit from '../MeasurementEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as MeasurementModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/measurement.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '12' } }),
}));

const global = {
  stubs: {
    MeasurementForm: {
      emits: ['updateData'],
      template:
        '<div class="measurement-form-stub" @click="$emit(\'updateData\', newParams())"></div>',
      methods: {
        newParams: () =>
          new EditMeasurementParams({ id: 12, translations: { title: { en: 'Updated' } } }),
      },
    },
  },
};

describe('MeasurementEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = MeasurementModel.example;
    mockController.errorMessage.value = null;
  });

  it('fetches the measurement on mount', async () => {
    mount(MeasurementEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowMeasurementParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].id).toBe(12);
  });

  it('updates with emitted edit params', async () => {
    const wrapper = mount(MeasurementEdit, { global });

    await wrapper.find('.measurement-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(expect.any(EditMeasurementParams));
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(MeasurementEdit, { global });
    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
