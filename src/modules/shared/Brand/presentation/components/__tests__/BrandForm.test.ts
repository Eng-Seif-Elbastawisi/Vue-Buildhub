import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BrandForm from '../BrandForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

const SelectStub = {
  template: '<div class="equipment-select" />',
};

describe('BrandForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits the brand title as AddBrandParams', async () => {
    const wrapper = mount(BrandForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { DocumentIcon: true, UpdatedCustomInputSelect: SelectStub },
      },
    });

    await wrapper.find<HTMLInputElement>('#title').setValue('Acme');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as { toMap: () => Record<string, unknown> };
    expect(params.toMap()).toEqual({ name: 'Acme', equipment: undefined });
  });
});
