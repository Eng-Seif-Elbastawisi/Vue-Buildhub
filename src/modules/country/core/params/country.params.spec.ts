import { describe, it, expect } from 'vitest';
import AddCountryParams from './add.country.params';
import EditCountryParams from './edit.country.params';
import ShowCountryParams from './show.country.params';

describe('Country Params', () => {
  describe('AddCountryParams', () => {
    it('should create valid params', () => {
      const params = new AddCountryParams({ title: 'Egypt', code: 'EG', flag: '🇪🇬' });
      expect(params.title).toBe('Egypt');
      expect(params.code).toBe('EG');
      expect(params.flag).toBe('🇪🇬');
    });

    it('should convert to map correctly', () => {
      const params = new AddCountryParams({ title: 'Egypt', code: 'EG', flag: '🇪🇬' });
      const map = params.toMap();
      expect(map).toEqual({
        title: 'Egypt',
        code: 'EG',
        flag: '🇪🇬',
      });
    });

    it('should pass validation for valid params', () => {
      const params = new AddCountryParams({ title: 'Egypt', code: 'EG', flag: '🇪🇬' });
      expect(params.validate().isValid).toBe(true);
    });

    it('should fail validation for invalid params', () => {
      const params = new AddCountryParams({ title: '', code: '', flag: '' });
      expect(params.validate().isValid).toBe(false);
    });
  });

  describe('EditCountryParams', () => {
    it('should create valid params', () => {
      const params = new EditCountryParams(1, 'Egypt', 'EG', '🇪🇬');
      expect(params.id).toBe(1);
      expect(params.title).toBe('Egypt');
    });

    it('should convert to map correctly', () => {
      const params = new EditCountryParams(1, 'Egypt', 'EG', '🇪🇬');
      const map = params.toMap();
      expect(map).toEqual({
        id: 1,
        title: 'Egypt',
        code: 'EG',
        flag: '🇪🇬',
      });
    });

    it('should pass validation for valid params', () => {
      const params = new EditCountryParams(1, 'Egypt', 'EG', '🇪🇬');
      expect(params.validate().isValid).toBe(true);
    });
  });

  describe('ShowCountryParams', () => {
    it('should create valid params', () => {
      const params = new ShowCountryParams(5);
      expect(params.id).toBe(5);
    });

    it('should convert to map correctly', () => {
      const params = new ShowCountryParams(5);
      const map = params.toMap();
      expect(map).toEqual({ id: 5 });
    });

    it('should pass validation for valid params', () => {
      const params = new ShowCountryParams(5);
      expect(params.validate().isValid).toBe(true);
    });
  });
});
