import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new country
 */
export default class AddCountryParams implements Params {
  public title: string;
  public code: string;
  public flag: string;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
    code: { required: true, minLength: 2, maxLength: 100 },
    flag: { required: true, minLength: 2, maxLength: 100 },
  });

  constructor(data: { title: string; code: string; flag: string }) {
    this.title = data.title;
    this.code = data.code;
    this.flag = data.flag;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      title: this.title,
      code: this.code,
      flag: this.flag,
    };
    return map;
  }

  validate() {
    return AddCountryParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddCountryParams.validation.validateOrThrow(this);
  }
}
