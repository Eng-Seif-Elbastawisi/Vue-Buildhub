import { describe, expect, it } from 'vitest';
import PricePercentageModel from '../price.percentage.model';

describe('PricePercentageModel', () => {
  it('maps valid percentage entries and ignores malformed response rows', () => {
    const model = PricePercentageModel.fromJson({
      percentages: [
        { title: ' Tax ', percentage: 15 },
        { title: 'Service', percentage: '115' },
        { title: '', percentage: 10 },
      ],
    });

    expect(model.percentages).toEqual([
      { title: 'Tax', percentage: 15 },
      { title: 'Service', percentage: 115 },
    ]);
  });
});
