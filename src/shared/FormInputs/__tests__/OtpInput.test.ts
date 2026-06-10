import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OtpInput from '../OtpInput.vue';

// Stub PrimeVue InputOtp
const InputOtpStub = {
  name: 'InputOtp',
  template: `
    <div class="input-otp-stub">
      <slot :attrs="{ placeholder: '' }" :events="{ input: () => {} }" />
    </div>
  `,
  props: ['modelValue'],
  emits: ['update:modelValue'],
};

const createWrapper = () =>
  mount(OtpInput, {
    global: {
      stubs: { InputOtp: InputOtpStub },
      mocks: { $t: (key: string) => key },
    },
  });

describe('OtpInput', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the InputOtp stub', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(InputOtpStub).exists()).toBe(true);
  });

  it('renders a custom input inside the slot', () => {
    const wrapper = createWrapper();
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
  });

  it('applies custom-otp-input class to input', () => {
    const wrapper = createWrapper();
    const input = wrapper.find('input.custom-otp-input');
    expect(input.exists()).toBe(true);
  });
});
