import { describe, expect, it } from 'vitest';
import StageModel from '../../../core/models/stage.model';
import StageRepository from '../stage.repository';

describe('StageRepository', () => {
  it('returns the same singleton instance', () => {
    expect(StageRepository.getInstance()).toBe(StageRepository.getInstance());
  });

  it('parses valid items and skips invalid list entries', () => {
    const repository = StageRepository.getInstance() as unknown as {
      parseItem(data: unknown): StageModel;
      parseList(data: unknown): StageModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem({ id: 1, title: 'Primary', education_type: null })).toBeInstanceOf(
      StageModel,
    );
    expect(
      repository.parseList([{ id: 1, title: 'Primary', education_type: null }, null, undefined]),
    ).toHaveLength(1);
    expect(repository.parseList({})).toEqual([]);
  });
});
