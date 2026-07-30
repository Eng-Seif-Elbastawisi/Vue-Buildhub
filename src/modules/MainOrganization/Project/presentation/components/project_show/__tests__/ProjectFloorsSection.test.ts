import { mount, RouterLinkStub } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { ProjectFloor } from '../projectShow.types';
import ProjectFloorsSection from '../ProjectFloorsSection.vue';

const ProjectFloorEditDialogStub = {
  name: 'ProjectFloorEditDialog',
  props: ['modelValue', 'floor', 'projectId', 'projectPreviewId'],
  emits: ['update:modelValue', 'updated', 'updating'],
  template: '<div v-if="modelValue" class="floor-edit-dialog-stub" />',
};

const defaultProps = {
  title: 'Project Floors Summary',
  floors: [
    {
      id: 14,
      project_id: 24,
      project_preview_id: 15,
      floor_number: 2,
      status: 1,
      project_preview: { id: 15 },
      spaces: [{ id: 25, length: '87.00', width: '66.00', height: '35.00' }],
    },
  ],
  floorSpaces: [{ id: 25, length: '87.00', width: '66.00', height: '35.00' }],
  totalArea: 5742,
  averageHeight: 35,
  emptyLabel: 'No floors',
  addFloorTo: {
    name: 'add-project_floor',
    query: { project_id: 24, project_preview_id: 15 },
  },
  floorLabel: 'Floor',
  typeLabel: 'Type',
  spacesLabel: 'Spaces',
  totalAreaMeterLabel: 'Total Area',
  totalHeightMeterLabel: 'Total Height',
  statusLabel: 'Status',
  completedLabel: 'Completed',
  inProgressLabel: 'In Progress',
  totalFloorsLabel: 'Total Floors',
  totalSpacesLabel: 'Total Spaces',
  totalAreaLabel: 'Total Area',
  averageHeightLabel: 'Average Height',
  getFloorNumberLabel: () => 'Second floor',
  getFloorType: () => 'Typical Floor',
  getStatusMeta: () => ({ label: 'Active', className: 'is-active' }),
  calculateFloorArea: (floor: ProjectFloor) => {
    const firstSpace = floor.spaces?.[0];

    return Number(firstSpace?.length) * Number(firstSpace?.width);
  },
  getFloorHeight: () => 35,
  formatNumber: (value?: number | string | null) =>
    Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 }),
  formatArea: (value?: number | string | null) => `${Number(value).toLocaleString('en-US')} m²`,
};

describe('ProjectFloorsSection', () => {
  it('renders floor rows and summary totals', () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: defaultProps,
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          ProjectFloorEditDialog: ProjectFloorEditDialogStub,
        },
      },
    });

    expect(wrapper.text()).toContain('Second floor');
    expect(wrapper.text()).toContain('Typical Floor');
    expect(wrapper.text()).toContain('Completed');
    expect(wrapper.text()).toContain('5,742 m²');
  });

  it('opens the single-floor edit dialog without rendering an edit route link', async () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: defaultProps,
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          ProjectFloorEditDialog: ProjectFloorEditDialogStub,
        },
      },
    });

    const editButton = wrapper.get<HTMLButtonElement>('.floor-edit-action');

    expect(editButton.element.tagName).toBe('BUTTON');
    expect(editButton.text()).toContain('Edit Project Floor');

    await editButton.trigger('click');

    const dialog = wrapper.findComponent(ProjectFloorEditDialogStub);

    expect(dialog.props()).toEqual(
      expect.objectContaining({
        modelValue: true,
        floor: expect.objectContaining({ id: 14 }),
        projectId: 24,
        projectPreviewId: 15,
      }),
    );
    expect(wrapper.find('.floor-edit-dialog-stub').exists()).toBe(true);
  });

  it('replaces only the updated floor locally without reloading or navigating', async () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: defaultProps,
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          ProjectFloorEditDialog: ProjectFloorEditDialogStub,
        },
      },
    });

    await wrapper.get('.floor-edit-action').trigger('click');

    wrapper.findComponent(ProjectFloorEditDialogStub).vm.$emit('updated', {
      ...defaultProps.floors[0],
      spaces: [{ id: 25, length: 9, width: 4.5, height: 3.2, notes: 'Updated' }],
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('40.50');
    expect(wrapper.emitted('updated')?.[0]?.[0]).toEqual(expect.objectContaining({ id: 14 }));
  });

  it('does not render the edit action when the floor id is missing or invalid', () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: {
        ...defaultProps,
        floors: [{ ...defaultProps.floors[0], id: 0 }],
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          ProjectFloorEditDialog: ProjectFloorEditDialogStub,
        },
      },
    });

    expect(wrapper.find('.floor-edit-action').exists()).toBe(false);
  });

  it('renders an empty panel when no floors exist', () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: {
        ...defaultProps,
        floors: [],
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          ProjectFloorEditDialog: ProjectFloorEditDialogStub,
        },
      },
    });

    expect(wrapper.text()).toContain('No floors');
  });
});
