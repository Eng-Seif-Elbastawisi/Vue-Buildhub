import type Params from "@/base/Core/Params/params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";
import type { EducationType } from "../constants/educationtype.enum";

/**
 * Parameters for updating an existing country
 */
export default class EditStageParams implements Params {
  public id: number;
  public title: string;
  public educationType: EducationType;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1, maxLength: 100 },
    title: { required: true, minLength: 2, maxLength: 100 },
    educationType: { required: true },
  });

  constructor(id: number, title: string, educationType: EducationType) {
    this.id = id;
    this.title = title;
    this.educationType = educationType;
  }

  toMap(): { [p: string]: any } {
    return {
      id: this.id,
      title: this.title,
      education_type: this.educationType,
    };
  }

  validate() {
    return EditStageParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditStageParams.validation.validateOrThrow(this);
  }
}
