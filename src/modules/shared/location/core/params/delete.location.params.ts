import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteLocationParams implements Params {
  public location_id: number;

  public static readonly validation = new ClassValidation().setRules({
    location_id: { required: true },
  });

  constructor(data: { location_id: number }) {
    this.location_id = data.location_id;
  }

  toMap(): { [p: string]: any } {
    return {
      location_id: this.location_id,
    };
  }

  validate() {
    return DeleteLocationParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteLocationParams.validation.validateOrThrow(this);
  }
}
