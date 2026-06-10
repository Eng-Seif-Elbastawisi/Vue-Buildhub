import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PagesHeader from '../PagesHeader.vue';

// Mock assets
vi.mock('@/assets/images/EmployeeBg.png', () => ({ default: 'mocked-employee-bg.png' }));
vi.mock('@/assets/images/Yellowback.png', () => ({ default: 'mocked-yellow-back.png' }));

const createWrapper = (props = {}) =>
  mount(PagesHeader, {
    props: {
      title: 'Test Title',
      ...props,
    },
  });

describe('PagesHeader', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the title', () => {
    const wrapper = createWrapper({ title: 'Employee Management' });
    expect(wrapper.find('.title').text()).toBe('Employee Management');
  });

  it('displays subtitle when provided', () => {
    const wrapper = createWrapper({ subtitle: 'Manage your team' });
    expect(wrapper.find('.subtitle').text()).toBe('Manage your team');
  });

  it('renders header image when img prop is provided', () => {
    const wrapper = createWrapper({ img: 'test-image.png' });
    const img = wrapper.find('.employee-header-text img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('test-image.png');
  });

  it('hides header image when no img prop', () => {
    const wrapper = createWrapper();
    const contentImgs = wrapper.findAll('.employee-header-text img');
    expect(contentImgs).toHaveLength(0);
  });

  it('has employee-header root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.employee-header').exists()).toBe(true);
  });

  it('renders background images', () => {
    const wrapper = createWrapper();
    const bgImgs = wrapper.findAll('.left-header-background img');
    expect(bgImgs.length).toBeGreaterThanOrEqual(2);
  });
});
