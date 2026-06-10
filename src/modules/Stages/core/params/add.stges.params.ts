import type Params from "@/base/Core/Params/params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";
import type { EducationType } from "../constants/educationtype.enum";

/**
 * Parameters for adding a new country
 */
export default class AddStageParams implements Params {
  public title: string;
  public educationType: EducationType;
  public parentId?: number;

  public static readonly validation = new ClassValidation().setRules({
    title: { required: true, minLength: 2, maxLength: 100 },
    educationType: { required: true },
  });

  constructor(data: {
    title: string;
    educationType: EducationType;
    parentId?: number;
  }) {
    this.title = data.title;
    this.educationType = data.educationType;
    this.parentId = data.parentId;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      title: this.title,
      education_type: this.educationType,
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
