import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for showing a country
 */
export default class ShowDeleteResonsParams implements Params {
  public delete_account_reason_id: number;
  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { delete_account_reason_id: number }) {
    this.delete_account_reason_id = data.delete_account_reason_id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {};

    map['delete_account_reason_id'] = this.delete_account_reason_id;
    return map;
  }

  validate() {
    return ShowDeleteResonsParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowDeleteResonsParams.validation.validateOrThrow(this);
  }
}
