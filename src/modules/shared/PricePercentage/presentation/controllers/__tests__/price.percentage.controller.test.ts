import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ShowPricePercentagesParams from '../../../core/params/show.price.percentages.params';
import { describe, expect, it } from 'vitest';
import PricePercentageController from '../price.percentage.controller';

describe('PricePercentageController', () => {
  it('loads percentage settings through the repository layer', async () => {
    const response = await PricePercentageController.getInstance().showPercentages(
      new ShowPricePercentagesParams({ projectId: 24 }),
      { useStaticData: true },
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.data?.percentages).toEqual([{ title: 'Tax', percentage: 15 }]);
  });
});
