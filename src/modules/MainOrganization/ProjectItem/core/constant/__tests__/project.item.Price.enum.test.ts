import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../project.item.Price.enum';

describe('ProjectItemPriceEnum', () => {
  it('exposes stable project item pricing method ids', () => {
    expect(ProjectItemPriceEnum).toEqual({
      GENERAL_ITEM: 1,
      SPACE_RELATED: 2,
      FULL_FLOOR_RELATED: 3,
    });
  });
});
