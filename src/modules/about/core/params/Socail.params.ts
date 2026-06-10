import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

/**
 * Parameters for adding a new employee
 */
export default class SocialParams implements Params {
  public link: string;
  public icon: string;

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: { link: string; icon: string }) {
    this.link = data.link;
    this.icon = data.icon;
  }

  toMap(): { [p: string]: any } {
    return {
      link: this.link,
      icon: this.icon,
    };
  }

  validate() {
    return SocialParams.validation.validate(this);
  }

  validateOrThrow() {
    return SocialParams.validation.validateOrThrow(this);
  }
}
