import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import WarehouseShowModel from '../../../core/models/warehouse.show.model';
import WarehouseForm from '../WarehouseForm.vue';

const MultiLangInputStub = {
  emits: ['update:modelValue'],
  template:
    "<button class=\"title-input\" @click=\"$emit('update:modelValue', { en: 'Warehouse', ar: 'مستودع' })\">title</button>",
};

describe('WarehouseForm', () => {
  it('emits warehouse translations', async () => {
    const wrapper = mount(WarehouseForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub },
      },
    });
    await wrapper.find('.title-input').trigger('click');
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as { toMap: () => unknown };
    expect(params.toMap()).toEqual({
      translations: {
        title: { en: 'Warehouse', ar: 'مستودع' },
      },
    });
  });

  it('populates both languages from the show response', () => {
    const warehouse = WarehouseShowModel.fromJson({
      id: 2,
      translations: [
        { locale: 'ar', title: 'المستودع' },
        { locale: 'en', title: 'Central warehouse' },
      ],
    });
    const wrapper = mount(WarehouseForm, {
      props: { warehouse },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MultiLangInput: {
            props: ['modelValue'],
            template: '<span class="hydrated">{{ modelValue.ar }} | {{ modelValue.en }}</span>',
          },
        },
      },
    });
    expect(wrapper.find('.hydrated').text()).toBe('المستودع | Central warehouse');
  });
});
