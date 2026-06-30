import { describe, expect, it } from 'vitest';
import DeleteSpaceParams from '../delete.space.params';

describe('DeleteSpaceParams', () => {
  it('maps project id', () => {
    expect(new DeleteSpaceParams({ spaceId: 2 }).toMap()).toEqual({
      space_id: 2,
    });
  });
});
