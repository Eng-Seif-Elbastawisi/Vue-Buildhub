import { describe, expect, it } from 'vitest';
import MeasurementModel from '../../../core/models/stage.model';
import MeasurementRepository from '../measurement.repository';

describe('MeasurementRepository', () => {
  it('returns the same singleton instance', () => {
    expect(MeasurementRepository.getInstance()).toBe(MeasurementRepository.getInstance());
  });

  it('parses valid items and skips invalid list entries', () => {
    const repository = MeasurementRepository.getInstance() as unknown as {
      parseItem(data: unknown): MeasurementModel;
      parseList(data: unknown): MeasurementModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem({ id: 1, title: 'Primary', education_type: null })).toBeInstanceOf(
      MeasurementModel,
    );
    expect(
      repository.parseList([{ id: 1, title: 'Primary', education_type: null }, null, undefined]),
    ).toHaveLength(1);
    expect(repository.parseList({})).toEqual([]);
  });
});
