import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../../core/constant/project.pricing.discount.enum';
import ProjectPricingShowModel from '../../../core/models/project.pricing.show.model';
import AddProjectPricingParams from '../../../core/params/add.project.pricing.params';
import ProjectPricingForm from '../ProjectPricingForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

describe('ProjectPricingForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('emits complete pricing params from form inputs', async () => {
    const wrapper = mount(ProjectPricingForm, {
      props: { projectId: 4 },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    await wrapper.find<HTMLInputElement>('#project-pricing-total-tax').setValue('14');
    await wrapper.findAll('.discount-toggle button')[0].trigger('click');
    await wrapper.find<HTMLInputElement>('#project-pricing-discount-value').setValue('250');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as AddProjectPricingParams;

    expect(params.toMap()).toEqual({
      project_id: 4,
      total_tax: 14,
      discount_type: ProjectPricingDiscountEnum.FIXED,
      discount_value: 250,
    });
  });

  it('prefills values from existing pricing', () => {
    const wrapper = mount(ProjectPricingForm, {
      props: { item: ProjectPricingShowModel.example, loading: true },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.find<HTMLInputElement>('#project-pricing-total-tax').element.value).toBe(
      String(ProjectPricingShowModel.example.total_tax),
    );
    expect(wrapper.find('.pricing-summary-card.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddProjectPricingParams);
  });

  it('shows a validation error for percentage discounts above 100', async () => {
    const wrapper = mount(ProjectPricingForm, {
      props: { projectId: 4 },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    await wrapper.findAll('.discount-toggle button')[1].trigger('click');
    const discountInput = wrapper.find<HTMLInputElement>('#project-pricing-discount-value');
    await discountInput.setValue('200');

    expect(discountInput.attributes('max')).toBe('100');
    expect(wrapper.find('#project-pricing-discount-value-error').text()).toBe(
      'Percentage discount must be between 0% and 100%.',
    );
  });
});
