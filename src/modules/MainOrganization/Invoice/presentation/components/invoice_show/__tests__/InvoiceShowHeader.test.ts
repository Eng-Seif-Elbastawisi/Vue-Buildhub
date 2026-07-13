import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoiceShowModel from '../../../../core/models/invoice.show.model';
import InvoiceShowHeader from '../InvoiceShowHeader.vue';

const mountHeader = () =>
  mount(InvoiceShowHeader, {
    props: {
      invoice: new InvoiceShowModel({ ...InvoiceShowModel.example, export_status: 0 }),
      statusLabel: 'Paid',
      statusClass: 'is-paid',
      createdAtLabel: '05 Jul 2026',
      createdByLabel: 'Techlab Employee',
      indexPath: '/organization/invoice',
      editPath: '/organization/invoice/edit/1',
    },
    global: {
      mocks: {
        $t: (key: string, params?: Record<string, string>) =>
          params?.number ? `${key} ${params.number}` : key,
      },
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  });

describe('InvoiceShowHeader', () => {
  it('renders invoice title and emits actions', async () => {
    const wrapper = mountHeader();

    expect(wrapper.text()).toContain('INV-2026-0001');
    expect(wrapper.text()).toContain('Paid');

    const buttons = wrapper.findAll('button');

    expect(buttons).toHaveLength(2);

    await buttons[0].trigger('click');
    await buttons[1].trigger('click');

    expect(wrapper.emitted('download')).toHaveLength(1);
    expect(wrapper.emitted('exportInvoice')).toHaveLength(1);
    expect(wrapper.emitted('share')).toBeUndefined();
  });
});
