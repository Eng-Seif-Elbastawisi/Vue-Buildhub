import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DataFailed from '../DataFailed.vue';

// Asset mocks are in setup.ts

const routerLinkStub = {
  template: '<a :href="to" :class="$attrs.class"><slot /></a>',
  props: ['to'],
};

const createWrapper = (props = {}) =>
  mount(DataFailed, {
    props,
    global: {
      stubs: { 'router-link': routerLinkStub },
    },
  });

describe('DataFailed', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the title when provided', () => {
    const wrapper = createWrapper({ title: 'Server Error' });
    expect(wrapper.find('h2').text()).toBe('Server Error');
  });

  it('displays the description when provided', () => {
    const wrapper = createWrapper({ description: 'Something went wrong' });
    expect(wrapper.find('p').text()).toBe('Something went wrong');
  });

  it('defaults link to "/" when not provided', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('a').attributes('href')).toBe('/');
  });

  it('defaults addText to "Home" when not provided', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('a').text()).toContain('Home');
  });

  it('uses custom link', () => {
    const wrapper = createWrapper({ link: '/dashboard' });
    expect(wrapper.find('a').attributes('href')).toBe('/dashboard');
  });

  it('uses custom addText', () => {
    const wrapper = createWrapper({ addText: 'Go Back' });
    expect(wrapper.find('a').text()).toContain('Go Back');
  });

  it('renders the failed image', () => {
    const wrapper = createWrapper();
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('imageFailed');
  });

  it('has the data-empty root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.data-empty').exists()).toBe(true);
  });
});
