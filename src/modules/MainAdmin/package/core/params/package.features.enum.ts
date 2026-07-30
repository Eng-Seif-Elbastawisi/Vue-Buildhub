import { FeaturesKEY } from '../constants/features.enum';

export type PackageFeatureValue = number | boolean;

export interface PackageFeaturePayload {
  key: FeaturesKEY;
  value: PackageFeatureValue;
}

export interface PackageFeaturesFormData {
  employeenumbers: number;
  hasmobild: boolean;
  hasportal: boolean;
  projectnumbers: number;
}

export const createPackageFeatures = (data: PackageFeaturesFormData): PackageFeaturePayload[] => {
  return [
    {
      key: FeaturesKEY.NUMBER_OF_EMPLOYEES,
      value: data.employeenumbers,
    },
    {
      key: FeaturesKEY.HAS_MOBILE,
      value: data.hasmobild,
    },
    {
      key: FeaturesKEY.HAS_PORTAL,
      value: data.hasportal,
    },
    {
      key: FeaturesKEY.NUMBER_OF_PROJECTS,
      value: data.projectnumbers,
    },
  ];
};

export const isFeaturesKey = (value: unknown): value is FeaturesKEY => {
  const key = Number(value);

  return (
    key === FeaturesKEY.NUMBER_OF_EMPLOYEES ||
    key === FeaturesKEY.HAS_MOBILE ||
    key === FeaturesKEY.HAS_PORTAL ||
    key === FeaturesKEY.NUMBER_OF_PROJECTS
  );
};

export const isBooleanFeatureKey = (key: FeaturesKEY): boolean => {
  return key === FeaturesKEY.HAS_MOBILE || key === FeaturesKEY.HAS_PORTAL;
};

export function getFeaturesNameKey(feature: FeaturesKEY): string {
  switch (feature) {
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
