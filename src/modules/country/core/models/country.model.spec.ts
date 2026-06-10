import { describe, it, expect } from 'vitest';
import CountryModel from './country.model';

describe('CountryModel', () => {
  describe('constructor', () => {
    it('should create a valid country model', () => {
      const model = new CountryModel({
        id: 1,
        title: 'Egypt',
        code: 'EG',
        flag: '🇪🇬',
      });

      expect(model.id).toBe(1);
      expect(model.title).toBe('Egypt');
      expect(model.code).toBe('EG');
      expect(model.flag).toBe('🇪🇬');
    });

    it('should handle missing id', () => {
      const model = new CountryModel({
        title: 'Jordan',
        code: 'JO',
        flag: '🇯🇴',
      });

      expect(model.id).toBeUndefined();
      expect(model.title).toBe('Jordan');
    });
  });

  describe('fromJson', () => {
    it('should create model from API response', () => {
      const json = {
        id: 5,
        title: 'Saudi Arabia',
        code: 'SA',
        flag: '🇸🇦',
      };

      const model = CountryModel.fromJson(json);

      expect(model.id).toBe(5);
      expect(model.title).toBe('Saudi Arabia');
      expect(model.code).toBe('SA');
      expect(model.flag).toBe('🇸🇦');
    });

    it('should throw error when JSON is null', () => {
      expect(() => CountryModel.fromJson(null)).toThrow(
        'Cannot create CountryModel from null or undefined',
      );
    });

    it('should throw error when JSON is undefined', () => {
      expect(() => CountryModel.fromJson(undefined)).toThrow(
        'Cannot create CountryModel from null or undefined',
      );
    });
  });

  describe('example', () => {
    it('should provide a valid example instance', () => {
      expect(CountryModel.example).toBeInstanceOf(CountryModel);
      expect(CountryModel.example.title).toBe('Egypt');
      expect(CountryModel.example.code).toBe('EG');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const model = new CountryModel({
        id: 1,
        title: 'Egypt',
        code: 'EG',
        flag: '🇪🇬',
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });
});
