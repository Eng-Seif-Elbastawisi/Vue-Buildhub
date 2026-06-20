import type Params from '@/base/Core/Params/params';
import type TranslationParams from '@/base/Core/Params/translationParams';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddTermParams implements Params {
  public readonly translations: TranslationParams;
  public readonly departmentId: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
    departmentId: { required: true },
  });

  constructor(data: { translations: TranslationParams; departmentId: number }) {
    this.translations = data.translations;
    this.departmentId = data.departmentId;
  }

  toMap(): Record<string, TranslationParams | number> {
    return { translations: this.translations, department_id: this.departmentId };
  }

  validate() {
    return AddTermParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddTermParams.validation.validateOrThrow(this);
  }
}
