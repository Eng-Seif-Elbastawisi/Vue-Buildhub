import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ClientForm from '../clientForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

describe('ClientForm', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('emits client params from the entered form values', async () => {
    const wrapper = mount(ClientForm, {
      global: { mocks: { $t: (key: string) => key } },
    });

    await wrapper.find<HTMLInputElement>('#name').setValue('Ali');
    await wrapper.find<HTMLInputElement>('#material-price').setValue('20100100100');
    await wrapper.find<HTMLInputElement>('#email').setValue('ali@example.com');
    await wrapper.find<HTMLInputElement>('#address').setValue('Cairo');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as { toMap: () => Record<string, unknown> };

    expect(params.toMap()).toEqual({
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });
  });
});
