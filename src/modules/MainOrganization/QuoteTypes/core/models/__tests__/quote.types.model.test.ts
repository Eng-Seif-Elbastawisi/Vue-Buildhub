import { describe, expect, it } from 'vitest';
import QuoteTypeModel from '../quote.types.model';

describe('QuoteTypeModel', () => {
  it('maps read-only system fields from the API response', () => {
    const quoteType = QuoteTypeModel.fromJson({
      id: 4,
      title: 'Lump sum',
      description: 'Fixed total quote',
      type_code: 'LUMP_SUM',
      calculation_model: { code: 'FIXED_TOTAL' },
      quote_type_children_count: 3,
      status: 1,
    });

    expect(quoteType).toMatchObject({
      id: 4,
      typeCode: 'LUMP_SUM',
      calculationModel: 'FIXED_TOTAL',
      quoteTypeChildrenCount: 3,
      status: true,
    });
    expect(Object.isFrozen(quoteType)).toBe(true);
  });
});
