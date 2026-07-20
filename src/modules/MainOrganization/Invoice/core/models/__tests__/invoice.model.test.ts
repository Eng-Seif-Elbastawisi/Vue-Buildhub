import { describe, expect, it } from 'vitest';
import { InvoiceStatusEnum } from '../../constant/invoice.status.enum';
import InvoiceModel from '../invoice.model';

describe('InvoiceModel', () => {
  it('maps invoice json including localized project title', () => {
    const model = InvoiceModel.fromJson({
      id: 3,
      project_id: 10,
      project: {
        id: 10,
        title: [{ locale: 'en', title: 'Commercial Project' }],
        attachments: [
          { file: 'https://assets.test/project-plan.pdf' },
          { file: 'https://assets.test/project-photo.webp' },
        ],
      },
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: '15000',
      notes: 'First design invoice',
      status: InvoiceStatusEnum.PAID,
    });

    expect(model.id).toBe(3);
    expect(model.project_id).toBe(10);
    expect(model.project?.title).toBe('Commercial Project');
    expect(model.project?.image).toBe('https://assets.test/project-photo.webp');
    expect(model.invoice_amount).toBe(15000);
    expect(model.notes).toBe('First design invoice');
    expect(model.status).toBe(InvoiceStatusEnum.PAID);
  });

  it('throws for invalid json', () => {
    expect(() => InvoiceModel.fromJson(null as unknown as Record<string, unknown>)).toThrow();
  });
});
