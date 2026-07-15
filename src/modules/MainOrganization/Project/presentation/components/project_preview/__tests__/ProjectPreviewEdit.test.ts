import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { NotificationType } from '../../../../core/constants/notificationType.enum';
import { Status } from '../../../../core/constants/status.enum';
import ProjectPreviewShowModel from '../../../../core/models/project.preview.show.model';
import AddProjectPreviewParams from '../../../../core/params/add.project.preview.params';
import EditProjectPreviewParams from '../../../../core/params/edit.project.preview.params';
import ShowProjectPreviewParams from '../../../../core/params/show.project.preview.params';
import ProjectPreviewEdit from '../ProjectPreviewEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as unknown },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../../controllers/project.preview.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/organization/project_preview/edit/18?project_id=7',
    params: { project_preview_id: '18' },
    query: { project_id: '7' },
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

const addParams = new AddProjectPreviewParams({
  project_id: 7,
  engineer_id: 15,
  preview_date: '2026-06-25',
  preview_time: '10:30:00',
  site_link: 'https://maps.google.com/?q=30.0444,31.2357',
  address: 'Nasr City, Cairo, Egypt',
  status: Status.READY_FOR_PRICING,
  pricing_responsible_id: 18,
  notification_type: NotificationType.URGENT,
  notification_message: 'Preview is ready for pricing',
});

const projectPreview = new ProjectPreviewShowModel({
  id: 18,
  project_id: 7,
  engineer: { id: 15, title: 'Site engineer' },
  pricing_responsible: { id: 18, title: 'Pricing lead' },
  preview_date: '2026-06-25',
  preview_time: '10:30:00',
  site_link: 'https://maps.google.com/?q=30.0444,31.2357',
  address: 'Nasr City, Cairo, Egypt',
  status: Status.READY_FOR_PRICING,
  notification_type: NotificationType.URGENT,
  notification_message: 'Preview is ready for pricing',
});

const global = {
  stubs: {
    ProjectPreviewForm: {
      props: ['projectPreview', 'projectId', 'loading', 'validationErrors'],
      emits: ['updateData'],
      template: '<div class="preview-form-stub" @click="$emit(\'updateData\', addParams)"></div>',
      setup: () => ({ addParams }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectPreviewEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue(new DataSuccess({ data: projectPreview }));
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = {};
    mockController.errorMessage.value = null;
  });

  it('fetches the project preview on mount using route preview id', async () => {
    mount(ProjectPreviewEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowProjectPreviewParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].previewId).toBe(18);
  });

  it('updates a project preview with converted edit params', async () => {
    const wrapper = mount(ProjectPreviewEdit, { global });
    await flushPromises();

    await wrapper.find('.preview-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditProjectPreviewParams),
      undefined,
      '/organization/project_preview/edit/18?project_id=7',
    );
    expect(mockController.update.mock.calls[0]?.[0].toMap()).toEqual({
      project_preview_id: 18,
      project_id: 7,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 18,
      notification_type: NotificationType.URGENT,
      notification_message: 'Preview is ready for pricing',
    });
  });

  it('renders loading state before the current preview is available', () => {
    mockController.fetchOne.mockReturnValue(new Promise(() => undefined));

    const wrapper = mount(ProjectPreviewEdit, { global });

    expect(wrapper.find('[aria-busy="true"]').text()).toBe('loading');
    expect(wrapper.find('.preview-form-stub').exists()).toBe(false);
  });

  it('prevents repeated update requests while saving', async () => {
    let resolveUpdate: ((value: object) => void) | undefined;
    mockController.update.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    const wrapper = mount(ProjectPreviewEdit, { global });
    await flushPromises();
    await wrapper.find('.preview-form-stub').trigger('click');

    const saveButton = wrapper.find('button.btn-primary');
    await saveButton.trigger('click');
    await saveButton.trigger('click');

    expect(mockController.update).toHaveBeenCalledTimes(1);

    resolveUpdate?.({});
    await flushPromises();
  });

  it('renders controller errors', async () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(ProjectPreviewEdit, { global });
    await flushPromises();

    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
