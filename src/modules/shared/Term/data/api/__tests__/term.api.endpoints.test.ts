import { describe, expect, it } from 'vitest';
import { TermEndpoints } from '../term.api.endpoints';

describe('TermEndpoints', () => {
  it('uses term CRUD endpoints', () => {
    const endpoints = new TermEndpoints();

    expect(endpoints.index).toContain('fetch_term');
    expect(endpoints.store).toContain('store_term');
    expect(endpoints.update).toContain('update_term');
  });
});
