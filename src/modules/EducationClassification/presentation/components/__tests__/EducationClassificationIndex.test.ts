import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EducationClassificationIndex from '../EducationClassificationIndex.vue';
import EducationClassificationController from '../../controllers/educationClassification.controller';
import { ref } from 'vue';

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    query: {},
    params: { country_code: 'eg' },
  }),
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Controller shared refs
const sharedListState = ref({ data: [], loading: false, error: null });
const sharedPagination = ref({ total: 0, per_page: 10, current_page: 1 });
const mockFetchList = vi.fn();
const mockDelete = vi.fn();
const mockToggleStatus = vi.fn();

vi.mock('../../controllers/educationClassification.controller', () => ({
  default: {
    getInstance: () => ({
      listState: sharedListState,
      pagination: sharedPagination,
      fetchList: mockFetchList,
      delete: mockDelete,
      toggleStatus: mockToggleStatus,
    }),
  },
}));

describe('EducationClassificationIndex', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Reset shared state
    sharedListState.value = { data: [], loading: false, error: null };
    sharedPagination.value = { total: 0, per_page: 10, current_page: 1 };
  });

  it('renders without crashing', async () => {
    const wrapper = mount(EducationClassificationIndex, {
      global: {
        stubs: {
          'router-link': true,
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[]" /><slot name="empty" /></div>',
          },
          AppTable: true,
          Pagination: true,
          EducationClassificationAdd: true,
          ToggleSwitch: true,
          DeleteDialog: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('calls fetchList on mount', async () => {
    mount(EducationClassificationIndex, {
      global: {
        stubs: {
          'router-link': true,
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          EducationClassificationAdd: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    await flushPromises();
    expect(mockFetchList).toHaveBeenCalled();
  });

  it('renders empty state when no data', async () => {
    const wrapper = mount(EducationClassificationIndex, {
      global: {
        stubs: {
          'router-link': true,
          DataStatusBuilder: {
            template: '<div><slot name="empty" /></div>',
          },
          AppTable: true,
          Pagination: true,
          EducationClassificationAdd: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.text()).toContain('no_education_classifications_yet');
  });

  it('renders table when data exists', async () => {
    const controller = EducationClassificationController.getInstance();
    controller.listState.value = {
      data: [{ id: 1, title: 'Test', created_at: '2023-01-01', status: true }],
      loading: false,
      error: null,
    };

    const wrapper = mount(EducationClassificationIndex, {
      global: {
        stubs: {
          'router-link': true,
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[ { id: 1, title: \'Test\' } ]" /></div>',
          },
          AppTable: {
            template:
              '<div class="app-table-stub"><slot name="cell-status" :item="{id:1, status:true}" /></div>',
          },
          Pagination: true,
          EducationClassificationAdd: true,
          ToggleSwitch: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    expect(wrapper.find('.table-frame').exists()).toBe(true);
  });
});
