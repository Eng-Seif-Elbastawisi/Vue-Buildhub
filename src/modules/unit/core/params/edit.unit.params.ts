import type Params from "@/base/Core/Params/params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

/**
 * Parameters for updating an existing unit
 */
export default class EditUnitParams implements Params {
  public id: number;
  public title: string;
  public SubjectId: number;
  public StageId: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1, maxLength: 100 },
    title: { required: true, minLength: 2, maxLength: 100 },
    SubjectId: { required: true },
    StageId: { required: true },
  });

  constructor(id: number, title: string, SubjectId: number, StageId: number) {
    this.id = id;
    this.title = title;
    this.SubjectId = SubjectId;
    this.StageId = StageId;
  }

  toMap(): { [p: string]: any } {
    return {
      id: this.id,
      title: this.title,
      subject_id: this.SubjectId,
      stage_id: this.StageId,
    };
  }

  validate() {
    return EditUnitParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditUnitParams.validation.validateOrThrow(this);
  }
}
