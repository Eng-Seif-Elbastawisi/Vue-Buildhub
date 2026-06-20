import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/base/Core/Params/translationParams';

export default class EditDepartmentParams implements Params {
  public readonly id: number;
  public readonly translations: TranslationParams;
  public readonly stageId: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translations: { required: true },
    stageId: { required: true },
  });

  
  constructor(data: { id: number; translations: TranslationParams; stageId: number }) {
    this.id = data.id;
    this.translations = data.translations;
    this.stageId = data.stageId;
  }

  toMap(): { [p: string]: any } {
    return { 
      id: this.id, 
      translations: this.translations, 
      stage_id: this.stageId 
    };
  }

  validate() {
    return EditDepartmentParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditDepartmentParams.validation.validateOrThrow(this);
  }
}
