import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectItemParams implements Params {
  public project_item_id: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    project_item_id: { required: true },
  });

  constructor(data: { project_item_id: number; allLocales?: boolean }) {
    this.project_item_id = data.project_item_id;
    this.allLocales = data.allLocales;
  }

  toMap(): { [p: string]: number } {
    return { project_item_id: this.project_item_id };
  }

  validate() {
    return ShowProjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowProjectItemParams.validation.validateOrThrow(this);
  }
}
