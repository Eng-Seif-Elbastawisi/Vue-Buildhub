import { describe, expect, it } from 'vitest';
import SpecializationShowModel from '../specialization.show.model';

describe('SpecializationShowModel', () => {
  it('maps project details', () => {
    expect(
      SpecializationShowModel.fromJson({
        id: 3,
        title: [{ locale: 'en', title: 'Factory' }],
      }),
    ).toMatchObject({
      id: 3,
      title: 'Factory',
    });
  });
});
