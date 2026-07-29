import type {} from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';

export const FeaturesKEY = {
  NUMBER_OF_EMPLOYEES: 1,
  HAS_MOBILE: 2,
  HAS_PORTAL: 3,
  NUMBER_OF_PROJECTS: 4,
} as const;

export type FeaturesKEY = (typeof FeaturesKEY)[keyof typeof FeaturesKEY];

export function getFeaturesNameKey(status: FeaturesKEY): string {
  switch (status) {
    case FeaturesKEY.NUMBER_OF_EMPLOYEES:
      return 'package.features.number_of_employees';
    case FeaturesKEY.HAS_MOBILE:
      return 'package.features.has_mobile';
    case FeaturesKEY.HAS_PORTAL:
      return 'package.features.has_portal';
    case FeaturesKEY.NUMBER_OF_PROJECTS:
      return 'package.features.number_of_projects';
    default:
      return 'unknown';
  }
}
