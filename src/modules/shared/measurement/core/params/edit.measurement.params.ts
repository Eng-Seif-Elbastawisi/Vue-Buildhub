import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for updating an existing country
 */
export default class EditMeasurementParams implements Params {
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
      measurement_unit_id: this.id,
      translations: this.translations,
    };
  }

  validate() {
    return EditMeasurementParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditMeasurementParams.validation.validateOrThrow(this);
  }
}
