import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class AddEducationSubjectTopicParams implements Params {
  public id: number;
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { id: number; translations: TranslationParams }) {
    this.id = data.id;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_id: this.id,
      translations: this.translations,
    };
  }

  validate() {
    return AddEducationSubjectTopicParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationSubjectTopicParams.validation.validateOrThrow(this);
  }
}
