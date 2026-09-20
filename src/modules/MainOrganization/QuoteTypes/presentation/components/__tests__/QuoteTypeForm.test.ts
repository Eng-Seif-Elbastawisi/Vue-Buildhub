import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QuoteTypeModel from '../../../core/models/quote.types.model';
import QuoteTypeForm from '../QuoteTypeForm.vue';

const route = vi.hoisted(() => ({ params: {} as Record<string, string> }));

vi.mock('vue-router', () => ({ useRoute: () => route }));

const globalConfig = {
  mocks: { $t: (key: string) => key },
  stubs: {
    MultiLangInput: {
      props: ['modelValue'],
      template: '<div class="multi-lang-input" />',
    },
    ToggleSwitch: {
      props: ['modelValue'],
      template: '<input class="status-toggle" type="checkbox" />',
    },
  },
};

describe('QuoteTypeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.params = {};
  });

  it('allows entering a type code when adding a quote type', async () => {
    const wrapper = mount(QuoteTypeForm, { global: globalConfig });
    const typeCodeInput = wrapper.get<HTMLInputElement>('#quote-type-code');
    const calculationModelInput = wrapper.get<HTMLInputElement>('#quote-type-calculation-model');

    expect(typeCodeInput.attributes('readonly')).toBeUndefined();
    expect(calculationModelInput.attributes('readonly')).toBeDefined();

    await typeCodeInput.setValue('LUMP_SUM');

    const emittedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };
    const payload = emittedParams.toMap();

    expect(payload).toMatchObject({
      code: 'LUMP_SUM',
    });
    expect(payload).not.toHaveProperty('calculation_model');
  });

  it('shows the existing type code as read-only when editing a quote type', async () => {
    route.params = { id: '4' };
    const quoteType = new QuoteTypeModel({
      id: 4,
      title: 'Lump sum',
      translations: { title: { en: 'Lump sum' }, description: {} },
      typeCode: 'LUMP_SUM',
      calculationModel: 'FIXED_TOTAL',
      status: true,
    });
    const wrapper = mount(QuoteTypeForm, {
      props: { quoteType },
      global: globalConfig,
    });
    await wrapper.vm.$nextTick();

    const typeCodeInput = wrapper.get<HTMLInputElement>('#quote-type-code');
    const calculationModelInput = wrapper.get<HTMLInputElement>('#quote-type-calculation-model');

    expect(typeCodeInput.element.value).toBe('LUMP_SUM');
    expect(typeCodeInput.attributes('readonly')).toBeDefined();
    expect(typeCodeInput.attributes('aria-readonly')).toBe('true');
    expect(calculationModelInput.element.value).toBe('FIXED_TOTAL');
    expect(calculationModelInput.attributes('readonly')).toBeDefined();
  });
});
