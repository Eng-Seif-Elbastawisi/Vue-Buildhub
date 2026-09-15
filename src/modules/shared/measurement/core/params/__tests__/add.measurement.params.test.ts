import { describe, expect, it } from 'vitest';
import AddMeasurementParams from '../add.measurement.params';

const translations = { title: { en: 'Primary', ar: 'Primary AR' } };

describe('AddMeasurementParams', () => {
  it('maps translations, code, precision, status, and optional parent id', () => {
    expect(
      new AddMeasurementParams({
        translations,
        code: 'KG',
        precision: 2,
        status: true,
        parentId: 7,
      }).toMap(),
    ).toEqual({
      translations,
      code: 'KG',
      precision: 2,
      status: 1,
      parent_id: 7,
    });

    expect(
      new AddMeasurementParams({
        translations,
        code: 'M',
        precision: 0,
        status: false,
      }).toMap(),
    ).toEqual({
      translations,
      code: 'M',
      precision: 0,
      status: 0,
    });
  });

  it('validates required fields', () => {
    expect(
      new AddMeasurementParams({ translations, code: 'KG', precision: 2 }).validate().isValid,
    ).toBe(true);
    expect(new AddMeasurementParams({ translations }).validate().isValid).toBe(false);
    expect(new AddMeasurementParams({}).validate().isValid).toBe(false);
  });
});
