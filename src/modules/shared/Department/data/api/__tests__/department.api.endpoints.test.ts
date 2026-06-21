import { describe, expect, it } from 'vitest';
import { DepartmentEndpoints } from '../department.api.endpoints';

describe('DepartmentEndpoints', () => {
  it('uses department CRUD endpoints', () => {
    const endpoints = new DepartmentEndpoints();

    expect(endpoints.index).toContain('fetch_department');
    expect(endpoints.store).toContain('store_department');
    expect(endpoints.update).toContain('update_department');
  });
});
