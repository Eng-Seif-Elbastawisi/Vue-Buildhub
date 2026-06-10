import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new employee
 */
export default class ContactsParams implements Params {
  public readonly key: string;
  public readonly value: string;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { key: string; value: string }) {
    this.key = data.key;
    this.value = data.value;
  }

  toMap(): { [p: string]: any } {
    return {
      key: this.key,
      value: this.value,
    };
  }

  validate() {
    return ContactsParams.validation.validate(this);
  }

  validateOrThrow() {
    return ContactsParams.validation.validateOrThrow(this);
  }
}
