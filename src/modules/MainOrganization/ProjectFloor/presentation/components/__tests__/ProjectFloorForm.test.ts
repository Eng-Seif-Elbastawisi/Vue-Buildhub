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

    const selects = wrapper.findAllComponents({ name: 'UpdatedCustomInputSelect' });
    const floorSelect = selects.find((select) => select.props('id') === 'floor_number');

    expect(floorSelect?.props('modelValue')).toMatchObject({
      id: FloorNumber.GROUND_FLOOR,
    });
    expect((wrapper.get('#site_description').element as HTMLTextAreaElement).value).toBe(
      'Current site description',
    );
    expect((wrapper.get('#technical_general_notes').element as HTMLTextAreaElement).value).toBe(
      'Current technical notes',
    );
    expect((wrapper.get('#inspection_recommendations').element as HTMLTextAreaElement).value).toBe(
      'Current recommendations',
    );
    expect(
      (wrapper.get('input[placeholder="Enter length"]').element as HTMLInputElement).value,
    ).toBe('12.50');
    expect(wrapper.text()).toContain('Reception');

    const emittedParams = wrapper.emitted<AddProjectFloorParams[]>('updateData')?.at(-1)?.[0];

    expect(emittedParams).toBeInstanceOf(AddProjectFloorParams);
    expect(emittedParams?.toMap()).toEqual({
      project_id: 24,
      project_preview_id: 15,
      floor_number: FloorNumber.GROUND_FLOOR,
      site_description: 'Current site description',
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
    expect(mocks.fetchList).toHaveBeenCalledTimes(1);
  });

  it('shows client and nested API validation errors next to their fields', () => {
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

    expect(wrapper.text()).toContain('Choose a floor');
    expect(wrapper.text()).toContain('Site description is required');
    expect(wrapper.text()).toContain('Length must be positive');
  });
});
