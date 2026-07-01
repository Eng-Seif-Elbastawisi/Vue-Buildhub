import { describe, expect, it } from 'vitest';
import IndexProjectFloorParams from '../index.project.floor.params';

describe('IndexProjectFloorParams', () => {
  it('adds date removal filter when provided', () => {
    const params = new IndexProjectFloorParams('floor', 2, 15, 1, '2026-06-25');

    expect(params.toMap()).toMatchObject({
      word: 'floor',
      page: 2,
      per_page: 15,
      date_remove: '2026-06-25',
    });
  });
});
