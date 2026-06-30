import { describe, expect, it } from 'vitest';
import SpaceModel from '../space.model';

describe('SpaceModel', () => {
  it('maps snake-case API data', () => {
    expect(
      SpaceModel.fromJson({
        id: 2,
        title: 'Mall',
        translations: [{ locale: 'en', title: 'Mall' }],
      }),
    ).toMatchObject({
      id: 2,
      title: 'Mall',
    });
  });
});
