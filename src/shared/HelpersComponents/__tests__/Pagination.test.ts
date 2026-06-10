import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Pagination from '../Pagination.vue';

// Mock PrimeVue Popover
vi.mock('primevue/popover', () => ({
  default: {
    template: '<div class="mock-popover"><slot /></div>',
    methods: { toggle: vi.fn() },
  },
}));

// Mock icon
vi.mock('../../icons/IconArrowDown.vue', () => ({
  default: { template: '<span class="mock-arrow-down" />' },
}));

const mockPagination = {
  current: 2,
  last: 5,
  next: 3,
  total: 50,
  count: 10,
};

const createWrapper = (props = {}) =>
  mount(Pagination, {
    props: {
      pagination: mockPagination,
      ...props,
    },
  });

describe('Pagination', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays results info', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('show 2 to 3 of');
    expect(wrapper.text()).toContain('50');
  });

  it('renders Prev button', () => {
    const wrapper = createWrapper();
    const prevBtn = wrapper.findAll('.pagination-btn')[0];
    expect(prevBtn.text()).toBe('Prev');
  });

  it('renders Next button', () => {
    const wrapper = createWrapper();
    const buttons = wrapper.findAll('.pagination-btn');
    const nextBtn = buttons[1];
    expect(nextBtn.text()).toBe('Next');
  });

  it('emits changePage on Prev click', async () => {
    const wrapper = createWrapper();
    const prevBtn = wrapper.findAll('.pagination-btn')[0];
    await prevBtn.trigger('click');
    expect(wrapper.emitted('changePage')).toBeTruthy();
    expect(wrapper.emitted('changePage')![0][0]).toBe(1);
  });

  it('emits changePage on Next click', async () => {
    const wrapper = createWrapper();
    const buttons = wrapper.findAll('.pagination-btn');
    const nextBtn = buttons[1];
    await nextBtn.trigger('click');
    expect(wrapper.emitted('changePage')).toBeTruthy();
    expect(wrapper.emitted('changePage')![0][0]).toBe(3);
  });

  it('emits changePage on page number click', async () => {
    const wrapper = createWrapper();
    const pageItems = wrapper.findAll('.pagination-item');
    if (pageItems.length > 0) {
      await pageItems[0].trigger('click');
      expect(wrapper.emitted('changePage')).toBeTruthy();
    }
  });

  it('highlights active page', () => {
    const wrapper = createWrapper();
    const activeItem = wrapper.find('.pagination-item.active');
    expect(activeItem.exists()).toBe(true);
    expect(activeItem.text()).toBe('2');
  });

  it('hides pagination when only 1 page', () => {
    const wrapper = createWrapper({
      pagination: { current: 1, last: 1, next: 1, total: 5, count: 5 },
    });
    expect(wrapper.find('.pagination-wrapper').exists()).toBe(false);
  });

  it('renders per page count options', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('Show');
    expect(wrapper.text()).toContain('per page');
  });

  it('handles null pagination', () => {
    const wrapper = createWrapper({ pagination: null });
    expect(wrapper.find('.pagination-wrapper').exists()).toBe(false);
  });
});
