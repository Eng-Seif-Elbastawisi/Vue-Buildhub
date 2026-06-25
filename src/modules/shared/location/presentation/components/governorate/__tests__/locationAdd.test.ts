import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddLocationParams from '../../../../core/params/add.location.params';
import { LocationTypeEnum } from '../../../../core/constant/location.type.enum';
import LocationAdd from '../locationAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../../controllers/location.controller.ts', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/location-governorate/add' }),
}));

const global = {
  stubs: {
    LocationForm: {
      emits: ['updateData'],
      template: '<button class="location-form-stub" @click="$emit(\'updateData\', params)" />',
      data: () => ({
        params: new AddLocationParams({
          type: LocationTypeEnum.GOVERNORATE,
          translations: new TranslationParams({ title: { en: 'Cairo Governorate' } }),
        }),
      }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('GovernorateLocationAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates a governorate location from emitted form params', async () => {
    const wrapper = mount(LocationAdd, { global });

    await wrapper.find('.location-form-stub').trigger('click');
    await wrapper.find('button.btn').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(
      expect.any(AddLocationParams),
      undefined,
      '/location-governorate/add',
    );
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';

    const wrapper = mount(LocationAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
