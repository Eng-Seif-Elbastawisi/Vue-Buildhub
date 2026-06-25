import { describe, expect, it } from 'vitest';
import { LocationTypeEnum } from '../../constant/location.type.enum';
import LocationShowModel from '../location.show.model';

describe('LocationShowModel', () => {
  it('maps show response fields', () => {
    expect(
      LocationShowModel.fromJson({
        id: 9,
        parent: {
          id: 2,
          type: LocationTypeEnum.COUNTRY,
          title: [
            { locale: 'en', title: 'Egypt' },
            { locale: 'ar', title: 'مصر' },
          ],
        },
        code: 'S-01',
        type: LocationTypeEnum.CITY,
        title: [
          { locale: 'en', title: 'Store' },
          { locale: 'ar', title: 'متجر' },
        ],
      }),
    ).toMatchObject({
      id: 9,
      parent: {
        id: 2,
        type: LocationTypeEnum.COUNTRY,
        title: 'Egypt',
      },
      code: 'S-01',
      type: LocationTypeEnum.CITY,
      translations: { title: { en: 'Store', ar: 'متجر' } },
    });
  });
});
