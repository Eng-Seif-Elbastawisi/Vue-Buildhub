import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CustomCheckbox from '../CustomCheckbox.vue';

const createWrapper = (props = {}) =>
  mount(CustomCheckbox, {
    props: {
      title: 'Accept Terms',
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('CustomCheckbox', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the title', () => {
    const wrapper = createWrapper({ title: 'Enable Notifications' });
    expect(wrapper.text()).toContain('Enable Notifications');
  });

  it('renders a checkbox input', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('has correct root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.checkbox-toggle-wrapper').exists()).toBe(true);
  });

  it('initializes with checked prop', () => {
    const wrapper = createWrapper({ checked: true });
    expect(wrapper.exists()).toBe(true);
  });

  it('emits update:checked when checkbox changes', async () => {
    const wrapper = createWrapper();
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);
    await checkbox.trigger('change');
    expect(wrapper.emitted('update:checked')).toBeTruthy();
  });

  it('renders toggle background', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.toggle-background').exists()).toBe(true);
  });

  it('renders toggle slider', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.toggle-slider').exists()).toBe(true);
  });

  it('renders SVG icons inside slider', () => {
    const wrapper = createWrapper();
    expect(wrapper.findAll('svg').length).toBeGreaterThanOrEqual(2);
  });

  it('uses title as checkbox id', () => {
    const wrapper = createWrapper({ title: 'my-toggle' });
    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.attributes('id')).toBe('my-toggle');
  });
});
