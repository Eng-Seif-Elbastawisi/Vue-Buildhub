import InvoicePaymentModel from '@/modules/MainOrganization/InvoicePayment/core/models/invoice.payment.model';
import InvoiceModel, { type InvoiceProjectModel } from './invoice.model';

export type InvoiceRelatedEntityModel = {
  id?: number;
  title?: string;
  name?: string;
  phone?: string;
  email?: string;
};

export type InvoiceItemModel = {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total: number;
};

export default class InvoiceShowModel {
  public readonly raw?: Record<string, unknown>;
  public readonly id?: number;
  public readonly project_id?: number;
  public readonly project?: InvoiceProjectModel | null;
  public readonly invoice_number?: string;
  public readonly invoice_date?: string;
  public readonly invoice_amount?: number;
  public readonly notes?: string | null;
  public readonly status?: string | number;
  public readonly export_status?: string | number;
  public readonly organization?: InvoiceRelatedEntityModel | null;
  public readonly created_by_employee?: InvoiceRelatedEntityModel | null;
  public readonly client?: InvoiceRelatedEntityModel | null;
  public readonly items: InvoiceItemModel[];
  public readonly payments: InvoicePaymentModel[];
  public readonly created_at?: string;
  public readonly due_date?: string;
  public readonly currency?: string;

  constructor(data: {
    raw?: Record<string, unknown>;
    id?: number;
    project_id?: number;
    project?: InvoiceProjectModel | null;
    invoice_number?: string;
    invoice_date?: string;
    invoice_amount?: number;
    notes?: string | null;
    status?: string | number;
    export_status?: string | number;
    organization?: InvoiceRelatedEntityModel | null;
    created_by_employee?: InvoiceRelatedEntityModel | null;
    client?: InvoiceRelatedEntityModel | null;
    items?: InvoiceItemModel[];
    payments?: InvoicePaymentModel[];
    created_at?: string;
    due_date?: string;
    currency?: string;
  }) {
    this.raw = data.raw;
    this.id = data.id;
    this.project_id = data.project_id;
    this.project = data.project;
    this.invoice_number = data.invoice_number;
    this.invoice_date = data.invoice_date;
    this.invoice_amount = data.invoice_amount;
    this.notes = data.notes;
    this.status = data.status;
    this.export_status = data.export_status;
    this.organization = data.organization;
    this.created_by_employee = data.created_by_employee;
    this.client = data.client;
    this.items = data.items ?? [];
    this.payments = data.payments ?? [];
    this.created_at = data.created_at;
    this.due_date = data.due_date;
    this.currency = data.currency;

    Object.freeze(this);
  }

  static mapRelatedEntity(entity: unknown): InvoiceRelatedEntityModel | null {
    if (!entity || typeof entity !== 'object') return null;

    const data = entity as Record<string, unknown>;

    return {
      id: data.id as number | undefined,
      title: InvoiceModel.getPlainTitle(data.title),
      name: data.name as string | undefined,
      phone: (data.phone ?? data.mobile) as string | undefined,
      email: data.email as string | undefined,
    };
  }

  static getEntityTitle(entity?: InvoiceRelatedEntityModel | null): string {
    return entity?.name || entity?.title || (entity?.id ? `#${entity.id}` : '');
  }

  static mapInvoiceItem(item: unknown, index: number): InvoiceItemModel {
    const data = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const nestedItem = data.item as Record<string, unknown> | undefined;
    const description =
      (data.description as string | undefined) ||
      InvoiceModel.getPlainTitle(data.title) ||
      (data.name as string | undefined) ||
      InvoiceModel.getPlainTitle(nestedItem?.title) ||
      (nestedItem?.name as string | undefined) ||
      `#${index + 1}`;
    const quantity = Number(data.quantity ?? data.qty ?? 1);
    const unitPrice = Number(data.unit_price ?? data.price ?? data.amount ?? 0);
    const discount = Number(data.discount ?? 0);
    const tax = Number(data.tax ?? data.tax_amount ?? 0);
    const fallbackTotal = quantity * unitPrice - discount + tax;

    return {
      id: data.id as number | undefined,
      description,
      quantity,
      unit_price: unitPrice,
      discount,
      tax,
      total: Number(data.total ?? data.total_amount ?? fallbackTotal),
    };
  }

  static mapItems(items: unknown): InvoiceItemModel[] {
    if (!Array.isArray(items)) return [];

    return items.map((item, index) => InvoiceShowModel.mapInvoiceItem(item, index));
  }

  static mapPayments(payments: unknown): InvoicePaymentModel[] {
    if (!Array.isArray(payments)) return [];

    return payments.map((payment) =>
      InvoicePaymentModel.fromJson(payment as Record<string, unknown>),
    );
  }

  static fromJson(json: Record<string, unknown>): InvoiceShowModel {
    if (!json) throw new Error('Cannot create InvoiceShowModel from null or undefined');

    const baseInvoice = InvoiceModel.fromJson(json);
    const createdBy =
      json.created_by_employee ?? json.created_by ?? json.employee ?? json.created_by_user;
    const items = json.invoice_items ?? json.items;
    const payments = json.invoice_payments ?? json.payments ?? json.payment_records;

    return new InvoiceShowModel({
      raw: json,
      id: baseInvoice.id,
      project_id: baseInvoice.project_id,
      project: baseInvoice.project,
      invoice_number: baseInvoice.invoice_number,
      invoice_date: baseInvoice.invoice_date,
      invoice_amount: baseInvoice.invoice_amount,
      notes: baseInvoice.notes,
      status: (json.status ?? json.invoice_status) as string | number | undefined,
      export_status: (json.export_status ?? json.invoice_export_status) as
        | string
        | number
        | undefined,
      organization: InvoiceShowModel.mapRelatedEntity(json.organization),
      created_by_employee: InvoiceShowModel.mapRelatedEntity(createdBy),
      client: InvoiceShowModel.mapRelatedEntity(json.client),
      items: InvoiceShowModel.mapItems(items),
      payments: InvoiceShowModel.mapPayments(payments),
      created_at: json.created_at as string | undefined,
      due_date: (json.due_date ?? json.invoice_due_date) as string | undefined,
      currency: (json.currency ?? json.currency_code) as string | undefined,
    });
  }

  static example = new InvoiceShowModel({
    raw: {},
    id: 1,
    project_id: 10,
    project: { id: 10, title: 'Commercial project' },
    invoice_number: 'INV-2026-0001',
    invoice_date: '2026-07-05',
    invoice_amount: 15000,
    notes: 'First design invoice',
    status: 'paid',
    export_status: 'not_exported',
    organization: { id: 1, name: 'Techlab' },
    created_by_employee: { id: 2, name: 'Techlab Employee' },
    client: { id: 3, name: 'BuildHub Client', phone: '+20 100 000 0000' },
    items: [
      {
        id: 1,
        description: 'Project supervision services',
        quantity: 1,
        unit_price: 15000,
        discount: 0,
        tax: 0,
        total: 15000,
      },
    ],
    payments: [InvoicePaymentModel.example],
    created_at: '2026-07-05 09:52:00',
    due_date: '2026-07-12',
    currency: 'EGP',
  });
}
