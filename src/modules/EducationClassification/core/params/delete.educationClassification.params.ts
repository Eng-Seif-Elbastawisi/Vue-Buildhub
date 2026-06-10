import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing a country
 */
export default class deleteEducationClassificationParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1 },
  });

  constructor(data: { id: number }) {
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      education_classification_id: this.id,
    };

    return map;
  }

  validate() {
    return deleteEducationClassificationParams.validation.validate(this);
  }

  validateOrThrow() {
    return deleteEducationClassificationParams.validation.validateOrThrow(this);
  }
}
