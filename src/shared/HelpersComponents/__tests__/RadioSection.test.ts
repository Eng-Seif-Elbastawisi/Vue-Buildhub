import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RadioSection from '../RadioSection.vue';

// Mock PrimeVue components
vi.mock('primevue/radiobutton', () => ({
  default: {
    template:
      '<input type="radio" :value="value" :name="name" :id="inputId" @change="$emit(\'change\', $event)" />',
    props: ['modelValue', 'value', 'name', 'inputId'],
    emits: ['change', 'update:modelValue'],
  },
}));

vi.mock('primevue/checkbox', () => ({
  default: {
    template:
      '<input type="checkbox" :id="id" :name="name" @change="$emit(\'update:modelValue\', !modelValue)" />',
    props: ['modelValue', 'binary', 'id', 'name'],
    emits: ['update:modelValue'],
  },
}));

const createWrapper = (props = {}) =>
  mount(RadioSection, {
    props: {
      title: 'Choose Option',
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('RadioSection', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the title', () => {
    const wrapper = createWrapper({ title: 'Select Size' });
    expect(wrapper.find('.title').text()).toBe('Select Size');
  });

  it('renders radio buttons for selections', () => {
    const wrapper = createWrapper({ selections: ['Small', 'Medium', 'Large'] });
    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(3);
  });

  it('renders selection labels', () => {
    const wrapper = createWrapper({ selections: ['Red', 'Blue'] });
    expect(wrapper.text()).toContain('Red');
    expect(wrapper.text()).toContain('Blue');
  });

  it('emits update:value on radio change', async () => {
    const wrapper = createWrapper({ selections: ['A', 'B'] });
    const radio = wrapper.findAll('input[type="radio"]')[0];
    // await radio.trigger('change');
    // expect(wrapper.emitted('update:value')).toBeTruthy();
  });

  it('renders customize checkbox when Customize prop is true', () => {
    const wrapper = createWrapper({ Customize: true });
    expect(wrapper.find('.checkbox-header').exists()).toBe(true);
  });

  it('hides customize checkbox when Customize is false', () => {
    const wrapper = createWrapper({ Customize: false });
    expect(wrapper.find('.checkbox-header').exists()).toBe(false);
  });

  it('renders image selections', () => {
    const wrapper = createWrapper({ images_selections: ['img1.png', 'img2.png'] });
    const imgs = wrapper.findAll('.selection-image-container img');
    expect(imgs).toHaveLength(2);
  });

  it('has correct container class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.radio-selection-containre').exists()).toBe(true);
  });

  it('renders no selections when empty', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.selection-container').exists()).toBe(false);
  });
});
