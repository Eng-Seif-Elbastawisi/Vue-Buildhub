import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class EditEducationSubjectItemParams implements Params {
  public subject_id: number;
  public translations: TranslationParams;
  public branch_id: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { subject_id: number; translations: TranslationParams; branch_id: number }) {
    this.subject_id = data.subject_id;
    this.translations = data.translations;
    this.branch_id = data.branch_id;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_id: this.subject_id,
      translations: this.translations.toMap(),
      education_classification_branch_id: this.branch_id,
    };
  }

  validate() {
    return EditEducationSubjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditEducationSubjectItemParams.validation.validateOrThrow(this);
  }
}
