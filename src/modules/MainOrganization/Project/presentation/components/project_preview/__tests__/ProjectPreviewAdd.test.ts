import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationType } from '../../../../core/constants/notificationType.enum';
import { Status } from '../../../../core/constants/status.enum';
import AddProjectPreviewParams from '../../../../core/params/add.project.preview.params';
import ProjectPreviewAdd from '../ProjectPreviewAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../../controllers/project.preview.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/project-preview/add?project_id=7',
    params: {},
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

const params = new AddProjectPreviewParams({
  engineer_id: 15,
  preview_date: '2026-06-25',
  preview_time: '10:30',
  site_link: 'https://maps.google.com/?q=30.0444,31.2357',
  address: 'Nasr City, Cairo, Egypt',
  status: Status.READY_FOR_PRICING,
  pricing_responsible_id: 18,
  notification_type: NotificationType.URGENT,
  notification_message: 'Preview is ready for pricing',
});

const global = {
  stubs: {
    ProjectSteps: {
      template: '<div class="project-steps-stub" />',
    },
    ProjectPreviewForm: {
      emits: ['updateData'],
      template: '<div class="preview-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('ProjectPreviewAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates a project preview with emitted form params and route project id', async () => {
    const wrapper = mount(ProjectPreviewAdd, { global });

    await wrapper.find('.preview-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(
      expect.any(AddProjectPreviewParams),
      undefined,
      '/project-preview/add?project_id=7',
    );
    expect(mockController.create.mock.calls[0]?.[0].toMap()).toMatchObject({
      project_id: 7,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 18,
      notification_type: NotificationType.URGENT,
      notification_message: 'Preview is ready for pricing',
    });
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(ProjectPreviewAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
