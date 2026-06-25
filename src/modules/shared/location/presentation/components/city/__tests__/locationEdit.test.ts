import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddLocationParams from '../../../../core/params/add.location.params';
import EditLocationParams from '../../../../core/params/edit.location.params';
import ShowLocationParams from '../../../../core/params/show.location.params';
import LocationShowModel from '../../../../core/models/location.show.model';
import { LocationTypeEnum } from '../../../../core/constant/location.type.enum';
import LocationEdit from '../locationEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  errorMessage: { value: null as string | null },
  itemData: { value: null as LocationShowModel | null },
}));

vi.mock('../../../controllers/location.controller.ts', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/location-city/edit/12', params: { id: '12' } }),
}));

const global = {
  stubs: {
    LocationForm: {
      emits: ['updateData'],
      template: '<button class="location-form-stub" @click="$emit(\'updateData\', params)" />',
      data: () => ({
        params: new AddLocationParams({
          parentId: 8,
          type: LocationTypeEnum.CITY,
          translations: new TranslationParams({ title: { en: 'Cairo' } }),
        }),
      }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('CityLocationEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.errorMessage.value = null;
    mockController.itemData.value = LocationShowModel.example;
  });

  it('fetches the city location on mount', async () => {
    mount(LocationEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowLocationParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].location_id).toBe(12);
  });

  it('updates a city location from emitted form params', async () => {
    const wrapper = mount(LocationEdit, { global });

    await wrapper.find('.location-form-stub').trigger('click');
    await wrapper.find('button.btn').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditLocationParams),
      undefined,
      '/location-city/edit/12',
    );
    expect(mockController.update.mock.calls[0]?.[0].location_id).toBe(12);
  });
});
