import { describe, expect, it } from 'vitest';
import AddClientParams from '../add.client.params';

describe('AddClientParams', () => {
  it('maps and validates client create payloads', () => {
    const params = new AddClientParams({
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });

    expect(params.toMap()).toEqual({
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });
    expect(params.validate().isValid).toBe(true);
  });
});
