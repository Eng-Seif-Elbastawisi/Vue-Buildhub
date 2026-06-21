import { describe, expect, it } from 'vitest';
import DeleteLocationParams from '../delete.location.params';

describe('DeleteLocationParams', () => {
  it('maps and validates location id', () => {
    expect(new DeleteLocationParams({ location_id: 7 }).toMap()).toEqual({ location_id: 7 });
    expect(
      new DeleteLocationParams({ location_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
