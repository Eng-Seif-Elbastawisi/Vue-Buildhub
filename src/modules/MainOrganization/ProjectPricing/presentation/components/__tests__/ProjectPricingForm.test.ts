import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../../core/constant/project.pricing.discount.enum';
import ProjectPricingShowModel from '../../../core/models/project.pricing.show.model';
import AddProjectPricingParams from '../../../core/params/add.project.pricing.params';
import ProjectPricingForm from '../ProjectPricingForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

const SelectStub = {
  props: ['id'],
  emits: ['update:modelValue'],
  template:
    '<button :class="id" @click="$emit(\'update:modelValue\', optionFor(id))">select</button>',
  methods: {
    optionFor(id: string) {
      const options: Record<string, { id: number; title: string }> = {
        'project-pricing-discount-type': {
          id: ProjectPricingDiscountEnum.FIXED,
          title: 'Fixed',
        },
      };
      return options[id];
    },
  },
};

describe('ProjectPricingForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('emits complete pricing params from form inputs', async () => {
    const wrapper = mount(ProjectPricingForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });

    await wrapper.find<HTMLInputElement>('#project-pricing-total-tax').setValue('14');
    await wrapper.find('.project-pricing-discount-type').trigger('click');
    await wrapper.find<HTMLInputElement>('#project-pricing-discount-value').setValue('250');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as AddProjectPricingParams;

    expect(params.toMap()).toEqual({
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
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });

    expect(wrapper.find<HTMLInputElement>('#project-pricing-total-tax').element.value).toBe(
      String(ProjectPricingShowModel.example.total_tax),
    );
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddProjectPricingParams);
  });
});
