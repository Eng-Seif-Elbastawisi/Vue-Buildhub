import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ComponentDemoPanel from '../ComponentDemoPanel.vue';

// Mock PrimeVue Tabs components
vi.mock('primevue/tabs', () => ({
  default: { template: '<div class="mock-tabs"><slot /></div>', props: ['value', 'pt'] },
}));
vi.mock('primevue/tablist', () => ({
  default: { template: '<div class="mock-tablist"><slot /></div>' },
}));
vi.mock('primevue/tab', () => ({
  default: { template: '<div class="mock-tab"><slot /></div>', props: ['value'] },
}));
vi.mock('primevue/tabpanels', () => ({
  default: { template: '<div class="mock-tabpanels"><slot /></div>' },
}));
vi.mock('primevue/tabpanel', () => ({
  default: { template: '<div class="mock-tabpanel"><slot /></div>', props: ['value'] },
}));

const createWrapper = (props = {}) =>
  mount(ComponentDemoPanel, {
    props: {
      title: 'Demo Component',
      code: '<Button>Click me</Button>',
      ...props,
    },
    slots: {
      default: '<p class="demo-content">Demo slot content</p>',
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('ComponentDemoPanel', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the title', () => {
    const wrapper = createWrapper({ title: 'AppButton' });
    expect(wrapper.find('h2').text()).toBe('AppButton');
  });

  it('displays description when provided', () => {
    const wrapper = createWrapper({ description: 'A versatile button component' });
    expect(wrapper.find('.panel-desc').text()).toBe('A versatile button component');
  });

  it('hides description when not provided', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.panel-desc').exists()).toBe(false);
  });

  it('renders slot content in demo panel', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.demo-content').exists()).toBe(true);
    expect(wrapper.text()).toContain('Demo slot content');
  });

  it('renders code in code block', () => {
    const wrapper = createWrapper({ code: 'const x = 1;' });
    expect(wrapper.find('code').text()).toContain('const x = 1;');
  });

  it('has guide-panel root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.guide-panel').exists()).toBe(true);
  });

  it('renders tabs for Demo and Code', () => {
    const wrapper = createWrapper();
    const tabs = wrapper.findAll('.mock-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
    expect(wrapper.text()).toContain('Demo');
    expect(wrapper.text()).toContain('Code');
  });
});
