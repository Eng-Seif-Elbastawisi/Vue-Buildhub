import { describe, expect, it } from 'vitest';
import DeleteProjectFloorParams from '../delete.project.floor.params';

describe('DeleteProjectFloorParams', () => {
  it('maps the project floor id', () => {
    const params = new DeleteProjectFloorParams({ projectFloorId: 9 });

    expect(params.toMap()).toEqual({ projectFloorId: 9 });
  });
});
