import { describe, expect, it } from 'vitest';
import FetchAutoInvoicesParams from '../fetch.auto.invoices.params';

describe('FetchAutoInvoicesParams', () => {
  it('maps a valid project id', () => {
    const params = new FetchAutoInvoicesParams({ project_id: 30 });

    expect(params.toMap()).toEqual({ project_id: 30 });
    expect(params.validate().isValid).toBe(true);
  });

  it('rejects an invalid project id', () => {
    expect(new FetchAutoInvoicesParams({ project_id: 0 }).validate().isValid).toBe(false);
  });
});
