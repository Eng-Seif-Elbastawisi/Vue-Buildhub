import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for updating an existing country
 */
export default class EditStageParams implements Params {
  public id: number;
  public translations?: { title: Record<string, string> };

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1, maxLength: 100 },
    translations: { required: true, minLength: 2, maxLength: 100 },
  });

  constructor(data: { id: number; translations?: { title: Record<string, string> } }) {
    this.id = data.id;
    this.translations = data.translations;
  }

  toMap(): { [p: string]: any } {
    return {
      stage_id: this.id,
      translations: this.translations,
    };
  }

  validate() {
    return EditStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditStageParams.validation.validateOrThrow(this);
  }
}
