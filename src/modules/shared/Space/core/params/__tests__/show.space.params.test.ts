import { describe, expect, it } from 'vitest';
import ShowSpaceParams from '../show.space.params';

describe('ShowSpaceParams', () => {
  it('maps project id', () => {
    expect(new ShowSpaceParams({ spaceId: 2 }).toMap()).toEqual({
      space_id: 2,
    });
  });
});
