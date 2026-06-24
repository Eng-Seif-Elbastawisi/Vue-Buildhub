import { describe, expect, it } from 'vitest';
import SpecializationModel from '../specialization.model';

describe('SpecializationModel', () => {
  it('maps snake-case API data', () => {
    expect(
      SpecializationModel.fromJson({
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
