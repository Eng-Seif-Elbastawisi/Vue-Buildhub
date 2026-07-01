import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing a country
 */
export default class ShowClientSourceParams implements Params {
  public id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    // id: { required: true, minLength: 1 },
  });

  constructor(id: number,allLocales?: boolean) {
    this.id = id;
    this.allLocales = allLocales;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      client_source_id: this.id,
    };

    return map;
  }

  validate() {
    return ShowClientSourceParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowClientSourceParams.validation.validateOrThrow(this);
  }
}
