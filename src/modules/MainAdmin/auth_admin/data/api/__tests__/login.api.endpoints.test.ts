import { describe, expect, it } from 'vitest';
import { LoginEndpoints } from '../login.api.endpoints';

describe('LoginEndpoints', () => {
  it('builds the main portal login URL', () => {
    expect(new LoginEndpoints().login).toContain('mainportal/login');
  });
});
