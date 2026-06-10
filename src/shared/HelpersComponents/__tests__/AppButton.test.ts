import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppButton from '../AppButton.vue';

const routerLinkStub = {
  template: '<a :href="to" :class="$attrs.class"><slot /></a>',
  props: ['to'],
};

const createWrapper = (props = {}, slots = {}) =>
  mount(AppButton, {
    props,
    slots,
    global: {
      stubs: { 'router-link': routerLinkStub },
    },
  });

describe('AppButton', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders as a button by default', () => {
    const wrapper = createWrapper();
    expect(wrapper.element.tagName).toBe('BUTTON');
  });

  it('renders as a router-link when to prop is provided', () => {
    const wrapper = createWrapper({ to: '/dashboard' });
    expect(wrapper.element.tagName).toBe('A');
  });

  it('renders as an anchor when href is provided', () => {
    const wrapper = createWrapper({ href: 'https://example.com' });
    expect(wrapper.element.tagName).toBe('A');
  });

  it('applies primary theme class by default', () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).toContain('btn-primary');
  });

  it('applies secondary theme class', () => {
    const wrapper = createWrapper({ theme: 'secondary' });
    expect(wrapper.classes()).toContain('btn-secondary');
  });

  it('applies danger theme class', () => {
    const wrapper = createWrapper({ theme: 'danger' });
    expect(wrapper.classes()).toContain('btn-danger');
  });

  it('applies size class', () => {
    const wrapper = createWrapper({ size: 'lg' });
    expect(wrapper.classes()).toContain('btn--lg');
  });

  it('defaults to md size', () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).toContain('btn--md');
  });

  it('applies block class when block is true', () => {
    const wrapper = createWrapper({ block: true });
    expect(wrapper.classes()).toContain('btn--block');
  });

  it('applies outline class', () => {
    const wrapper = createWrapper({ outline: true });
    expect(wrapper.classes()).toContain('btn--outline');
  });

  it('applies ghost class', () => {
    const wrapper = createWrapper({ ghost: true });
    expect(wrapper.classes()).toContain('btn--ghost');
  });

  it('is disabled when disabled prop is true', () => {
    const wrapper = createWrapper({ disabled: true });
    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  it('is disabled when loading', () => {
    const wrapper = createWrapper({ loading: true });
    expect(wrapper.classes()).toContain('btn--loading');
  });

  it('shows spinner when loading', () => {
    const wrapper = createWrapper({ loading: true });
    expect(wrapper.find('.btn__spinner').exists()).toBe(true);
  });

  it('hides spinner when not loading', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.btn__spinner').exists()).toBe(false);
  });

  it('emits click event', async () => {
    const wrapper = createWrapper();
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click when disabled', async () => {
    const wrapper = createWrapper({ disabled: true });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('renders slot text content', () => {
    const wrapper = createWrapper({}, { default: 'Submit' });
    expect(wrapper.text()).toContain('Submit');
  });

  it('renders icon on left', () => {
    const wrapper = createWrapper(
      { icon: 'left' },
      {
        icon: '<span class="test-icon" />',
      },
    );
    expect(wrapper.find('.btn__icon--left').exists()).toBe(true);
  });

  it('renders icon on right', () => {
    const wrapper = createWrapper(
      { icon: 'right' },
      {
        icon: '<span class="test-icon" />',
      },
    );
    expect(wrapper.find('.btn__icon--right').exists()).toBe(true);
  });

  it('applies icon-only class', () => {
    const wrapper = createWrapper({ iconOnly: true });
    expect(wrapper.classes()).toContain('btn--icon-only');
  });

  it('sets button type', () => {
    const wrapper = createWrapper({ type: 'submit' });
    expect(wrapper.attributes('type')).toBe('submit');
  });

  it('defaults to type "button"', () => {
    const wrapper = createWrapper();
    expect(wrapper.attributes('type')).toBe('button');
  });

  it('sets aria-disabled when disabled', () => {
    const wrapper = createWrapper({ disabled: true });
    expect(wrapper.attributes('aria-disabled')).toBe('true');
  });

  it('sets aria-busy when loading', () => {
    const wrapper = createWrapper({ loading: true });
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });
});
