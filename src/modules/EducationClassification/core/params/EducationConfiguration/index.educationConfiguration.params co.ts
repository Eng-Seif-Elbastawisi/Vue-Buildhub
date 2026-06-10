import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new country
 */
export default class IndexEducationConfigurationParams implements Params {
  public educationClassificatioId: number;
  public isLocale?:boolean

  public static readonly validation = new ClassValidation().setRules({
    educationClassificatioId: { required: true },
    isLocale: { required: false },
  });

  constructor(data: {
    educationClassificatioId: number;
    isLocale?:boolean
  }) {
    this.educationClassificatioId = data.educationClassificatioId;
    this.isLocale = data.isLocale;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      education_classification_id: this.educationClassificatioId,
    };
    if(this.isLocale)
    {
      map['is_locale'] = this.isLocale;
    }
    return map;
  }

  validate() {
    return IndexEducationConfigurationParams.validation.validate(this);
  }

  validateOrThrow() {
    return IndexEducationConfigurationParams.validation.validateOrThrow(this);
  }
}
