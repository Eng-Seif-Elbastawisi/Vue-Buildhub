import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MeasurementModel from '../../../core/models/measurement.model';
import EditMeasurementParams from '../../../core/params/edit.measurement.params';
import ShowMeasurementParams from '../../../core/params/show.measurement.params';
import MeasurementEdit from '../MeasurementEdit.vue';

const mockPush = vi.fn();
const itemData = ref<MeasurementModel | null>(MeasurementModel.example);
const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn().mockResolvedValue(true),
  update: vi.fn().mockResolvedValue(true),
  itemData,
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/measurement.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' }, path: '/organization/measurement/edit/1', fullPath: '/organization/measurement/edit/1' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('MeasurementEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches one measurement on mount', () => {
    mount(MeasurementEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MeasurementForm: true,
          AppButton: true,
          IconAccept: true,
        },
      },
    });

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowMeasurementParams));
  });

  it('saves updated measurement params including status', async () => {
    const wrapper = mount(MeasurementEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MeasurementForm: {
            props: ['measurement', 'loading', 'isEdit'],
            emits: ['updateData'],
            template: '<div class="measurement-form-stub"></div>',
          },
          AppButton: {
            props: ['loading'],
            emits: ['click'],
            template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
          },
          IconAccept: true,
        },
      },
    });

    const editParams = new EditMeasurementParams({
      id: 1,
      translations: { title: { en: 'Kg Updated', ar: 'كجم معدل' } },
      code: 'KG',
      precision: 2,
      status: true,
    });

    wrapper.findComponent({ name: 'MeasurementForm' }).vm.$emit('updateData', editParams);

    const saveBtn = wrapper.findAll('.app-button-stub')[0];
    await saveBtn.trigger('click');

    expect(mockController.update).toHaveBeenCalledWith(editParams, undefined, '/organization/measurement/edit/1');
  });

  it('navigates to measurement list on cancel', async () => {
    const wrapper = mount(MeasurementEdit, {
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
