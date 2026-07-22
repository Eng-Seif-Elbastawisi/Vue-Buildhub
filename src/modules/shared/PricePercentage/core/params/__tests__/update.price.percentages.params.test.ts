import { describe, expect, it } from 'vitest';
import UpdatePricePercentagesParams from '../update.price.percentages.params';

describe('UpdatePricePercentagesParams', () => {
  it('serializes trimmed percentage entries', () => {
    const params = new UpdatePricePercentagesParams({
      projectId: 24,
      percentages: [
        { title: ' Tax ', percentage: 33.33 },
        { title: 'Service', percentage: 66.67 },
      ],
    });

    expect(params.toMap()).toEqual({
      project_id: 24,
      invoices: [
        { title: 'Tax', percentage: 33.33 },
        { title: 'Service', percentage: 66.67 },
      ],
    });
    expect(params.validate()).toEqual({ isValid: true, errors: [] });
  });

  it.each([
    ['a missing title', [{ title: '', percentage: 100 }]],
    [
      'a percentage below 1',
      [
        { title: 'Tax', percentage: 0.5 },
        { title: 'Service', percentage: 99.5 },
      ],
    ],
    ['a percentage above 100', [{ title: 'Tax', percentage: 101 }]],
  ])('rejects rows with %s', (_scenario, percentages) => {
    const params = new UpdatePricePercentagesParams({ projectId: 24, percentages });

    expect(params.validate().isValid).toBe(false);
  });

  it.each([
    [
      'a total below 100',
      [
        { title: 'Tax', percentage: 15 },
        { title: 'Service', percentage: 80 },
      ],
    ],
    ['an empty list', []],
  ])('rejects %s', (_scenario, percentages) => {
    const params = new UpdatePricePercentagesParams({ projectId: 24, percentages });

    expect(params.validate().isValid).toBe(false);
  });

  it('rejects an invalid project id', () => {
    const params = new UpdatePricePercentagesParams({
      projectId: 0,
      percentages: [{ title: 'Tax', percentage: 100 }],
    });

    expect(params.validate().isValid).toBe(false);
  });
});
