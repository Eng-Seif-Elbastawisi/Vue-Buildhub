import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { BrandTypeEnum } from '../../../core/constant/Brand.type.enum';
import BrandForm from '../BrandForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

const MultiLangInputStub = {
  emits: ['update:modelValue'],
  template:
    "<button class=\"set-title\" @click=\"$emit('update:modelValue', { en: 'Acme', ar: 'أكمي' })\" />",
};
const SelectStub = {
  props: ['staticOptions'],
  emits: ['update:modelValue'],
  template: '<button class="set-type" @click="$emit(\'update:modelValue\', staticOptions[0])" />',
};

describe('BrandForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits translated titles and the selected brand type', async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          'brand.types.materials': 'Materials',
          'brand.types.supplies': 'Supplies',
        },
      },
    });
    const wrapper = mount(BrandForm, {
      global: {
        plugins: [i18n],
        stubs: {
          DocumentIcon: true,
          MultiLangInput: MultiLangInputStub,
          UpdatedCustomInputSelect: SelectStub,
        },
      },
    });

    await wrapper.find('.set-title').trigger('click');
    await wrapper.find('.set-type').trigger('click');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as { toMap: () => Record<string, unknown> };
    expect(params.toMap()).toEqual({
      translations: { title: { en: 'Acme', ar: 'أكمي' } },
      type: BrandTypeEnum.MATERIALS,
    });
  });
});
