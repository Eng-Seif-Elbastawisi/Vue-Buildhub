import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for updating an existing education classification
 */
export default class EditEducationClassificationParams implements Params {
  public id: number;
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translations: { required: true },
  });

  constructor(data: { id: number; translations: TranslationParams}) {
    this.id = data.id;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_id: this.id,
      translations: this.translations.toMap(),
    };
  }

  validate() {
    return EditEducationClassificationParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditEducationClassificationParams.validation.validateOrThrow(this);
  }
}
