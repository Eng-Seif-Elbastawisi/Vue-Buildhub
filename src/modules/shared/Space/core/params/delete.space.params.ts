import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteSpaceParams implements Params {
  public spaceId: number;
  public static readonly validation = new ClassValidation().setRules({
    spaceId: { required: true },
  });

  constructor(data: { spaceId: number }) {
    this.spaceId = data.spaceId;
  }
  toMap(): Record<string, number> {
    return { space_id: this.spaceId };
  }
  validate() {
    return DeleteSpaceParams.validation.validate(this);
  }
  validateOrThrow() {
    return DeleteSpaceParams.validation.validateOrThrow(this);
  }
}
