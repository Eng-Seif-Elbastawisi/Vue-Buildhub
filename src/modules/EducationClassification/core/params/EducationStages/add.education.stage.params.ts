import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

export default class AddEducationStageParams implements Params {
  public translations: TranslationParams;
  public classification_id: number;
  public parent_id?: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: {
    translations: TranslationParams;
    classification_id: number;
    parent_id?: number;
  }) {
    this.translations = data.translations;
    this.classification_id = data.classification_id;
    this.parent_id = data.parent_id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations.toMap(),
      education_classification_id: this.classification_id,
    };
    if (this.parent_id) map.parent_id = this.parent_id;
    return map;
  }

  validate() {
    return AddEducationStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddEducationStageParams.validation.validateOrThrow(this);
  }
}
