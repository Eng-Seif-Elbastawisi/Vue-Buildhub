import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NoNetworkState from '../NoNetworkState.vue';

const createWrapper = (props = {}) => mount(NoNetworkState, { props });

describe('NoNetworkState', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the title', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.no-network-title').text()).toBe('No Internet Connection');
  });

  it('displays default message', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.no-network-message').text()).toContain('check your internet connection');
  });

  it('displays custom message', () => {
    const wrapper = createWrapper({ message: 'You are offline' });
    expect(wrapper.find('.no-network-message').text()).toBe('You are offline');
  });

  it('renders retry button', () => {
    const wrapper = createWrapper();
    const btn = wrapper.find('.no-network-retry-btn');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('Try Again');
  });

  it('shows connection status indicator', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.connection-status').exists()).toBe(true);
  });

  it('calls retryFn when retry clicked', async () => {
    const retryFn = vi.fn().mockResolvedValue(undefined);
    const wrapper = createWrapper({ retryFn });

    await wrapper.find('.no-network-retry-btn').trigger('click');
    expect(retryFn).toHaveBeenCalledOnce();
  });

  it('emits retry when no retryFn', async () => {
    const wrapper = createWrapper();
    await wrapper.find('.no-network-retry-btn').trigger('click');
    expect(wrapper.emitted('retry')).toBeTruthy();
  });

  it('has the correct root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.no-network-state').exists()).toBe(true);
  });

  it('renders SVG icon', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('svg').exists()).toBe(true);
  });
});
