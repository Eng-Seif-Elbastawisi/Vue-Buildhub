import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EducationClassificationConfigurationForm from '../EducationClassificationConfigurationForm.vue';
import EducationConfigurationModel from '../../../core/models/EducationConfiguration/education.configuration.model';
import EducationSubjectConfigurationModel from '../../../core/models/EducationConfiguration/education.subject.configuration.model';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

// ── Shared controller mock objects ────────────────────────────────────────────
const mockConfigFetchList = vi.fn();
const mockSubjectFetchList = vi.fn();
const mockConfigCreate = vi.fn();
const mockSubjectCreate = vi.fn();

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/educationConfiguration/education.configuration.controller',
  () => ({
    default: {
      getInstance: () => ({
        fetchList: mockConfigFetchList,
        create: mockConfigCreate,
        listState: { value: {} },
      }),
    },
  }),
);

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/educationSubject/education.subject.controller',
  () => ({
    default: {
      getInstance: () => ({
        fetchList: mockSubjectFetchList,
        create: mockSubjectCreate,
        listState: { value: {} },
      }),
    },
  }),
);

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {}, params: {} }),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    getFormData: vi.fn().mockReturnValue(null),
    setFormData: vi.fn(),
    showReturnWarning: vi.fn(),
    clearFormData: vi.fn(),
  }),
}));

vi.mock('@/shared/icons/FolderCrudIcon.vue', () => ({
  default: { name: 'FolderCrudIcon', template: '<span />' },
}));

const mountForm = (props: Record<string, unknown> = {}) =>
  mount(EducationClassificationConfigurationForm, {
    props,
    global: {
      mocks: { $t: (k: string) => k },
      // Stub child components so their buttons don't pollute the DOM
      stubs: {
        SingularPluralForm: { template: '<div class="singular-plural-stub" />' },
        MultiLangInput: { template: '<div class="multi-lang-stub" />' },
      },
    },
  });

describe('EducationClassificationConfigurationForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockConfigFetchList.mockResolvedValue(
      new DataSuccess({ data: [EducationConfigurationModel.example] }),
    );
    mockSubjectFetchList.mockResolvedValue(
      new DataSuccess({ data: [EducationSubjectConfigurationModel.example] }),
    );
  });

  describe('rendering', () => {
    it('renders without crashing', async () => {
      const wrapper = mountForm();
      await flushPromises();
      expect(wrapper.exists()).toBe(true);
    });

    it('renders two form cards', async () => {
      const wrapper = mountForm();
      await flushPromises();
      expect(wrapper.findAll('.education-classification-form-card')).toHaveLength(2);
    });

    it('renders configuration and subject number inputs', async () => {
      const wrapper = mountForm();
      await flushPromises();
      expect(wrapper.findAll('input[type="number"]')).toHaveLength(2);
    });
  });

  describe('onMounted data fetch', () => {
    it('calls fetchList on both controllers on mount', async () => {
      mountForm();
      await flushPromises();

      expect(mockConfigFetchList).toHaveBeenCalledTimes(1);
      expect(mockSubjectFetchList).toHaveBeenCalledTimes(1);
    });

    it('fills configuration number input from API DataSuccess response', async () => {
      const wrapper = mountForm();
      await flushPromises();

      const inputs = wrapper.findAll('input[type="number"]');
      expect((inputs[0].element as HTMLInputElement).valueAsNumber).toBe(
        EducationConfigurationModel.example.numberOfBranches,
      );
    });

    it('fills subject number input from API DataSuccess response', async () => {
      const wrapper = mountForm();
      await flushPromises();

      const inputs = wrapper.findAll('input[type="number"]');
      expect((inputs[1].element as HTMLInputElement).valueAsNumber).toBe(
        EducationSubjectConfigurationModel.example.numberOfBranches,
      );
    });

    it('falls back to example data when fetchList does not return DataSuccess', async () => {
      mockConfigFetchList.mockResolvedValue({ data: null });
      mockSubjectFetchList.mockResolvedValue({ data: null });

      const wrapper = mountForm();
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
      const inputs = wrapper.findAll('input[type="number"]');
      expect((inputs[0].element as HTMLInputElement).valueAsNumber).toBe(
        EducationConfigurationModel.example.numberOfBranches,
      );
    });
  });

  describe('apply buttons', () => {
    it('renders two apply buttons', async () => {
      const wrapper = mountForm();
      await flushPromises();
      // With SingularPluralForm stubbed, only 2 save-btn buttons exist
      expect(wrapper.findAll('button.save-btn')).toHaveLength(2);
    });

    it('clicking the first Apply button emits save-education-classification', async () => {
      const wrapper = mountForm();
      await flushPromises();

      const applyBtns = wrapper.findAll('button.save-btn');
      await applyBtns[0].trigger('click');

      expect(wrapper.emitted('save-education-classification')).toBeTruthy();
    });

    it('clicking the second Apply button emits save-education-subjects', async () => {
      const wrapper = mountForm();
      await flushPromises();

      const applyBtns = wrapper.findAll('button.save-btn');
      await applyBtns[1].trigger('click');

      expect(wrapper.emitted('save-education-subjects')).toBeTruthy();
    });
  });
});
