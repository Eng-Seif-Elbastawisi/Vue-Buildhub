import { describe, expect, it } from 'vitest';
import { DurationType, getDurationTypeNameKey } from '../duration.type.enum';

describe('admin package duration compatibility exports', () => {
  it('keeps existing admin imports mapped to the shared contract', () => {
    expect(getDurationTypeNameKey(DurationType.MONTH)).toBe('package.duration.month');
  });
});
