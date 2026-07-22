import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { describe, expect, it } from 'vitest';
import UpdatePricePercentagesParams from '../../../core/params/update.price.percentages.params';
import PricePercentageRepository from '../price.percentage.repository';

describe('PricePercentageRepository', () => {
  it('sets invoice offers in static-data mode', async () => {
    const response = await PricePercentageRepository.getInstance().update(
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
