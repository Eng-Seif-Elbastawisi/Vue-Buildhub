import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class AddDepartmentParams implements Params {
  public readonly translations: TranslationParams;
  public readonly stageId: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
    stageId: { required: true },
  });

  constructor(data: { translations: TranslationParams; stageId: number }) {
    this.translations = data.translations;
    this.stageId = data.stageId;
  }

  toMap(): { [p: string]: any } {
    return {
      translations: this.translations,
      stage_id: this.stageId,
    };
  }

  validate() {
    return AddDepartmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddDepartmentParams.validation.validateOrThrow(this);
  }
}
