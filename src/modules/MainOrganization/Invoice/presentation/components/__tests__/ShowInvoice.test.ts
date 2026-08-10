import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddInvoicePaymentParams from '@/modules/MainOrganization/InvoicePayment/core/params/add.invoice.payment.params';
import AddInvoicePaymentDialog from '../invoice_show/AddInvoicePaymentDialog.vue';
import ShowInvoice from '../ShowInvoice.vue';

const fetchInvoiceById = vi.fn();
const fetchInvoicePayments = vi.fn();
const createInvoicePayment = vi.fn();
const pdfMocks = vi.hoisted(() => {
  type AutoTableOptions = {
    didParseCell?: (data: { cell: { text: string[] } }) => void;
  };

  const instances: Array<Record<string, unknown>> = [];
  const jsPDF = vi.fn(function () {
    const pdf = {
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
      },
      getNumberOfPages: vi.fn(() => 1),
      setPage: vi.fn(),
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      setDrawColor: vi.fn(),
      line: vi.fn(),
      text: vi.fn(),
      getImageProperties: vi.fn(() => ({ width: 100, height: 100 })),
      addImage: vi.fn(),
      addFileToVFS: vi.fn(),
      addFont: vi.fn(),
      setR2L: vi.fn(),
      processArabic: vi.fn((text: string) => `arabic:${text}`),
      save: vi.fn(),
    };

    instances.push(pdf);

    return pdf;
  });
  const autoTable = vi.fn((_pdf: unknown, options: AutoTableOptions) => {
    options.didParseCell?.({ cell: { text: ['مرحبا'] } });
  });

  return { autoTable, instances, jsPDF };
});
const invoiceData = vi.hoisted(() => ({
  id: 7,
  raw: {
    invoice_payments: [
      {
        id: 1,
        payment_amount: 1000,
        payment_date: '2026-07-05',
        payment_method: 1,
      },
    ],
  },
  invoice_number: 'INV-2026-0001',
  invoice_date: '2026-07-05',
  invoice_amount: 3666,
  paid_amount: 500,
  remaining_amount: 3166,
  status: 2,
  currency: 'EGP',
  items: [],
  payments: [
    {
      id: 1,
      payment_amount: 1000,
      payment_date: '2026-07-05',
      payment_method: 1,
    },
  ],
  project: {
    id: 10,
    title: 'Tower project',
    image: 'data:image/webp;base64,project-photo',
  },
  client: { id: 3, name: 'Client Name' },
  organization: { id: 99, name: 'Invoice organization' },
  created_by_employee: { id: 2, name: 'Techlab Employee' },
  children: [
    {
      id: 23,
      invoice_number: 'INV-sig-2026-0005.1',
      title: 'First child invoice',
      notes: 'First child note',
      invoice_amount: 3333,
      remaining_amount: 2833,
    },
  ],
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '7' } }),
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: {
      id: 1,
      name: 'Techlab Employee',
      email: 'employee@techlab.com',
      type: 2,
      setting: {
        id: 1,
        organization: {
          id: 1,
          name: 'Techlab',
          address: 'Techlab Headquarters',
        },
        employee: { id: 1, name: 'Techlab Employee' },
        logo: 'data:image/png;base64,company-logo',
      },
    },
  }),
}));

vi.mock('jspdf', () => ({
  jsPDF: pdfMocks.jsPDF,
}));

vi.mock('jspdf-autotable', () => ({
  default: pdfMocks.autoTable,
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastSuccess: vi.fn(),
  },
}));

vi.mock('../../controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({
      fetchInvoiceById,
      itemState: { value: { data: invoiceData } },
      itemData: {
        value: invoiceData,
      },
    }),
  },
}));

vi.mock(
  '@/modules/MainOrganization/InvoicePayment/presentation/controllers/invoice.payment.controller',
  () => ({
    default: {
      getInstance: () => ({
        fetchInvoicePayments,
        createInvoicePayment,
      }),
    },
  }),
);

const mountSuccessfulInvoice = () =>
  mount(ShowInvoice, {
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
        Teleport: true,
        DataStatusBuilder: {
          template: '<div><slot name="success" :data="$attrs.controller.data" /></div>',
        },
        UpdatedCustomInputSelect: true,
      },
    },
  });

