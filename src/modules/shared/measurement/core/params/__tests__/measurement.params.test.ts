import { describe, expect, it } from 'vitest';
import AddMeasurementParams from '../add.measurement.params';
import DeleteMeasurementParams from '../delete.measurement.params';
import EditMeasurementParams from '../edit.measurement.params';
import IndexMeasurementParams from '../index.measurement.params';
import ShowMeasurementParams from '../show.measurement.params';

const translations = { title: { en: 'Primary', ar: 'Primary AR' } };

describe('measurement params', () => {
  it('maps add and edit payloads', () => {
    const add = new AddMeasurementParams({
      translations,
      code: 'KG',
      precision: 2,
      status: true,
      parentId: 5,
    });
    const edit = new EditMeasurementParams({
      id: 3,
      translations,
      code: 'KG',
      precision: 2,
      status: true,
    });

    expect(add.toMap()).toEqual({
      translations,
      code: 'KG',
      precision: 2,
      status: 1,
      parent_id: 5,
    });
    expect(edit.toMap()).toEqual({
      measurement_unit_id: 3,
      translations,
      code: 'KG',
      precision: 2,
      status: 1,
    });
    expect(add.validate().isValid).toBe(true);
    expect(edit.validate().isValid).toBe(true);
  });

  it('omits empty optional parent id and maps list filters', () => {
    expect(
      new AddMeasurementParams({ translations, code: 'KG', precision: 2 }).toMap(),
    ).toEqual({
      translations,
      code: 'KG',
      precision: 2,
    });
    expect(new IndexMeasurementParams('primary', 2, 20, 1).toMap()).toEqual({
      word: 'primary',
      with_pagination: 1,
      page: 2,
      per_page: 20,
    });
    expect(new IndexMeasurementParams().toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });

  it('maps and validates identifiers', () => {
    expect(new ShowMeasurementParams(4).toMap()).toEqual({ measurement_unit_id: 4 });
    expect(new DeleteMeasurementParams(4).toMap()).toEqual({ measurement_unit_id: 4 });
    expect(new ShowMeasurementParams(null as unknown as number).validate().isValid).toBe(true);
  });
});
