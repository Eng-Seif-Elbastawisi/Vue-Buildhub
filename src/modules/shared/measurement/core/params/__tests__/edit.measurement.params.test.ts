import { describe, expect, it } from 'vitest';
import EditMeasurementParams from '../edit.measurement.params';

const translations = { title: { en: 'Preparatory', ar: 'Preparatory AR' } };

describe('EditMeasurementParams', () => {
  it('maps and validates edit payloads', () => {
    const params = new EditMeasurementParams({ id: 3, translations });

    expect(params.toMap()).toEqual({ id: 3, translations });
    expect(params.validate().isValid).toBe(true);
    expect(
      new EditMeasurementParams({ id: null as unknown as number, translations }).validate().isValid,
    ).toBe(false);
  });
});
