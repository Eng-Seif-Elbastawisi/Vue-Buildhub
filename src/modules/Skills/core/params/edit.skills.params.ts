import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import type TranslationParams from '@/modules/about/core/params/translation.params';

/**
 * Parameters for editing an employee
 */
export default class EditSkillsParams implements Params {
  public id: number;
  public translations: TranslationParams;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
    translations: { required: true },
  });

  constructor(data: { id: number; translations: TranslationParams }) {
    this.id = data.id;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return {
      skill_id: this.id,
      translations: this.translations,
    };
  }

  validate() {
    return EditSkillsParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditSkillsParams.validation.validateOrThrow(this);
  }
}
