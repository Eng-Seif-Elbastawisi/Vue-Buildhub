import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowSpaceParams implements Params {
  public spaceId: number;
  public allLocales?: boolean;
  public static readonly validation = new ClassValidation().setRules({
    spaceId: { required: true },
  });

  constructor(data: { spaceId: number; allLocales?: boolean }) {
    this.spaceId = data.spaceId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number> {
    return { space_id: this.spaceId };
  }
  validate() {
    return ShowSpaceParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowSpaceParams.validation.validateOrThrow(this);
  }
}
