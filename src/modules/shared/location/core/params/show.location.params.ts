import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowLocationParams implements Params {
  public location_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({ 
    location_id: { required: true },
  });

  constructor(data: { location_id: number; allLocales?: boolean }) {
    this.location_id = data.location_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { location_id: this.location_id };
  }

  validate() {
    return ShowLocationParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowLocationParams.validation.validateOrThrow(this);
  }
}
