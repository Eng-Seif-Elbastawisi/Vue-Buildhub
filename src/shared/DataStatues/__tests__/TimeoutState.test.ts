import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TimeoutState from '../TimeoutState.vue';

const createWrapper = (props = {}) => mount(TimeoutState, { props });

describe('TimeoutState', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays default title', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.timeout-title').text()).toBe('Request Timed Out');
  });

  it('displays default message when no message prop', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.timeout-message').text()).toContain('server took too long');
  });

  it('displays custom message', () => {
    const wrapper = createWrapper({ message: 'Custom timeout message' });
    expect(wrapper.find('.timeout-message').text()).toBe('Custom timeout message');
  });

  it('renders a retry button', () => {
    const wrapper = createWrapper();
    const btn = wrapper.find('.timeout-retry-btn');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('Try Again');
  });

  it('calls retryFn when retry button clicked', async () => {
    const retryFn = vi.fn().mockResolvedValue(undefined);
    const wrapper = createWrapper({ retryFn });

    await wrapper.find('.timeout-retry-btn').trigger('click');
    expect(retryFn).toHaveBeenCalledOnce();
  });

  it('emits retry when no retryFn provided', async () => {
    const wrapper = createWrapper();
    await wrapper.find('.timeout-retry-btn').trigger('click');
    expect(wrapper.emitted('retry')).toBeTruthy();
  });

  it('disables button while retrying', async () => {
    let resolveRetry: () => void;
    const retryFn = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRetry = resolve;
        }),
    );

    const wrapper = createWrapper({ retryFn });
    const btn = wrapper.find('.timeout-retry-btn');

    // Start retry
    await btn.trigger('click');
    await wrapper.vm.$nextTick();

    expect(btn.attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('Retrying...');

    // Resolve
    resolveRetry!();
    await wrapper.vm.$nextTick();
  });

  it('renders an SVG icon', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('has the correct root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.timeout-state').exists()).toBe(true);
  });
});
