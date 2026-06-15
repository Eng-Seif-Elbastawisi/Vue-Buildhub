import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for updating an existing country
 */
export default class EditStageParams implements Params {
  public id: number;
  public title: string;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1, maxLength: 100 },
    title: { required: true, minLength: 2, maxLength: 100 },
  });

  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
  }

  toMap(): { [p: string]: any } {
    return {
      id: this.id,
      title: this.title,
    };
  }

  validate() {
    return EditStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditStageParams.validation.validateOrThrow(this);
  }
}
