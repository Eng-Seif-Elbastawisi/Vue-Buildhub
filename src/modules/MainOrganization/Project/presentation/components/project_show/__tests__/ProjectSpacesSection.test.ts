import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectSpacesSection from '../ProjectSpacesSection.vue';

const mountSpaces = () =>
  mount(ProjectSpacesSection, {
    props: {
      title: 'Floor Spaces Details',
      spaces: [
        {
          id: 25,
          parentFloorNumber: 2,
          space: { id: 3, title: 'Living Room' },
          length: '87.00',
          width: '66.00',
          height: '35.00',
          notes: 'Measured',
          attachments: [{ id: 66, file: 'https://example.com/space.png', alt: 'Space image' }],
        },
      ],
      totalArea: 5742,
      emptyValue: '—',
      emptyLabel: 'No spaces',
      floorLabel: 'Floor',
      spaceLabel: 'Space',
      lengthLabel: 'Length',
      widthLabel: 'Width',
      heightLabel: 'Height',
      areaLabel: 'Area',
      notesLabel: 'Notes',
      attachmentsLabel: 'Attachments',
      totalAreaAllSpacesLabel: 'Total Area (All Spaces)',
      getFloorNumberLabel: () => 'Second floor',
      getEntityName: () => 'Living Room',
      formatNumber: (value?: number | string | null) =>
        Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      formatArea: (value?: number | string | null) => `${Number(value).toLocaleString('en-US')} m²`,
      calculateArea: () => 5742,
      valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      isImageAttachment: () => true,
    },
    global: {
      stubs: {
        Image: {
          props: ['src', 'alt'],
          template: '<img :src="src" :alt="alt" />',
        },
      },
    },
  });

describe('ProjectSpacesSection', () => {
  it('renders spaces with image attachments and total area', () => {
    const wrapper = mountSpaces();

    expect(wrapper.text()).toContain('Living Room');
    expect(wrapper.text()).toContain('Second floor');
    expect(wrapper.text()).toContain('Total Area (All Spaces): 5,742 m²');
    expect(wrapper.find('img[src="https://example.com/space.png"]').exists()).toBe(true);
  });
});
