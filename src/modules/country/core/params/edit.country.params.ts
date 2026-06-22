import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for updating an existing country
 */
export default class EditCountryParams implements Params {
  public id: number;
  public title: string;
  public code: string;
  public flag: string;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1, maxLength: 100 },
    title: { required: true, minLength: 2, maxLength: 100 },
    code: { required: true, minLength: 2, maxLength: 100 },
    flag: { required: true, minLength: 2, maxLength: 100 },
  });

  constructor(id: number, title: string, code: string, flag: string) {
    this.id = id;
    this.title = title;
    this.code = code;
    this.flag = flag;
  }

  toMap(): { [p: string]: any } {
    return {
      id: this.id,
      title: this.title,
      code: this.code,
      flag: this.flag,
    };
  }

  validate() {
    return EditCountryParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditCountryParams.validation.validateOrThrow(this);
  }
}
