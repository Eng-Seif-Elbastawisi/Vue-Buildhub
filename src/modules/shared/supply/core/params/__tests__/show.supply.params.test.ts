import { describe, expect, it } from 'vitest';
import ShowSupplyParams from '../show.supply.params';

describe('ShowSupplyParams', () => {
  it('keeps allLocales for request headers but excludes it from the API payload', () => {
    const params = new ShowSupplyParams({ supply_id: 5, allLocales: true });
    expect(params.allLocales).toBe(true);
    expect(params.toMap()).toEqual({ material_id: 5 });
  });
});
