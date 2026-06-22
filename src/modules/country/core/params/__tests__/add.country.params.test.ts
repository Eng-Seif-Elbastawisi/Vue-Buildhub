import { describe, it, expect } from 'vitest';
import AddCountryParams from '../add.country.params';

describe('AddCountryParams', () => {
  it('should create an instance with correct data', () => {
    const params = new AddCountryParams({
      title: 'United States',
      code: 'US',
      flag: '🇺🇸',
    });

    expect(params.title).toBe('United States');
    expect(params.code).toBe('US');
    expect(params.flag).toBe('🇺🇸');
  });

  it('should map to an object correctly', () => {
    const params = new AddCountryParams({
      title: 'Canada',
      code: 'CA',
      flag: '🇨🇦',
    });

    const map = params.toMap();
    expect(map).toEqual({
      title: 'Canada',
      code: 'CA',
      flag: '🇨🇦',
    });
  });

  it('should validate correctly with valid data', () => {
    const params = new AddCountryParams({
      title: 'Egypt',
      code: 'EG',
      flag: '🇪🇬',
    });

    const result = params.validate();
    expect(result.isValid).toBe(true);
  });

  it('should fail validation with short title', () => {
    const params = new AddCountryParams({
      title: 'A',
      code: 'EG',
      flag: '🇪🇬',
    });

    const result = params.validate();
    expect(result.isValid).toBe(false);
  });
});
