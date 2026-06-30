import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class DeleteProjectItemParams implements Params {
  public project_item_id: number;

  public static readonly validation = new ClassValidation().setRules({
    project_item_id: { required: true },
  });

  constructor(data: { project_item_id: number }) {
    this.project_item_id = data.project_item_id;
  }

  toMap(): { [p: string]: any } {
    return {
      project_item_id: this.project_item_id,
    };
  }

  validate() {
    return DeleteProjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return DeleteProjectItemParams.validation.validateOrThrow(this);
  }
}
