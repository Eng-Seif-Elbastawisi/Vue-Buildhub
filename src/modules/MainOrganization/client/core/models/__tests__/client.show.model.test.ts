import { describe, expect, it } from 'vitest';
import ClientShowModel from '../client.show.model';

describe('ClientShowModel', () => {
  it('maps show response fields', () => {
    expect(
      ClientShowModel.fromJson({
        id: 8,
        phone: 20111222333,
        name: 'Mona',
        email: 'mona@example.com',
        address: 'Giza',
      }),
    ).toMatchObject({
      id: 8,
      phone: 20111222333,
      name: 'Mona',
      email: 'mona@example.com',
      address: 'Giza',
    });
  });
});
