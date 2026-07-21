import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ShowPricePercentagesParams from '../../../core/params/show.price.percentages.params';
import { describe, expect, it } from 'vitest';
import PricePercentageRepository from '../price.percentage.repository';

describe('PricePercentageRepository', () => {
  it('returns typed percentage settings in static-data mode', async () => {
    const response = await PricePercentageRepository.getInstance().show(
      new ShowPricePercentagesParams({ projectId: 24 }),
      { useStaticData: true },
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.data?.percentages).toEqual([{ title: 'Tax', percentage: 15 }]);
  });
});
