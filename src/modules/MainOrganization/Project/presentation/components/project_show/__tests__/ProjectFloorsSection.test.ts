import { mount, RouterLinkStub } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectFloorsSection from '../ProjectFloorsSection.vue';

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
  calculateFloorArea: () => 5742,
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
        stubs: { RouterLink: RouterLinkStub },
      },
    });

    expect(wrapper.text()).toContain('Second floor');
    expect(wrapper.text()).toContain('Typical Floor');
    expect(wrapper.text()).toContain('Completed');
    expect(wrapper.text()).toContain('5,742 m²');
  });

  it('renders an edit action for a valid floor id with the current route convention', () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: defaultProps,
      global: {
        stubs: { RouterLink: RouterLinkStub },
      },
    });

    const editLink = wrapper.findComponent(RouterLinkStub);

    expect(editLink.text()).toContain('Edit Project Floor');
    expect(editLink.props('to')).toEqual({
      name: 'edit-project_floor',
      params: { project_floor_id: 14 },
      query: { project_id: 24, project_preview_id: 15 },
    });
  });

  it('does not render the edit action when the floor id is missing or invalid', () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: {
        ...defaultProps,
        floors: [{ ...defaultProps.floors[0], id: 0 }],
      },
      global: {
        stubs: { RouterLink: RouterLinkStub },
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
        stubs: { RouterLink: RouterLinkStub },
      },
    });

    expect(wrapper.text()).toContain('No floors');
  });
});
