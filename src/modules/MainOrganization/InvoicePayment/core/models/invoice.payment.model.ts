export type InvoicePaymentInvoiceModel = {
  id?: number;
  invoice_number?: string;
};

export default class InvoicePaymentModel {
  public readonly id?: number;
  public readonly invoice_id?: number;
  public readonly invoice?: InvoicePaymentInvoiceModel | null;
  public readonly payment_amount?: number;
  public readonly payment_date?: string;
  public readonly payment_method?: number;
  public readonly notes?: string | null;

  constructor(data: {
    id?: number;
    invoice_id?: number;
    invoice?: InvoicePaymentInvoiceModel | null;
    payment_amount?: number;
    payment_date?: string;
    payment_method?: number;
    notes?: string | null;
  }) {
    this.id = data.id;
    this.invoice_id = data.invoice_id;
    this.invoice = data.invoice;
    this.payment_amount = data.payment_amount;
    this.payment_date = data.payment_date;
    this.payment_method = data.payment_method;
    this.notes = data.notes;

    Object.freeze(this);
  }

  static mapInvoice(invoice: unknown): InvoicePaymentInvoiceModel | null {
    if (!invoice || typeof invoice !== 'object') return null;

    const data = invoice as Record<string, unknown>;

    return {
      id: data.id as number | undefined,
      invoice_number: data.invoice_number as string | undefined,
    };
  }

  static fromJson(json: Record<string, unknown>): InvoicePaymentModel {
    if (!json) throw new Error('Cannot create InvoicePaymentModel from null or undefined');

    return new InvoicePaymentModel({
      id: json.id as number | undefined,
      invoice_id:
        (json.invoice_id as number | undefined) ??
        ((json.invoice as Record<string, unknown> | undefined)?.id as number | undefined),
      invoice: InvoicePaymentModel.mapInvoice(json.invoice),
      payment_amount: Number(json.payment_amount ?? json.amount ?? 0),
      payment_date: (json.payment_date ?? json.date ?? json.created_at) as string | undefined,
      payment_method: Number(json.payment_method ?? json.method ?? 0),
      notes: json.notes as string | null | undefined,
    });
  }

  static example = new InvoicePaymentModel({
    id: 1,
    invoice_id: 4,
    invoice: { id: 4, invoice_number: 'INV-2026-0001' },
    payment_amount: 1000,
    payment_date: '2026-07-05',
    payment_method: 1,
    notes: 'First payment',
  });
}
