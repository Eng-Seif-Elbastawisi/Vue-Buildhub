import { describe, expect, it } from 'vitest';
import IndexLaborParams from '../index.labor.params';

describe('IndexLaborParams', () => {
  it('includes the optional active filter in list requests', () => {
    const params = new IndexLaborParams({
      word: 'paint',
      pageNumber: 2,
      perPage: 25,
      withPage: 1,
      active: 1,
      itemTypeIds: [3, 5],
      measurementUnitIds: [7],
      defaultPricingMode: 'configured',
      mappingReadiness: 1,
    });

    expect(params.toMap()).toMatchObject({
      word: 'paint',
      page: 2,
      per_page: 25,
      active: 1,
      item_type_ids: [3, 5],
      measurement_unit_ids: [7],
      default_pricing_mode: 'configured',
      mapping_readiness: 1,
    });
  });

  it('omits the active filter when it is not selected', () => {
    const query = new IndexLaborParams().toMap();

    expect(query).not.toHaveProperty('active');
    expect(query).not.toHaveProperty('item_type_ids');
    expect(query).not.toHaveProperty('measurement_unit_ids');
    expect(query).not.toHaveProperty('default_pricing_mode');
    expect(query).not.toHaveProperty('mapping_readiness');
  });
});
