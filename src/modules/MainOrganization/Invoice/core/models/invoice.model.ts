export type InvoiceProjectModel = {
  id?: number;
  title?: string;
  name?: string;
};

export default class InvoiceModel {
  public readonly id?: number;
  public readonly project_id?: number;
  public readonly project?: InvoiceProjectModel | null;
  public readonly invoice_number?: string;
  public readonly invoice_date?: string;
  public readonly invoice_amount?: number;
  public readonly notes?: string | null;
  public readonly status?: string | number;

  constructor(data: {
    id?: number;
    project_id?: number;
    project?: InvoiceProjectModel | null;
    invoice_number?: string;
    invoice_date?: string;
    invoice_amount?: number;
    notes?: string | null;
    status?: string | number;
  }) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.project = data.project;
    this.invoice_number = data.invoice_number;
    this.invoice_date = data.invoice_date;
    this.invoice_amount = data.invoice_amount;
    this.notes = data.notes;
    this.status = data.status;

    Object.freeze(this);
  }

  static getPlainTitle(value: unknown): string {
    if (!value) return '';
    if (typeof value === 'string') return value;

    if (Array.isArray(value)) {
      const english = value.find((item) => item?.locale === 'en')?.title;
      const arabic = value.find((item) => item?.locale === 'ar')?.title;
      const first = value.find((item) => item?.title)?.title;

      return english || arabic || first || '';
    }

    return '';
  }

  static mapProject(project: unknown): InvoiceProjectModel | null {
    if (!project || typeof project !== 'object') return null;

    const data = project as Record<string, unknown>;

    return {
      id: data.id as number | undefined,
      title: InvoiceModel.getPlainTitle(data.title),
      name: data.name as string | undefined,
    };
  }

  static fromJson(json: Record<string, unknown>): InvoiceModel {
    if (!json) throw new Error('Cannot create InvoiceModel from null or undefined');

    return new InvoiceModel({
      id: json.id as number | undefined,
      project_id:
        (json.project_id as number | undefined) ??
        ((json.project as Record<string, unknown> | undefined)?.id as number | undefined),
      project: InvoiceModel.mapProject(json.project),
      invoice_number: json.invoice_number as string | undefined,
      invoice_date: json.invoice_date as string | undefined,
      invoice_amount: Number(json.invoice_amount ?? 0),
      notes: json.notes as string | null | undefined,
      status: (json.status ?? json.invoice_status) as string | number | undefined,
    });
  }

  static example = new InvoiceModel({
    id: 1,
    project_id: 10,
    project: { id: 10, title: 'Commercial project' },
    invoice_number: 'INV-2026-0001',
    invoice_date: '2026-07-05',
    invoice_amount: 15000,
    notes: 'First design invoice',
    status: 'paid',
  });
}
