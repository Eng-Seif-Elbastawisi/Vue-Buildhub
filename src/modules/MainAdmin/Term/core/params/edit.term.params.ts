import type Params from '@/base/Core/Params/params';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class EditTermParams implements Params {
  public readonly id: number;
  public readonly translations: TranslationParams;
  public readonly departmentId: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translations: { required: true },
    departmentId: { required: true },
  });

  constructor(data: { id: number; translations: TranslationParams; departmentId: number }) {
    this.id = data.id;
    this.translations = data.translations;
    this.departmentId = data.departmentId;
  }

  toMap(): Record<string, TranslationParams | number> {
    return { id: this.id, translations: this.translations, department_id: this.departmentId };
  }

  validate() {
    return EditTermParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditTermParams.validation.validateOrThrow(this);
  }
}
