import { describe, expect, it } from 'vitest';
import DeleteClientParams from '../delete.client.params';
import ShowClientParams from '../show.client.params';

describe('client identifier params', () => {
  it('maps and validates show/delete identifiers', () => {
    expect(new ShowClientParams({ client_id: 4 }).toMap()).toEqual({ client_id: 4 });
    expect(new DeleteClientParams({ client_id: 4 }).toMap()).toEqual({ client_id: 4 });
    expect(new ShowClientParams({ client_id: null as unknown as number }).validate().isValid).toBe(
      false,
    );
  });
});
