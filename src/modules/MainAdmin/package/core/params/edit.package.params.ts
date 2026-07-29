import type Params from '@/base/Core/Params/params';
import type TranslationParams from '@/base/Core/Params/translationParams';

import { translate } from '@/locales/i18n';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { hasTitleTranslation } from '@/base/Presentation/Utils/input_title';

import type { AddPackageData } from './add.package.params';

import { createPackageFeatures, type PackageFeaturePayload } from './package.features.enum';

export type EditPackageData = AddPackageData & {
  id: number;
};

export default class EditPackageParams implements Params, EditPackageData {
  public readonly id: number;
  public readonly duration: number;
  public readonly hasmobild: boolean;
  public readonly hasportal: boolean;
  public readonly projectnumbers: number;
  public readonly employeenumbers: number;
  public readonly price: string;
  public readonly translations: TranslationParams;
  public readonly duration_type: AddPackageData['duration_type'];
  public readonly discount_type: AddPackageData['discount_type'];
  public readonly discount_value: string | number;
  public readonly features: PackageFeaturePayload[];

  public static readonly validation = new ClassValidation().setRules({
    id: {
      required: true,
      min: 1,
    },

    duration: {
      required: true,
      min: 0,
    },

    duration_type: {
      required: true,
    },

    hasmobild: {
      required: true,
    },

    hasportal: {
      required: true,
    },

    projectnumbers: {
      required: true,
      min: 0,
    },

    employeenumbers: {
      required: true,
      min: 0,
    },

    price: {
      required: true,
    },

    discount_type: {
      required: true,
    },

    discount_value: {
      required: true,
      min: 0,
    },

    translations: {
      required: true,

      custom: (value?: TranslationParams) =>
        hasTitleTranslation(value) || translate('validation.title_required'),
    },
  });

  constructor(packageData: EditPackageData) {
    this.id = packageData.id;

    this.duration = packageData.duration;

    this.hasmobild = packageData.hasmobild;

    this.hasportal = packageData.hasportal;

    this.projectnumbers = packageData.projectnumbers;

    this.employeenumbers = packageData.employeenumbers;

    this.price = packageData.price;

    this.translations = packageData.translations;

    this.duration_type = packageData.duration_type;

    this.discount_type = packageData.discount_type;

    this.discount_value = packageData.discount_value;

    this.features = createPackageFeatures({
      employeenumbers: packageData.employeenumbers,

      hasmobild: packageData.hasmobild,

      hasportal: packageData.hasportal,

      projectnumbers: packageData.projectnumbers,
    });
  }

  public toMap(): Record<string, unknown> {
    return {
      package_id: this.id,

      duration: this.duration,

      duration_type: this.duration_type,

      price: this.price,

      discount_type: this.discount_type,

      discount_value: this.discount_value,

      translations: this.translations,

      features: this.features,
    };
  }

  public validate() {
    return EditPackageParams.validation.validate(this);
  }

  public validateOrThrow() {
    return EditPackageParams.validation.validateOrThrow(this);
  }
}
