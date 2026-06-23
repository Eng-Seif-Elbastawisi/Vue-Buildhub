import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing a country
 */
export default class ShowMeasurementParams implements Params {
  public id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    // id: { required: true, minLength: 1 },
  });

  constructor(id: number , allLocales?: boolean ) {
    this.id = id;
    this.allLocales = allLocales;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      measurement_unit_id: this.id,
    };

    return map;
  }

  validate() {
    return ShowMeasurementParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowMeasurementParams.validation.validateOrThrow(this);
  }
}
