import { describe, expect, it } from 'vitest';
import AddMeasurementParams from '../add.measurement.params';

const translations = { title: { en: 'Primary', ar: 'Primary AR' } };

describe('AddMeasurementParams', () => {
  it('maps translations and optional parent id', () => {
    expect(new AddMeasurementParams({ translations, parentId: 7 }).toMap()).toEqual({
      translations,
      parent_id: 7,
    });
    expect(new AddMeasurementParams({ translations }).toMap()).toEqual({ translations });
  });

  it('validates required translations', () => {
    expect(new AddMeasurementParams({ translations }).validate().isValid).toBe(true);
    expect(new AddMeasurementParams({}).validate().isValid).toBe(false);
  });
});
