import type Params from "@/base/Core/Params/params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

/**
 * Parameters for adding a new unit
 */
export default class AddUnitParams implements Params {
  public title: string;
  public SubjectId: number;
  public StageId: number;
  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
    educationType: { required: true },
  });

  constructor(data: { title: string; SubjectId: number; StageId: number; parentId?: number }) {
    this.title = data.title;
    this.SubjectId = data.SubjectId;
    this.StageId = data.StageId;
    this.parentId = data.parentId;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      title: this.title,
      subject_id: this.SubjectId,
      stage_id: this.StageId,
    };
    if (this.parentId) {
      map.parent_id = this.parentId;
    }
    return map;
  }

  validate() {
    return AddUnitParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddUnitParams.validation.validateOrThrow(this);
  }
}
