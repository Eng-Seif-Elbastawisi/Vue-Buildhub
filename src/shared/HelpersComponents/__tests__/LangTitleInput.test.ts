import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import LangTitleInput from '../LangTitleInput.vue';

// Mock PrimeVue Editor
vi.mock('primevue/editor', () => ({
  default: {
    template:
      '<textarea class="mock-editor" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'rows', 'editorStyle'],
    emits: ['update:modelValue'],
  },
}));

const mockLangs = [
  { title: 'English', locale: 'en', icon: { template: '<span>🇺🇸</span>' } },
  { title: 'Arabic', locale: 'ar', icon: { template: '<span>🇸🇦</span>' } },
];

const createWrapper = (props = {}) =>
  mount(LangTitleInput, {
    props: {
      langs: mockLangs,
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('LangTitleInput', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('has input-wrapper root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.input-wrapper').exists()).toBe(true);
  });

  it('displays the label', () => {
    const wrapper = createWrapper({ label: 'Name' });
    expect(wrapper.text()).toContain('Name');
  });

  it('defaults label to "Title"', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Title');
  });

  it('renders language radio buttons', () => {
    const wrapper = createWrapper();
    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(2);
  });

  it('renders a text input by default', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.lang-input').exists()).toBe(true);
  });

  it('renders editor for textarea type', () => {
    const wrapper = createWrapper({ type: 'textarea' });
    expect(wrapper.find('.mock-editor').exists()).toBe(true);
  });

  it('shows required asterisk when required', () => {
    const wrapper = createWrapper({ required: true });
    expect(wrapper.find('.text-red-500').exists()).toBe(true);
  });

  it('hides required asterisk when not required', () => {
    const wrapper = createWrapper({ required: false });
    expect(wrapper.find('.text-red-500').exists()).toBe(false);
  });

  it('emits update:modelValue on input change', async () => {
    const wrapper = createWrapper();
    const input = wrapper.find('.lang-input');
    await input.setValue('Hello');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('shows selected language indicator', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.select-lang').text()).toContain('EN');
  });

  it('initializes with first language', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.select-lang').text()).toContain('EN');
  });

  it('loads model value for current lang', () => {
    const wrapper = createWrapper({
      modelValue: [
        { locale: 'en', title: 'Hello' },
        { locale: 'ar', title: 'مرحبا' },
      ],
    });
    const input = wrapper.find('.lang-input');
    expect((input.element as HTMLInputElement).value).toBe('Hello');
  });

  it('renders lang indicators for languages with content', () => {
    const wrapper = createWrapper({
      modelValue: [
        { locale: 'en', title: 'Hello' },
        { locale: 'ar', title: '' },
      ],
    });
    const indicators = wrapper.findAll('.lang-indicator');
    expect(indicators).toHaveLength(1);
  });

  it('exposes validate method', () => {
    const wrapper = createWrapper();
    expect((wrapper.vm as any).validate).toBeDefined();
  });

  it('shows validation error when required field is empty', async () => {
    const wrapper = createWrapper({ required: true });
    (wrapper.vm as any).validate();
    await nextTick();
    expect(wrapper.find('.validation-error').exists()).toBe(true);
  });

  it('supports different field types', () => {
    const wrapper = createWrapper({ fieldType: 'description' });
    expect(wrapper.exists()).toBe(true);
  });

  it('applies disabled state', () => {
    const wrapper = createWrapper({ disabled: true });
    const input = wrapper.find('.lang-input');
    expect(input.attributes('disabled')).toBeDefined();
  });
});
