import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CardLoader from '../CardLoader.vue';
import FormLoader from '../FormLoader.vue';
import MainLoader from '../MainLoader.vue';
import TableLoader from '../TableLoader.vue';

// Mock PrimeVue Skeleton
vi.mock('primevue/skeleton', () => ({
  default: {
    template:
      '<div class="mock-skeleton" :style="{ width: $props.width, height: $props.height }" />',
    props: ['width', 'height', 'shape', 'size'],
  },
}));

// Asset mocks are in setup.ts

describe('CardLoader', () => {
  it('renders without crashing', () => {
    const wrapper = mount(CardLoader, { props: { rows: 3, cols: 2 } });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correct number of card rows', () => {
    const wrapper = mount(CardLoader, { props: { rows: 4, cols: 2 } });
    const items = wrapper.findAll('.item');
    expect(items).toHaveLength(4);
  });

  it('contains skeleton components', () => {
    const wrapper = mount(CardLoader, { props: { rows: 1, cols: 1 } });
    expect(wrapper.findAll('.mock-skeleton').length).toBeGreaterThan(0);
  });
});

describe('FormLoader', () => {
  it('renders without crashing', () => {
    const wrapper = mount(FormLoader, { props: { inputsCount: 4 } });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correct number of input skeletons', () => {
    const wrapper = mount(FormLoader, { props: { inputsCount: 6 } });
    const inputWrappers = wrapper.findAll('.input-wrapper');
    expect(inputWrappers).toHaveLength(6);
  });

  it('renders a submit button', () => {
    const wrapper = mount(FormLoader, { props: { inputsCount: 1 } });
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Submit');
  });

  it('renders as a form element', () => {
    const wrapper = mount(FormLoader, { props: { inputsCount: 2 } });
    expect(wrapper.find('form').exists()).toBe(true);
  });
});

describe('MainLoader', () => {
  it('renders without crashing', () => {
    const wrapper = mount(MainLoader);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the main-loader div', () => {
    const wrapper = mount(MainLoader);
    expect(wrapper.find('.main-loader').exists()).toBe(true);
  });

  it('renders an img element', () => {
    const wrapper = mount(MainLoader);
    expect(wrapper.find('img').exists()).toBe(true);
  });
});

describe('TableLoader', () => {
  it('renders without crashing', () => {
    const wrapper = mount(TableLoader, { props: { rows: 3, cols: 4 } });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correct number of header columns', () => {
    const wrapper = mount(TableLoader, { props: { rows: 2, cols: 5 } });
    const ths = wrapper.findAll('th');
    expect(ths).toHaveLength(5);
  });

  it('renders correct number of body rows', () => {
    const wrapper = mount(TableLoader, { props: { rows: 3, cols: 2 } });
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(3);
  });

  it('renders correct number of cells per row', () => {
    const wrapper = mount(TableLoader, { props: { rows: 1, cols: 4 } });
    const cells = wrapper.findAll('tbody td');
    expect(cells).toHaveLength(4);
  });

  it('wraps content in table-responsive div', () => {
    const wrapper = mount(TableLoader, { props: { rows: 1, cols: 1 } });
    expect(wrapper.find('.table-responsive').exists()).toBe(true);
  });
});
