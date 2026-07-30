import { describe, expect, it } from 'vitest';
import { DurationType, getDurationTypeNameKey } from '../duration.type.enum';

describe('shared package duration types', () => {
  it.each([
    [DurationType.DAY, 'package.duration.day'],
    [DurationType.WEEK, 'package.duration.week'],
    [DurationType.MONTH, 'package.duration.month'],
    [DurationType.YEAR, 'package.duration.year'],
  ])('maps duration type %s to its label key', (durationType, expectedLabelKey) => {
    expect(getDurationTypeNameKey(durationType)).toBe(expectedLabelKey);
  });
});
