import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LocationForm from '../locationForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

const MultiLangInputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `
    <button class="translation-input" @click="$emit('update:modelValue', { en: 'Building', ar: 'مبنى' })">
      translate
    </button>
  `,
};

describe('LocationForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits translated title in the location params', async () => {
    const wrapper = mount(LocationForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub },
      },
    });

    await wrapper.find('.translation-input').trigger('click');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as { toMap: () => Record<string, unknown> };

    expect(params.toMap()).toEqual({
      parent_id: undefined,
      code: undefined,
      type: 1,
      translations: { title: { en: 'Building', ar: 'مبنى' } },
    });
  });
});
