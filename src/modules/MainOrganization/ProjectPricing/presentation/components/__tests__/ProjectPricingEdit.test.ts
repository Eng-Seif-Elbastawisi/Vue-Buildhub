import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../../core/constant/project.pricing.discount.enum';
import ProjectPricingShowModel from '../../../core/models/project.pricing.show.model';
import AddProjectPricingParams from '../../../core/params/add.project.pricing.params';
import EditProjectPricingParams from '../../../core/params/edit.project.pricing.params';
import ShowProjectPricingParams from '../../../core/params/show.project.pricing.params';
import ProjectPricingEdit from '../ProjectPricingEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as ProjectPricingShowModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/project.pricing.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/project-pricing/edit/12', params: { id: '12' } }),
}));

const addParams = new AddProjectPricingParams({
  total_tax: 14,
  discount_type: ProjectPricingDiscountEnum.FIXED,
  discount_value: 250,
});

const global = {
  stubs: {
    ProjectPricingForm: {
      emits: ['updateData'],
      template: '<div class="pricing-form-stub" @click="$emit(\'updateData\', addParams)"></div>',
      setup: () => ({ addParams }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectPricingEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = ProjectPricingShowModel.example;
    mockController.errorMessage.value = null;
  });

  it('fetches project pricing on mount using route id', async () => {
    mount(ProjectPricingEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowProjectPricingParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].project_pricing_id).toBe(12);
    expect(mockController.fetchOne.mock.calls[0]?.[0].allLocales).toBe(true);
  });

  it('updates project pricing with converted edit params', async () => {
    const wrapper = mount(ProjectPricingEdit, { global });

    await wrapper.find('.pricing-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditProjectPricingParams),
      undefined,
      '/project-pricing/edit/12',
    );
    expect(mockController.update.mock.calls[0]?.[0].project_pricing_id).toBe(12);
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(ProjectPricingEdit, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
