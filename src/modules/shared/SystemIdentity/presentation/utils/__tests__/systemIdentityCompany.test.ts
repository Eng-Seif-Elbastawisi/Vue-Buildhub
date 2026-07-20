import { describe, expect, it } from 'vitest';
import { getSystemIdentityCompany } from '../systemIdentityCompany';

describe('system identity company', () => {
  it('prefers organization identity values from the user setting', () => {
    const company = getSystemIdentityCompany(
      {
        email: 'employee@techlab.test',
        setting: {
          name: 'Fallback setting name',
          email: 'setting@techlab.test',
          phone: '+20 111',
          address: 'Setting address',
          logo: 'https://assets.test/logo.webp',
          organization: {
            name: 'Techlab',
            email: 'info@techlab.test',
            phone: '+20 100',
            address: 'Techlab Headquarters',
          },
        },
      },
      'BuildHub',
    );

    expect(company).toEqual({
      name: 'Techlab',
      email: 'info@techlab.test',
      phone: '+20 100',
      address: 'Techlab Headquarters',
      logo: 'https://assets.test/logo.webp',
    });
  });

  it('falls back through setting, employee, user, and default values', () => {
    const company = getSystemIdentityCompany(
      {
        email: ' employee@techlab.test ',
        setting: {
          employee: { phone: ' +20 122 ' },
        },
      },
      'BuildHub',
    );

    expect(company).toEqual({
      name: 'BuildHub',
      email: 'employee@techlab.test',
      phone: '+20 122',
      address: '',
      logo: undefined,
    });
  });
});
