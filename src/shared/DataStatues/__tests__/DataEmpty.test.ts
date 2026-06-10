import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DataEmpty from '../DataEmpty.vue';

// Asset mocks are in setup.ts

const routerLinkStub = {
  template: '<a :href="to" :class="$attrs.class"><slot /></a>',
  props: ['to'],
};

const createWrapper = (props = {}) =>
  mount(DataEmpty, {
    props: {
      title: 'No Data',
      description: 'There is no data to display',
      link: '/add',
      addText: 'Add Item',
      ...props,
    },
    global: {
      stubs: { 'router-link': routerLinkStub },
    },
  });
describe('DataEmpty', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the title', () => {
    const wrapper = createWrapper({ title: 'Empty List' });
    expect(wrapper.find('h2').text()).toBe('Empty List');
  });

  it('displays the description', () => {
    const wrapper = createWrapper({ description: 'No records found' });
    expect(wrapper.find('p').text()).toBe('No records found');
  });

  it('renders router-link with correct href', () => {
    const wrapper = createWrapper({ link: '/create' });
    expect(wrapper.find('a').attributes('href')).toBe('/create');
  });

  it('shows add text in the button', () => {
    const wrapper = createWrapper({ addText: 'Create New' });
    expect(wrapper.find('a').text()).toContain('Create New');
  });

  it('renders the image', () => {
    const wrapper = createWrapper();
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('data empty');
  });

  it('has the data-empty root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.data-empty').exists()).toBe(true);
  });
});
