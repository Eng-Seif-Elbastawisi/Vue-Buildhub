import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddStageParams implements Params {
  public title: string;
  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
  });

  constructor(data: { title: string; parentId?: number }) {
    this.title = data.title;
    this.parentId = data.parentId;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      title: this.title,
    };
    if (this.parentId) {
      map.parent_id = this.parentId;
    }
    return map;
  }

  validate() {
    return AddStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddStageParams.validation.validateOrThrow(this);
  }
}
