import type Params from "./params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

export default class BaseIdParams implements Params {
  id: number;

  public static readonly validation = new ClassValidation().setRules({
    id: { required: true, min: 1 },
  });

  constructor(id: number) {
    this.id = id;
  }

  toMap(): { [key: string]: any } {
    const map: { [key: string]: any } = {};
    map["id"] = this.id;
    return map;
  }

  validate() {
    return BaseIdParams.validation.validate(this);
  }

  validateOrThrow() {
    return BaseIdParams.validation.validateOrThrow(this);
  }
}
