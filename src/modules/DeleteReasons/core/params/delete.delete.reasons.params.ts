import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing a country
 */
export default class DeleteDeleteResonsParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { id: number }) {
    this.id = data.id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {};
    map['delete_account_reason_id'] = this.id;
    return map;
  }

  validate() {
    return DeleteDeleteResonsParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteDeleteResonsParams.validation.validateOrThrow(this);
  }
}
