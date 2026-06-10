import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class EditEducationSubjectTopicParams implements Params {
  public entryId: number;
  public translations: TranslationParams;
  public educationClassificationSubjectId: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: {
    entryId: number;
    translations: TranslationParams;
    educationClassificationSubjectId: number;
  }) {
    this.entryId = data.entryId;
    this.translations = data.translations;
    this.educationClassificationSubjectId = data.educationClassificationSubjectId;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_subject_topic_id: this.entryId,
      translations: this.translations.toMap(),
      education_classification_subject_id: this.educationClassificationSubjectId,
    };
  }

  validate() {
    return EditEducationSubjectTopicParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditEducationSubjectTopicParams.validation.validateOrThrow(this);
  }
}
