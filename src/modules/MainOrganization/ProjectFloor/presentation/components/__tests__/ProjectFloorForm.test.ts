import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FloorNumber } from '../../../core/constants/floor.number.enum';
import ProjectFloorShowModel from '../../../core/models/project.floor.show.model';
import AddProjectFloorParams from '../../../core/params/add.project.floor.params';
import ProjectFloorForm from '../ProjectFloorForm.vue';

const mocks = vi.hoisted(() => ({
  fetchList: vi.fn(),
  listState: {
    value: {
      data: [
        { id: 8, title: 'Reception' },
        { id: 9, title: 'Meeting room' },
      ],
    },
  },
}));

vi.mock('@/modules/shared/Space/presentation/controllers/space.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList: mocks.fetchList,
      listState: mocks.listState,
    }),
  },
}));

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
      attachments: [{ id: 91, file: 'existing.pdf', alt: 'Existing plan' }],
    },
  ],
});

const global = {
  stubs: {
    ProjectPreviewIndex: { template: '<div class="project-preview-index-stub" />' },
    FieldHelpIcon: { template: '<span />' },
    UpdatedCustomInputSelect: {
      name: 'UpdatedCustomInputSelect',
      props: ['id', 'modelValue', 'staticOptions', 'placeholder', 'type'],
      emits: ['update:modelValue'],
      template: '<div class="select-stub" :id="id" />',
    },
  },
};

describe('ProjectFloorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchList.mockResolvedValue(undefined);
  });

  it('hydrates every edit field and emits the complete add-compatible payload', async () => {
    const wrapper = mount(ProjectFloorForm, {
      props: { projectFloor, isEdit: true },
      global,
    });
    await flushPromises();

    expect(wrapper.text()).toContain('Reception');

    const emittedParams = wrapper.emitted<AddProjectFloorParams[]>('updateData')?.at(-1)?.[0];

    expect(emittedParams).toBeInstanceOf(AddProjectFloorParams);
    expect(emittedParams?.toMap()).toEqual({
      project_id: 24,
      project_preview_id: 15,
      site_description: 'Current site description',
      technical_general_notes: 'Current technical notes',
      inspection_recommendations: 'Current recommendations',
      floors: [
        {
          floor_number: FloorNumber.GROUND_FLOOR,
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
        },
      ],
    });
    expect(mocks.fetchList).toHaveBeenCalledTimes(1);
  });

  it('shows nested API validation errors after opening the saved floor for editing', async () => {
    const wrapper = mount(ProjectFloorForm, {
      props: {
        projectFloor,
        validationErrors: {
          floor_number: 'Choose a floor',
          site_description: 'Site description is required',
          'spaces.0.length': 'Length must be positive',
        },
      },
      global,
    });

    await wrapper.get('.floor-card__actions .icon-btn').trigger('click');

    expect(wrapper.text()).toContain('Length must be positive');
    expect(wrapper.text()).toContain('Site description is required');
    expect(wrapper.get('textarea[aria-invalid="true"]').element).toHaveProperty(
      'value',
      'Current site description',
    );
  });

  it('emits a valid floor payload without project_preview_id when no preview exists', async () => {
    const wrapper = mount(ProjectFloorForm, {
      props: { projectId: 24 },
      global,
    });
    await flushPromises();

    const emittedParams = wrapper.emitted<AddProjectFloorParams[]>('updateData')?.at(-1)?.[0];

    expect(emittedParams).toBeInstanceOf(AddProjectFloorParams);
    expect(emittedParams?.project_id).toBe(24);
    expect(emittedParams?.project_preview_id).toBeUndefined();
    expect(emittedParams?.toMap()).not.toHaveProperty('project_preview_id');
  });

  it('keeps a floor out of saved floors when a space dimension is empty', async () => {
    const wrapper = mount(ProjectFloorForm, {
      props: { projectId: 24 },
      global,
    });
    await flushPromises();

    const spaceSelect = wrapper
      .findAllComponents({ name: 'UpdatedCustomInputSelect' })
      .find((select) => select.props('id') === 'space_id');

    spaceSelect?.vm.$emit('update:modelValue', [{ id: 8, title: 'Reception' }]);
    await wrapper.vm.$nextTick();
    await wrapper.get('.secondary-action-btn').trigger('click');
    await wrapper.get('.primary-action-btn').trigger('click');

    expect(wrapper.find('.floor-card').exists()).toBe(false);
    expect(wrapper.text()).toContain('Length must be greater than zero.');
    expect(wrapper.text()).toContain('Width must be greater than zero.');
    expect(wrapper.text()).toContain('Height must be greater than zero.');
    expect(wrapper.get('input[placeholder="Length"]').attributes('aria-invalid')).toBe('true');
  });
});
