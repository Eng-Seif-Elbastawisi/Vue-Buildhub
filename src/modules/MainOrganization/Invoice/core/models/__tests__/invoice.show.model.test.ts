import { describe, expect, it } from 'vitest';
import InvoiceShowModel from '../invoice.show.model';

describe('InvoiceShowModel', () => {
  it('maps invoice show response with related entities, items, and payments', () => {
    const model = InvoiceShowModel.fromJson({
      id: 7,
      project_id: 10,
      project: { id: 10, title: [{ locale: 'en', title: 'Tower project' }] },
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      status: 'paid',
      export_status: 'not_exported',
      organization: { id: 1, name: 'Techlab' },
      created_by: { id: 2, name: 'Techlab Employee' },
      client: { id: 3, name: 'Client Name', phone: '+20 100' },
      invoice_items: [
        {
          id: 1,
          description: 'Design services',
          quantity: 2,
          unit_price: 5000,
          discount: 500,
          tax: 250,
        },
      ],
      invoice_payments: [
        {
          id: 4,
          invoice_id: 7,
          payment_amount: 1000,
          payment_date: '2026-07-05',
          payment_method: 1,
        },
      ],
    });

    expect(model.invoice_number).toBe('INV-2026-0001');
    expect(model.project?.title).toBe('Tower project');
    expect(model.organization?.name).toBe('Techlab');
    expect(model.created_by_employee?.name).toBe('Techlab Employee');
    expect(model.client?.phone).toBe('+20 100');
    expect(model.items[0]).toMatchObject({
      description: 'Design services',
      quantity: 2,
      total: 9750,
    });
    expect(model.payments[0].payment_amount).toBe(1000);
  });

  it('throws for empty response data', () => {
    expect(() => InvoiceShowModel.fromJson(null as unknown as Record<string, unknown>)).toThrow();
  });
});
