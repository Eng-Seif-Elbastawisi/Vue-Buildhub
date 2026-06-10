import { describe, it, expect } from 'vitest';
import { EmployeeEndpoints } from './employee.api.endpoints';

describe('EmployeeEndpoints', () => {
  it('should have the correct prefix', () => {
    const endpoints = new EmployeeEndpoints();
    // @ts-expect-error - prefix is protected
    expect(endpoints.prefix).toBe('dashboard/');
  });

  it('should have the correct endpoint URLs', () => {
    const endpoints = new EmployeeEndpoints();
    expect(endpoints.index).toContain('fetch_employees');
    expect(endpoints.show).toContain('show_employee');
    expect(endpoints.store).toContain('store_employee');
    expect(endpoints.update).toContain('update_employee');
    expect(endpoints.delete).toContain('delete_employee');
  });
});
