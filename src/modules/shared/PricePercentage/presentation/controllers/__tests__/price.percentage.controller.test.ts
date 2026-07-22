import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { describe, expect, it } from 'vitest';
import UpdatePricePercentagesParams from '../../../core/params/update.price.percentages.params';
import PricePercentageController from '../price.percentage.controller';

describe('PricePercentageController', () => {
  it('sets invoice offers through the repository layer', async () => {
    const response = await PricePercentageController.getInstance().updatePercentages(
      new UpdatePricePercentagesParams({
        projectId: 24,
        percentages: [{ title: 'Tax', percentage: 100 }],
      }),
      { useStaticData: true },
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.data?.percentages).toEqual([{ title: 'Tax', percentage: 15 }]);
  });
});
