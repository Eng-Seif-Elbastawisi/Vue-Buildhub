import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../../core/constant/project.pricing.discount.enum';
import AddProjectPricingParams from '../../../core/params/add.project.pricing.params';
import ProjectPricingAdd from '../ProjectPricingAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/project.pricing.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/project-pricing/add' }),
}));

const params = new AddProjectPricingParams({
  total_tax: 14,
  discount_type: ProjectPricingDiscountEnum.FIXED,
  discount_value: 250,
});

const global = {
  stubs: {
    ProjectPricingForm: {
      emits: ['updateData'],
      template: '<div class="pricing-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectPricingAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates project pricing with emitted form params', async () => {
    const wrapper = mount(ProjectPricingAdd, { global });

    await wrapper.find('.pricing-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(params, undefined, '/project-pricing/add');
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(ProjectPricingAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
