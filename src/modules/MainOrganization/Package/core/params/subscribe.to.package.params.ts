import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';

export interface SubscribeToPackageParamsData {
  package_id: number;
}

const isPositiveInteger = (rawValue: unknown): boolean => {
  const numericValue = Number(rawValue);

  return Number.isInteger(numericValue) && numericValue > 0;
};

export default class SubscribeToPackageParams implements Params {
  public readonly package_id: number;

  public static readonly validation = new ClassValidation().setRules({
    package_id: {
      required: true,
      custom: (fieldValue) =>
        isPositiveInteger(fieldValue) ||
        translate('validation.invalid', {
          field: 'package_id',
        }),
    },
  });

  constructor(subscription: SubscribeToPackageParamsData) {
    this.package_id = subscription.package_id;
  }

  public toMap(): Record<string, number> {
    return {
      package_id: this.package_id,
    };
  }

  public validate() {
    return SubscribeToPackageParams.validation.validate(this);
  }

  public validateOrThrow(): void {
    SubscribeToPackageParams.validation.validateOrThrow(this);
  }
}
