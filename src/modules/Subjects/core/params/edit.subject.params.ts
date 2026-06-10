import type Params from "@/base/Core/Params/params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

/**
 * Parameters for updating an existing country
 */
export default class EditSubjectParams implements Params {
  public id: number;
  public title: string;
  public StageId: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1, maxLength: 100 },
    title: { required: true, minLength: 2, maxLength: 100 },
    StageId: { required: true },
  });

  constructor(id: number, title: string, StageId: number) {
    this.id = id;
    this.title = title;
    this.StageId = StageId;
  }

  toMap(): { [p: string]: any } {
    return {
      id: this.id,
      title: this.title,
      stage_id: this.StageId,
    };
  }

  validate() {
    return EditSubjectParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditSubjectParams.validation.validateOrThrow(this);
  }
}
