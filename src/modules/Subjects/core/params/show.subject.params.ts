import type Params from "@/base/Core/Params/params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

/**
 * Parameters for showing a country
 */
export default class ShowSubjectParams implements Params {
  public id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, minLength: 1 },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [p: string]: any } {
    const map: { [key: string]: any } = {
      id: this.id,
    };

    return map;
  }

  validate() {
    return ShowSubjectParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowSubjectParams.validation.validateOrThrow(this);
  }
}
