import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SuppliersForm from '../SuppliersForm.vue';

vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }));

describe('SuppliersForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('shows validation for a negative phone number', async () => {
    const wrapper = mount(SuppliersForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { DocumentIcon: true, FieldHelpIcon: true },
      },
    });

    const phoneInput = wrapper.find<HTMLInputElement>('#supplier-phone');
    await phoneInput.setValue('-123456789');

    expect(phoneInput.attributes('pattern')).toBe('[0-9]*');
    expect(wrapper.find('#supplier-phone-error').text()).toBe(
      'The phone number must contain only positive digits.',
    );
  });
});
