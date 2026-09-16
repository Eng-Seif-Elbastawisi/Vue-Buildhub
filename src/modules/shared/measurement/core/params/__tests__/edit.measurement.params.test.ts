import { describe, expect, it } from 'vitest';
import EditMeasurementParams from '../edit.measurement.params';

const translations = { title: { en: 'Preparatory', ar: 'Preparatory AR' } };

describe('EditMeasurementParams', () => {
  it('maps and validates edit payloads with status, code, and precision', () => {
    const params = new EditMeasurementParams({
      id: 3,
      translations,
      code: 'M',
      precision: 1,
      status: true,
    });

    expect(params.toMap()).toEqual({
      measurement_unit_id: 3,
      translations,
      code: 'M',
      precision: 1,
      status: 1,
    });
    expect(params.validate().isValid).toBe(true);
    expect(
      new EditMeasurementParams({ id: null as unknown as number, translations }).validate().isValid,
    ).toBe(false);
  });
});
