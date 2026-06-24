import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import MaterialsForm from '../MaterialsForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));
vi.mock('@/modules/shared/Brand/presentation/controllers/brand.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));
vi.mock('@/modules/shared/measurement/presentation/controllers/measurement.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));

const MultiLangInputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    "<button class=\"translation-input\" @click=\"$emit('update:modelValue', { en: 'Cement', ar: 'Cement AR' })\">translate</button>",
};

const SelectStub = {
  props: ['id'],
  emits: ['update:modelValue'],
  template:
    "<button :class=\"id\" @click=\"$emit('update:modelValue', id === 'material-brand' ? { id: 7, title: 'Acme' } : { id: 2, title: 'bag' })\">select</button>",
};

describe('MaterialsForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits translated title, price, brand, and unit in the material params', async () => {
    const wrapper = mount(MaterialsForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub, UpdatedCustomInputSelect: SelectStub },
      },
    });

    await wrapper.find('.translation-input').trigger('click');
    await wrapper.find<HTMLInputElement>('#material-price').setValue('125');
    await wrapper.find('.material-brand').trigger('click');
    await wrapper.find('.material-measurement').trigger('click');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as { toMap: () => Record<string, unknown> };
    expect(params.toMap()).toEqual({
      price: 125,
      brand_id: 7,
      measurement_unit_id: 2,
      translations: { title: { en: 'Cement', ar: 'Cement AR' } },
    });
  });
});
