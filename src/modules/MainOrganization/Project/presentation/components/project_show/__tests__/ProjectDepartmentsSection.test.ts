import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectDepartmentsSection from '../ProjectDepartmentsSection.vue';

describe('ProjectDepartmentsSection', () => {
  it('renders department item rows with pricing details', () => {
    const wrapper = mount(ProjectDepartmentsSection, {
      props: {
        title: 'Project Departments',
        departments: [
          {
            id: 4,
            department: { id: 1, title: 'Design' },
            created_at: '2026-07-08 09:36:38',
            items: [
              {
                id: 9,
                uuid: 'f643c531-d970-45d4-8d4f-5e90f02507fb',
                item: { id: 5, title: 'Paint work' },
                quantity: 2,
                price: 15,
                final_price: 30,
                pricing_method: 1,
                created_at: '2026-07-08 09:36:38',
              },
            ],
          },
        ],
        emptyLabel: 'No items',
        idLabel: 'ID',
        departmentLabel: 'Department',
        departmentCountLabel: 'Departments',
        itemLabel: 'Item',
        itemsLabel: 'Items',
        itemCountLabel: 'Items',
        quantityLabel: 'Quantity',
        priceLabel: 'Price',
        unitPriceLabel: 'Unit price',
        finalPriceLabel: 'Final price',
        pricingMethodLabel: 'Pricing method',
        floorLabel: 'Floor',
        spaceLabel: 'Space',
        createdAtLabel: 'Created at',
        totalLabel: 'Total',
        currencyLabel: 'EGP',
        hintLabel: 'Click a department to view its items',
        singleOpenHintLabel: 'Only one department is opened at a time.',
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
        formatNumber: (value?: number | string | null) => Number(value).toFixed(2),
        formatDate: (value?: string | null) => value?.split(' ')[0] ?? '—',
        getEntityName: (entity) => String(entity?.title ?? entity?.name ?? '—'),
        getPricingMethodLabel: () => 'General item',
      },
      global: {
        stubs: {
          Accordion: {
            template: '<div class="p-accordion"><slot /></div>',
          },
          AccordionPanel: {
            template: '<section class="p-accordionpanel"><slot /></section>',
          },
          AccordionHeader: {
            template: '<button class="p-accordionheader"><slot /></button>',
          },
          AccordionContent: {
            template: '<div class="p-accordioncontent"><slot /></div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Project Departments');
    expect(wrapper.text()).toContain('1 Departments');
    expect(wrapper.text()).toContain('Design');
    expect(wrapper.text()).toContain('Paint work');
    expect(wrapper.text()).toContain('30.00 EGP');
    expect(wrapper.text()).toContain('General item');
    expect(wrapper.text()).toContain('Only one department is opened at a time.');
  });
});
