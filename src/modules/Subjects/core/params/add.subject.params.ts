import type Params from "@/base/Core/Params/params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

/**
 * Parameters for adding a new country
 */
export default class AddSubjectParams implements Params {
  public title: string;
  public StageId: number;
  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
    educationType: { required: true },
  });

  constructor(data: { title: string; StageId: number; parentId?: number }) {
    this.title = data.title;
    this.StageId = data.StageId;
    this.parentId = data.parentId;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      title: this.title,
      stage_id: this.StageId,
    };
    if (this.parentId) {
      map.parent_id = this.parentId;
    }
    return map;
  }

  validate() {
    return AddSubjectParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddSubjectParams.validation.validateOrThrow(this);
  }
}
