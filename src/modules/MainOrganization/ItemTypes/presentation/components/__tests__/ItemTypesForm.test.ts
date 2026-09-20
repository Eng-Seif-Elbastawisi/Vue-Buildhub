import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type AddItemTypesParams from '../../../core/params/add.item.types.params';
import ItemTypesForm from '../ItemTypesForm.vue';

describe('ItemTypesForm', () => {
  it('emits an active status by default for a new item type', () => {
    const wrapper = mount(ItemTypesForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          MultiLangInput: true,
          UpdatedCustomInputSelect: true,
          StatusToggleField: true,
        },
      },
    });

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddItemTypesParams;
    expect(params.status).toBe(true);
  });
});
