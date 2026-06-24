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
  default_employee: {
    id: 7,
    name: 'Default Employee',
    email: 'default@example.com',
    phone: '01222222222',
    password: 'secret',
    address: 'Giza',
  },
};

describe('OrganizationShowModel', () => {
  it('maps show JSON and freezes the instance', () => {
    const model = OrganizationShowModel.fromJson(organizationJson);

    expect(model).toMatchObject({
      id: organizationJson.id,
      phone: organizationJson.phone,
      employee_name: organizationJson.employee_name,
      employee_email: organizationJson.employee_email,
      employee_phone: organizationJson.employee_phone,
      employee_password: organizationJson.employee_password,
      address: organizationJson.address,
      name: organizationJson.name,
      default_employee: {
        id: organizationJson.default_employee.id,
        employee_name: organizationJson.default_employee.name,
        employee_email: organizationJson.default_employee.email,
        employee_phone: organizationJson.default_employee.phone,
        employee_password: organizationJson.default_employee.password,
        address: organizationJson.default_employee.address,
        name: organizationJson.default_employee.name,
      },
    });
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
