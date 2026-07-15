import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { FloorNumber } from '../../../core/constants/floor.number.enum';
import ProjectFloorShowModel from '../../../core/models/project.floor.show.model';
import AddProjectFloorParams from '../../../core/params/add.project.floor.params';
import EditProjectFloorParams from '../../../core/params/edit.project.floor.params';
import ShowProjectFloorParams from '../../../core/params/show.project.floor.params';
import ProjectFloorEdit from '../ProjectFloorEdit.vue';

const mocks = vi.hoisted(() => ({
  route: {
    fullPath: '/organization/project_floor/edit/33?project_id=24&project_preview_id=15',
    params: { project_floor_id: '33' },
    query: {
      project_id: '24' as string | undefined,
      project_preview_id: '15' as string | undefined,
    },
  },
  fetchOne: vi.fn(),
  update: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('../../controllers/project.floor.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne: mocks.fetchOne,
      update: mocks.update,
      errorMessage: mocks.errorMessage,
    }),
  },
}));

const addParams = new AddProjectFloorParams({
  project_id: 24,
  project_preview_id: 15,
  floor_number: FloorNumber.GROUND_FLOOR,
  site_description: 'Updated site description',
  technical_general_notes: 'Current technical notes',
  inspection_recommendations: 'Current recommendations',
  spaces: [
    {
      space_id: 8,
      length: 12.5,
      width: 8.25,
      height: 3.2,
      notes: 'Keep existing finishes',
      attachments: [{ file: 'existing.pdf', alt: 'Existing plan' }],
    },
  ],
});

const projectFloor = new ProjectFloorShowModel({
  id: 33,
  project_id: 24,
  project_preview_id: 15,
  floor_number: FloorNumber.GROUND_FLOOR,
  site_description: 'Current site description',
  technical_general_notes: 'Current technical notes',
  inspection_recommendations: 'Current recommendations',
  spaces: [
    {
      id: 41,
      space_id: 8,
      space: { id: 8, title: 'Reception' },
      length: '12.50',
      width: '8.25',
      height: '3.20',
      notes: 'Keep existing finishes',
      attachments: [],
    },
  ],
});

const global = {
  stubs: {
    ProjectFloorForm: {
      name: 'ProjectFloorForm',
      props: ['projectFloor', 'projectId', 'projectPreviewId', 'loading', 'validationErrors'],
      emits: ['updateData'],
      template: `
        <button
          class="floor-form-stub"
          type="button"
          :data-project-id="projectId"
          :data-project-preview-id="projectPreviewId"
          @click="$emit('updateData', addParams)"
        >
          {{ validationErrors['spaces.0.length'] || '' }}
        </button>
      `,
      setup: () => ({ addParams }),
    },
  },
};

describe('ProjectFloorEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.route.params.project_floor_id = '33';
    mocks.route.query.project_id = '24';
    mocks.route.query.project_preview_id = '15';
    mocks.fetchOne.mockResolvedValue(new DataSuccess({ data: projectFloor }));
    mocks.update.mockResolvedValue(new DataSuccess({ data: projectFloor }));
    mocks.errorMessage.value = null;
  });

  it('fetches the exact floor and route context on mount', async () => {
    mount(ProjectFloorEdit, { global });
    await flushPromises();

    expect(mocks.fetchOne).toHaveBeenCalledWith(expect.any(ShowProjectFloorParams));
    expect(mocks.fetchOne.mock.calls[0]?.[0].toMap()).toEqual({
      project_floor_id: 33,
      project_id: 24,
      project_preview_id: 15,
      allLocales: true,
    });
  });

  it('maps the shared add form payload into a complete update request', async () => {
    const wrapper = mount(ProjectFloorEdit, { global });
    await flushPromises();

    await wrapper.get('.floor-form-stub').trigger('click');
    await wrapper.get('button.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.update).toHaveBeenCalledWith(
      expect.any(EditProjectFloorParams),
      undefined,
      mocks.route.fullPath,
    );
    expect(mocks.update.mock.calls[0]?.[0].toMap()).toEqual({
      id: 33,
      ...addParams.toMap(),
    });
  });

  it('works from a direct refreshed edit URL without optional query ids', async () => {
    mocks.route.query.project_id = undefined;
    mocks.route.query.project_preview_id = undefined;

    const wrapper = mount(ProjectFloorEdit, { global });
    await flushPromises();

    expect(mocks.fetchOne.mock.calls[0]?.[0].toMap()).toEqual({
      project_floor_id: 33,
      allLocales: true,
    });
    expect(wrapper.get('.floor-form-stub').attributes('data-project-id')).toBe('24');
    expect(wrapper.get('.floor-form-stub').attributes('data-project-preview-id')).toBe('15');

    await wrapper.get('.floor-form-stub').trigger('click');
    await wrapper.get('button.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.update.mock.calls[0]?.[0].toMap()).toMatchObject({
      id: 33,
      project_id: 24,
      project_preview_id: 15,
    });
  });

  it('renders initial loading and prevents repeated updates while saving', async () => {
    let resolveUpdate: ((value: DataSuccess<ProjectFloorShowModel>) => void) | undefined;
    mocks.update.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    const wrapper = mount(ProjectFloorEdit, { global });

    expect(wrapper.get('[aria-busy="true"]').text()).toBe('Loading...');

    await flushPromises();
    await wrapper.get('.floor-form-stub').trigger('click');

    const saveButton = wrapper.get('button.btn-primary');
    await saveButton.trigger('click');
    await saveButton.trigger('click');

    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(saveButton.attributes('disabled')).toBeDefined();

    resolveUpdate?.(new DataSuccess({ data: projectFloor }));
    await flushPromises();
  });

  it('handles a missing floor id without fetching the first project floor', async () => {
    mocks.route.params.project_floor_id = '';

    const wrapper = mount(ProjectFloorEdit, { global });
    await flushPromises();

    expect(mocks.fetchOne).not.toHaveBeenCalled();
    expect(wrapper.find('.project-floor-state--error').exists()).toBe(true);
    expect(wrapper.find('.floor-form-stub').exists()).toBe(false);
  });

  it('maps API validation errors back to the shared form fields', async () => {
    mocks.update.mockResolvedValue({
      hasError: true,
      error: { validationErrors: { 'spaces.0.length': ['Length must be positive'] } },
    });
    const wrapper = mount(ProjectFloorEdit, { global });
    await flushPromises();

    await wrapper.get('.floor-form-stub').trigger('click');
    await wrapper.get('button.btn-primary').trigger('click');
    await flushPromises();

    expect(wrapper.get('.floor-form-stub').text()).toContain('Length must be positive');
  });
});
