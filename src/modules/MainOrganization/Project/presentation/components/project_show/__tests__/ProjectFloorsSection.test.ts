import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectFloorsSection from '../ProjectFloorsSection.vue';

const defaultProps = {
  title: 'Project Floors Summary',
  floors: [
    {
      id: 14,
      floor_number: 2,
      status: 1,
      spaces: [{ id: 25, length: '87.00', width: '66.00', height: '35.00' }],
    },
  ],
  floorSpaces: [{ id: 25, length: '87.00', width: '66.00', height: '35.00' }],
  totalArea: 5742,
  averageHeight: 35,
  emptyLabel: 'No floors',
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
    });

    expect(wrapper.text()).toContain('Second floor');
    expect(wrapper.text()).toContain('Typical Floor');
    expect(wrapper.text()).toContain('Completed');
    expect(wrapper.text()).toContain('5,742 m²');
  });

  it('renders an empty panel when no floors exist', () => {
    const wrapper = mount(ProjectFloorsSection, {
      props: {
        ...defaultProps,
        floors: [],
      },
    });

    expect(wrapper.text()).toContain('No floors');
  });
});
