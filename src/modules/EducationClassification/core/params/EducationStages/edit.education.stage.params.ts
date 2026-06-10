import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class EditEducationStageParams implements Params {
  public translations: TranslationParams;
  public classification_id: number;
  public branchId?: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: {
    translations: TranslationParams;
    classification_id: number;
    branchId?: number;
  }) {
    this.translations = data.translations;
    this.classification_id = data.classification_id;
    this.branchId = data.branchId;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations.toMap(),
      education_classification_branch_id: this.branchId,
      education_classification_id: this.classification_id,
    };
    return map;
  }

  validate() {
    return EditEducationStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditEducationStageParams.validation.validateOrThrow(this);
  }
}
