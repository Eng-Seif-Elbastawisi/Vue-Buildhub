import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
    fullPath: '/project-preview/edit/18',
    params: { preview_id: '18' },
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
  engineer_id: 15,
  preview_date: '2026-06-25',
  preview_time: '10:30',
  site_link: 'https://maps.google.com/?q=30.0444,31.2357',
  address: 'Nasr City, Cairo, Egypt',
});

const global = {
  stubs: {
    ProjectPreviewForm: {
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
    mockController.fetchOne.mockResolvedValue({});
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

    await wrapper.find('.preview-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditProjectPreviewParams),
      undefined,
      '/project-preview/edit/18',
    );
    expect(mockController.update.mock.calls[0]?.[0].toMap()).toEqual({
      id: 18,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(ProjectPreviewEdit, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
