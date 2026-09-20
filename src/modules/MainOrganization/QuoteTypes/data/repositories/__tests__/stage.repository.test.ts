import { describe, expect, it, vi } from 'vitest';
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

  it('calls apiService.changeOrder when changeOrder is called', async () => {
    const repository = StageRepository.getInstance();
    const apiService = (repository as any).apiService;
    const spy = vi
      .spyOn(apiService, 'changeOrder')
      .mockResolvedValue({ statusCode: 200, data: { data: { id: 1, title: 'Stage 1' } } });

    const params = { toMap: () => ({ stage_id: 1, order: 2 }) } as any;
    const result = await repository.changeOrder(params);

    expect(spy).toHaveBeenCalledWith(params, undefined);
    expect(result.data).toBeInstanceOf(StageModel);
  });
});
