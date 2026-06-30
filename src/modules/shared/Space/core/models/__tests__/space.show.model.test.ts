import { describe, expect, it } from 'vitest';
import SpaceShowModel from '../space.show.model';

describe('SpaceShowModel', () => {
  it('maps project details', () => {
    expect(
      SpaceShowModel.fromJson({
        id: 3,
        title: [{ locale: 'en', title: 'Factory' }],
      }),
    ).toMatchObject({
      id: 3,
      title: 'Factory',
    });
  });
});
