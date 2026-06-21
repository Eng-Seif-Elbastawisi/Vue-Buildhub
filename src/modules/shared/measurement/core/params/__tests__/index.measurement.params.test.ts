import { describe, expect, it } from 'vitest';
import IndexMeasurementParams from '../index.measurement.params';

describe('IndexMeasurementParams', () => {
  it('maps default pagination', () => {
    expect(new IndexMeasurementParams().toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });

  it('maps search and custom pagination', () => {
    expect(new IndexMeasurementParams('primary', 2, 25, 0).toMap()).toEqual({
      word: 'primary',
      with_pagination: 0,
      page: 2,
      per_page: 25,
    });
  });
});
