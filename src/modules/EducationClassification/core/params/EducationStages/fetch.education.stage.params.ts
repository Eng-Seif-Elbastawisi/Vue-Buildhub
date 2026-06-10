import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class FetchEducationStageParams implements Params {
  public classification_id: number;
  public parent_id?: number;
  public search?: string;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true },
  });

  constructor(data: { classification_id: number; parent_id?: number; search?: string }) {
    this.classification_id = data.classification_id;
    this.parent_id = data.parent_id;
    this.search = data.search;
  }

  toMap(): { [p: string]: any } {
    return {
      education_classification_id: this.classification_id,
      parent_id: this.parent_id === 0 ? null : this.parent_id,
      word: this.search,
    };
  }

  validate() {
    return FetchEducationStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return FetchEducationStageParams.validation.validateOrThrow(this);
  }
}