describe('ShowInvoice', () => {
  beforeEach(() => {
    fetchInvoiceById.mockClear();
    fetchInvoicePayments.mockClear();
    createInvoicePayment.mockClear();
    pdfMocks.autoTable.mockClear();
    pdfMocks.jsPDF.mockClear();
    pdfMocks.instances.length = 0;
  });

  it('shows invoice-specific copy when invoice details are empty', () => {
    const wrapper = mount(ShowInvoice, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DataStatusBuilder: {
            template: '<div><slot name="empty" /></div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('invoice_show.empty');
  });

  it('fetches invoice and invoice payments by route id and renders invoice details', async () => {
    const wrapper = mountSuccessfulInvoice();

    await flushPromises();

    expect(fetchInvoiceById).toHaveBeenCalledWith(7);
    expect(fetchInvoicePayments).toHaveBeenCalledWith(7);
    expect(wrapper.text()).toContain('INV-2026-0001');
    expect(wrapper.text()).toContain('Partial');
    expect(wrapper.text()).toContain('Client Name');
    expect(wrapper.text()).toContain('First child invoice');
    expect(wrapper.find('.invoice-payment-summary').text()).toContain('3,666.00 EGP');
    expect(wrapper.find('.invoice-payment-summary').text()).toContain('500.00 EGP');
    expect(wrapper.find('.invoice-payment-summary').text()).toContain('3,166.00 EGP');
  });

  it('opens the existing payment dialog and pays the selected child invoice', async () => {
    const wrapper = mountSuccessfulInvoice();

    await flushPromises();
    await wrapper.find('.invoice-children-card__pay').trigger('click');

    const paymentDialog = wrapper.findComponent(AddInvoicePaymentDialog);
    const paymentParams = new AddInvoicePaymentParams({
      invoice_id: 23,
      payment_amount: 500,
      payment_date: '2026-07-19',
      payment_method: 1,
    });

    expect(paymentDialog.props('visible')).toBe(true);
    expect(paymentDialog.props('invoiceId')).toBe(23);
    expect(paymentDialog.find<HTMLInputElement>('#show_payment_amount').element.value).toBe('2833');

    paymentDialog.vm.$emit('submit', paymentParams);
    await flushPromises();

    expect(createInvoicePayment).toHaveBeenCalledWith(23, paymentParams);
  });

  it('uses the compact company identity header without a project photo in the invoice PDF', async () => {
    const wrapper = mountSuccessfulInvoice();

    await flushPromises();
    await wrapper.find('.invoice-show-header__actions button').trigger('click');
    await flushPromises();

    const pdf = pdfMocks.instances[0] as {
      addImage: ReturnType<typeof vi.fn>;
      save: ReturnType<typeof vi.fn>;
      text: ReturnType<typeof vi.fn>;
    };
    const renderedText = pdf.text.mock.calls.map(([text]) => text);

    expect(pdf.addImage).toHaveBeenCalledWith('data:image/png;base64,company-logo', 16, 5, 12, 12);
    expect(pdf.addImage).toHaveBeenCalledTimes(1);
    expect(renderedText).toContain('Techlab');
    expect(renderedText).toContain('Invoice summary');
    expect(renderedText).not.toContain('Invoice organization');
    expect(renderedText).toContain('Email: employee@techlab.com | Phone: -');
    expect(renderedText).toContain('Address: Techlab Headquarters');
    expect(pdfMocks.autoTable.mock.calls[0]?.[1]).toMatchObject({ startY: 30 });
    expect(pdf.save).toHaveBeenCalledWith('INV-2026-0001.pdf');
  });

  it('renders Arabic invoice translations with embedded glyphs instead of mojibake', async () => {
    const wrapper = mountSuccessfulInvoice();
    const i18n = wrapper.vm.$i18n as { locale: string };

    i18n.locale = 'ar';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      })),
    );

    await flushPromises();
    await wrapper.find('.invoice-show-header__actions button').trigger('click');
    await flushPromises();

    const pdf = pdfMocks.instances[0] as {
      addFont: ReturnType<typeof vi.fn>;
      processArabic: ReturnType<typeof vi.fn>;
      save: ReturnType<typeof vi.fn>;
      setR2L: ReturnType<typeof vi.fn>;
    };
    const tableOptions = pdfMocks.autoTable.mock.calls[0]?.[1];

    expect(pdf.addFont).toHaveBeenCalledWith(
      'NotoNaskhArabic-Regular.ttf',
      'NotoNaskhArabic',
      'normal',
    );
    expect(pdf.addFont).toHaveBeenCalledWith('NotoNaskhArabic-Bold.ttf', 'NotoNaskhArabic', 'bold');
    expect(pdf.setR2L).toHaveBeenCalledWith(false);
    expect(tableOptions).toMatchObject({
      styles: { font: 'NotoNaskhArabic', halign: 'right' },
      columnStyles: { 1: { fontStyle: 'bold', cellWidth: 55 } },
    });
    expect(pdf.processArabic).toHaveBeenCalledWith('ملخص الفاتورة');
    expect(pdf.processArabic).toHaveBeenCalledWith('مرحبا');
    expect(pdf.save).toHaveBeenCalledWith('INV-2026-0001.pdf');

    i18n.locale = 'en';
  });
});
