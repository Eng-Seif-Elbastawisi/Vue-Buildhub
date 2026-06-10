import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class AddSubjectItemParams implements Params {
  public translations: TranslationParams;
  public stage_id: number;
  public parent_id?: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
  });

  constructor(data: { translations: TranslationParams; stage_id: number; parent_id?: number }) {
    this.translations = data.translations;
    this.stage_id = data.stage_id;
    this.parent_id = data.parent_id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations.toMap(),
      education_classification_branch_id: this.stage_id,
    };
    if (this.parent_id) map.parent_id = this.parent_id;
    return map;
  }

  validate() {
    return AddSubjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddSubjectItemParams.validation.validateOrThrow(this);
  }
}
