import { describe, expect, it } from 'vitest';
import EditClientParams from '../edit.client.params';

describe('EditClientParams', () => {
  it('maps and validates client update payloads', () => {
    const params = new EditClientParams({
      client_id: 3,
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });

    expect(params.toMap()).toEqual({
      client_id: 3,
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });
    expect(params.validate().isValid).toBe(true);
  });
});
