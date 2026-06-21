import { describe, expect, it } from 'vitest';
import OrganizationShowModel from '../organization.show.model';

const organizationJson = {
  id: 10,
  phone: '01000000000',
  employee_name: 'Jane Admin',
  employee_email: 'jane@example.com',
  employee_phone: '01111111111',
  employee_password: 'secret',
  address: 'Cairo',
  name: 'Build Hub',
};

describe('OrganizationShowModel', () => {
  it('maps show JSON and freezes the instance', () => {
    const model = OrganizationShowModel.fromJson(organizationJson);

    expect(model).toMatchObject(organizationJson);
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('maps translations and localized data helpers', () => {
    expect(
      OrganizationShowModel.mapTranslations([
        { locale: 'en', value: 'English' },
        { locale: 'ar', value: 'Arabic' },
      ]),
    ).toEqual({ en: 'English', ar: 'Arabic' });

    expect(
      OrganizationShowModel.getLocalizedData(
        { id: 7, title: [{ locale: 'en', title: 'Organization' }] },
        'en',
      ),
    ).toEqual({ id: 7, title: 'Organization' });
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => OrganizationShowModel.fromJson(undefined)).toThrow(
      'Invalid OrganizationShowModel data',
    );
    expect(OrganizationShowModel.example).toBeInstanceOf(OrganizationShowModel);
  });
});
