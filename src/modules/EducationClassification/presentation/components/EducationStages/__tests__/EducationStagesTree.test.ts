import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EducationStagesTree from '../EducationStagesTree.vue';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import EducationStageModel from '@/modules/EducationClassification/core/models/EducationStage/education.stages.model';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { id: '1' } }),
  };
});

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: { value: 'en' } }),
}));

const mockStageController = {
  fetchList: vi.fn(),
  create: vi.fn(),
};

const mockConfigController = {
  fetchList: vi.fn(),
};

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/EducationStages/education.stages.controller',
  () => ({ default: { getInstance: () => mockStageController } }),
);

vi.mock(
  '@/modules/EducationClassification/presentation/controllers/educationConfiguration/education.configuration.controller',
  () => ({ default: { getInstance: () => mockConfigController } }),
);

vi.mock('../StageTreeNode.vue', () => ({
  default: {
    name: 'StageTreeNode',
    template: '<div class="stage-tree-node"></div>',
    props: ['node', 'selectedStageId'],
  },
}));

vi.mock(
  '@/modules/EducationClassification/subComponent/EducationTree/AddEducationTypeDialog.vue',
  () => ({
    default: {
      name: 'AddEducationTypeDialog',
      template: '<div class="add-type-dialog"></div>',
    },
  }),
);

vi.mock('@/modules/EducationClassification/subComponent/EducationTree/AddBranchDialog.vue', () => ({
  default: {
    name: 'AddBranchDialog',
    template: '<div class="add-branch-dialog"></div>',
  },
}));

vi.mock('../EducationSubjects/SubjectsPanel.vue', () => ({
  default: {
    name: 'SubjectsPanel',
    template: '<div class="subjects-panel-stub"></div>',
    props: ['stageId', 'stageName'],
  },
}));

const emptyConfigResult = new DataSuccess({ data: null });
const emptyStageResult = new DataSuccess<EducationStageModel[]>({ data: [] });

describe('EducationStagesTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigController.fetchList.mockResolvedValue(emptyConfigResult);
    mockStageController.fetchList.mockResolvedValue(emptyStageResult);
    mockStageController.create.mockResolvedValue(
      new DataSuccess({ data: EducationStageModel.example }),
    );
  });

  const mountComponent = () =>
    mount(EducationStagesTree, {
      global: {
        stubs: { 'router-link': true },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

  it('renders the two-panel tree layout', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.education-tree').exists()).toBe(true);
    expect(wrapper.find('.left-panel').exists()).toBe(true);
    expect(wrapper.find('.right-panel').exists()).toBe(true);
  });

  it('shows empty state when no root nodes are loaded', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.empty-title').text()).toBe('No Education Tree Yet');
  });

  it('calls fetchList on mounted', async () => {
    mountComponent();
    await flushPromises();
    expect(mockStageController.fetchList).toHaveBeenCalled();
  });

  it('calls configController.fetchList on mounted', async () => {
    mountComponent();
    await flushPromises();
    expect(mockConfigController.fetchList).toHaveBeenCalled();
  });

  it('opens AddEducationTypeDialog when Add button in empty state is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.find('.add-type-dialog').exists()).toBe(true);
  });

  it('renders StageTreeNode items when stages are returned', async () => {
    mockStageController.fetchList.mockResolvedValue(
      new DataSuccess({ data: [EducationStageModel.example] }),
    );
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.find('.stage-tree-node').exists()).toBe(true);
    expect(wrapper.find('.empty-state').exists()).toBe(false);
  });

  it('shows right-placeholder when no node is selected', async () => {
    mockStageController.fetchList.mockResolvedValue(
      new DataSuccess({ data: [EducationStageModel.example] }),
    );
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.find('.right-placeholder').exists()).toBe(true);
  });

  it('shows Add New button in toolbar when tree has nodes', async () => {
    mockStageController.fetchList.mockResolvedValue(
      new DataSuccess({ data: [EducationStageModel.example] }),
    );
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.find('.btn.btn-primary').exists()).toBe(true);
  });

  it('opens AddEducationTypeDialog from the tree toolbar Add button', async () => {
    mockStageController.fetchList.mockResolvedValue(
      new DataSuccess({ data: [EducationStageModel.example] }),
    );
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.find('.btn.btn-primary').trigger('click');
    expect(wrapper.find('.add-type-dialog').exists()).toBe(true);
  });

  it('closes AddEducationTypeDialog on update:visible false emit', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.find('.add-type-dialog').exists()).toBe(true);

    const dialog = wrapper.getComponent({ name: 'AddEducationTypeDialog' });
    await dialog.vm.$emit('update:visible', false);
    expect(wrapper.find('.add-type-dialog').exists()).toBe(false);
  });
});
