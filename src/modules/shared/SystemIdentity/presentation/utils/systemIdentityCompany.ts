import type { SystemIdentitySetting } from '../composables/useSystemIdentityTheme';

interface SystemIdentityUser {
  email?: string | null;
  setting?: SystemIdentitySetting | null;
}

export interface SystemIdentityCompany {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string | null;
}

const clean = (value?: string | null) => value?.trim() || '';

export const getSystemIdentityCompany = (
  user: SystemIdentityUser | null | undefined,
  fallbackName: string,
): SystemIdentityCompany => {
  const setting = user?.setting;
  const organization = setting?.organization;

  return {
    name: clean(organization?.name) || clean(setting?.name) || fallbackName,
    email:
      clean(organization?.email) ||
      clean(setting?.email) ||
      clean(setting?.employee?.email) ||
      clean(user?.email),
    phone: clean(organization?.phone) || clean(setting?.phone) || clean(setting?.employee?.phone),
    address: clean(organization?.address) || clean(setting?.address),
    logo: setting?.logo,
  };
};
