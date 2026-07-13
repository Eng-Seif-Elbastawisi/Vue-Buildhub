import { describe, expect, it } from 'vitest';
import { FloorNumber, getFloorNumberNameKey } from '../floor.number.enum';

describe('FloorNumber', () => {
  it('maps supported floors to i18n keys', () => {
    expect(getFloorNumberNameKey(FloorNumber.BASEMENT)).toBe('project.BASEMENT');
    expect(getFloorNumberNameKey(FloorNumber.GROUND_FLOOR)).toBe('project.GROUND_FLOOR');
    expect(getFloorNumberNameKey(FloorNumber.FIRST_FLOOR)).toBe('project.FIRST_FLOOR');
    expect(getFloorNumberNameKey(FloorNumber.SECOND_FLOOR)).toBe('project.SECOND_FLOOR');
    expect(getFloorNumberNameKey(FloorNumber.THIRD_FLOOR)).toBe('project.THIRD_FLOOR');
  });

  it('returns unknown for unsupported display mappings', () => {
    expect(getFloorNumberNameKey(999)).toBe('unknown');
  });
});
