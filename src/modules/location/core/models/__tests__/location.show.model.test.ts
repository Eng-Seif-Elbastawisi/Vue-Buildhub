import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../../constant/location.type.enum';
import LocationShowModel from '../location.show.model';

describe('LocationShowModel', () => {
  it('maps show response fields', () => {
    expect(
      LocationShowModel.fromJson({
        id: 9,
        parent_id: 2,
        code: 'S-01',
        type: LocationTypeEnum.store,
        translations: { title: { en: 'Store', ar: 'متجر' } },
      }),
    ).toMatchObject({
      id: 9,
      parentId: 2,
      code: 'S-01',
      type: LocationTypeEnum.store,
      translations: { title: { en: 'Store', ar: 'متجر' } },
    });
  });
});
