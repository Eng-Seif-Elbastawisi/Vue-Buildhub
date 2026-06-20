import { describe, expect, it } from 'vitest';
import ClientModel from '../client.model';

describe('ClientModel', () => {
  it('maps flat API fields', () => {
    const model = ClientModel.fromJson({
      id: 4,
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });

    expect(model).toMatchObject({
      id: 4,
      phone: 20100100100,
      name: 'Ali',
      email: 'ali@example.com',
      address: 'Cairo',
    });
  });

  it('rejects empty input', () => {
    expect(() => ClientModel.fromJson(null as unknown as Record<string, unknown>)).toThrow(
      'Cannot create ClientModel from null or undefined',
    );
  });
});
