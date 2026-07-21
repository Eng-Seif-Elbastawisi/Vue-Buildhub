import { describe, expect, it } from 'vitest';
import ShowPricePercentagesParams from '../show.price.percentages.params';

describe('ShowPricePercentagesParams', () => {
  it('serializes the project id', () => {
    const params = new ShowPricePercentagesParams({ projectId: 24 });

    expect(params.toMap()).toEqual({ project_id: 24 });
    expect(params.validate()).toEqual({ isValid: true, errors: [] });
  });

  it('rejects an invalid project id', () => {
    const params = new ShowPricePercentagesParams({ projectId: Number.NaN });

    expect(params.validate().isValid).toBe(false);
  });
});
