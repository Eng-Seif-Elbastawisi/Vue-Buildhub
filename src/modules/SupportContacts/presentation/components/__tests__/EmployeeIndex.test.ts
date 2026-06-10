import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EmployeeIndex from '../SupportIndex.vue';

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { country_code: 'eg' },
    query: { page: '1', word: '' },
    fullPath: '/eg/employees',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    getRoutes: vi.fn(() => []),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

const globalConfig = {
  plugins: [createPinia()],
  stubs: {
    'router-link': true,
    DataStatusBuilder: true,
    AppTable: true,
    Pagination: true,
    DeleteDialog: true,
  },
  mocks: {
    $t: (msg: string) => msg,
  },
};

describe('EmployeeIndex.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the about-page container', () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    expect(wrapper.find('.about-page').exists()).toBe(true);
  });

  it('renders the header container', () => {
    const wrapper = mount(EmployeeIndex, { global: globalConfig });
    expect(wrapper.find('.header-container').exists()).toBe(true);
  });
});
