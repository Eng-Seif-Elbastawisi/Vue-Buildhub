import { describe, expect, it } from 'vitest';
import { FloorNumber, getStatusNameKey } from '../floor.number.enum';

describe('FloorNumber', () => {
  it('maps supported floors to display names', () => {
    expect(getStatusNameKey(FloorNumber.GROUND_FLOOR)).toBe('Ground Floor');
    expect(getStatusNameKey(FloorNumber.FIRST_FLOOR)).toBe('First Floor');
    expect(getStatusNameKey(FloorNumber.SECOND_FLOOR)).toBe('Second Floor');
    expect(getStatusNameKey(FloorNumber.THIRD_FLOOR)).toBe('Third Floor');
  });

  it('returns unknown for unsupported display mappings', () => {
    expect(getStatusNameKey(FloorNumber.BASEMENT)).toBe('unknown');
  });
});
