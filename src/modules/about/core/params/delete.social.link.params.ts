import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for deleting an employee
 */
export default class DeleteSocialLinkParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [p: string]: any } {
    return {
      social_link_id: this.id,
    };
  }

  validate() {
    return DeleteSocialLinkParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteSocialLinkParams.validation.validateOrThrow(this);
  }
}
