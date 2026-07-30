import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';
import {
  isPackageSubscriptionStatus,
  type PackageSubscriptionStatus,
} from '../constants/package.subscription.status.enum';

export interface ChangePackageSubscriptionStatusData {
  package_subscription_id: number;
  status: PackageSubscriptionStatus;
  notes?: string;
}

const isPositiveInteger = (value: unknown): boolean => {
  const numericValue = Number(value);

  return Number.isInteger(numericValue) && numericValue > 0;
};

export default class ChangePackageSubscriptionStatusParams implements Params {
  public readonly package_subscription_id: number;
  public readonly status: PackageSubscriptionStatus;
  public readonly notes: string;

  public static readonly validation = new ClassValidation().setRules({
    package_subscription_id: {
      required: true,
      custom: (fieldValue) =>
        isPositiveInteger(fieldValue) ||
        translate('validation.invalid', { field: 'package_subscription_id' }),
    },
    status: {
      required: true,
      custom: (fieldValue) =>
        isPackageSubscriptionStatus(fieldValue) || translate('validation.select_required'),
    },
  });

  constructor(data: ChangePackageSubscriptionStatusData) {
    this.package_subscription_id = data.package_subscription_id;
    this.status = data.status;
    this.notes = data.notes ?? '';
  }

  public toMap(): Record<string, unknown> {
    return {
      package_subscription_id: this.package_subscription_id,
      status: this.status,
      notes: this.notes,
    };
  }

  public validate() {
    return ChangePackageSubscriptionStatusParams.validation.validate(this);
  }

  public validateOrThrow() {
    return ChangePackageSubscriptionStatusParams.validation.validateOrThrow(this);
  }
}
