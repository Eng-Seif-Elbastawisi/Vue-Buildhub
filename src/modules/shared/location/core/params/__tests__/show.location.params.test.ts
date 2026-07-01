import { describe, expect, it } from 'vitest';
import DeleteLocationParams from '../delete.location.params';
import ShowLocationParams from '../show.location.params';

describe('location identifier params', () => {
  it('maps and validates show/delete identifiers', () => {
    expect(new ShowLocationParams({ location_id: 4 }).toMap()).toEqual({ location_id: 4 });
    expect(new DeleteLocationParams({ location_id: 4 }).toMap()).toEqual({ location_id: 4 });
    expect(
      new ShowLocationParams({ location_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
