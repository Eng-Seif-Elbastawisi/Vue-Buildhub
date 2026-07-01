import { describe, expect, it } from 'vitest';
import { LoginEndpoints } from '../login.api.endpoints';

describe('LoginEndpoints', () => {
  it('builds the organization employee login URL', () => {
    expect(new LoginEndpoints().login).toContain('organization/employee/login');
  });
});
