import { describe, expect, it } from 'vitest';
import { ProjectPricingDiscountEnum } from '../../../core/constant/project.pricing.discount.enum';
import ProjectPricingModel from '../../../core/models/project.pricing.model';
import ProjectPricingShowModel from '../../../core/models/project.pricing.show.model';
import ProjectPricingRepository from '../project.pricing.repository';

const pricingJson = {
  id: 7,
  total_tax: 14,
  discount_type: ProjectPricingDiscountEnum.FIXED,
  discount_value: 250,
};

describe('ProjectPricingRepository', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectPricingRepository.getInstance()).toBe(ProjectPricingRepository.getInstance());
  });

  it('parses pricing and list responses', () => {
    const repository = ProjectPricingRepository.getInstance() as unknown as {
      parseItem(data: Record<string, unknown>): ProjectPricingShowModel;
      parseList(data: unknown): ProjectPricingModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem(pricingJson)).toBeInstanceOf(ProjectPricingShowModel);
    expect(repository.parseList([pricingJson])).toEqual([expect.any(ProjectPricingModel)]);
    expect(repository.parseList({})).toEqual([]);
  });
});
