import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class AddStageParams implements Params {
  public translations?: { title: Record<string, string> };
  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    translations: { required: true },
  });

  constructor(data: { translations?: { title: Record<string, string> }; parentId?: number }) {
    this.translations = data.translations;
    this.parentId = data.parentId;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      translations: this.translations,
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
