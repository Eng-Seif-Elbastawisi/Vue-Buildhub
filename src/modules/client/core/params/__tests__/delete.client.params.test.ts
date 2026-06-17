import { describe, expect, it } from 'vitest';
import DeleteClientParams from '../delete.client.params';

describe('DeleteClientParams', () => {
  it('maps and validates client id', () => {
    expect(new DeleteClientParams({ client_id: 7 }).toMap()).toEqual({ client_id: 7 });
    expect(
      new DeleteClientParams({ client_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
