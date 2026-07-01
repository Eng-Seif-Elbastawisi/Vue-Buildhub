import { describe, expect, it } from 'vitest';
import LoginParams from '../login.params';

describe('LoginParams', () => {
  it('maps credentials to the login API payload', () => {
    const params = new LoginParams('admin@example.com', 'secret123');

    expect(params.toMap()).toEqual({
      credentials: 'admin@example.com',
      password: 'secret123',
    });
  });

  it('validates required fields', () => {
    expect(new LoginParams('admin@example.com', 'secret123').validate().isValid).toBe(true);
    expect(new LoginParams('', '').validate().isValid).toBe(false);
  });
});
