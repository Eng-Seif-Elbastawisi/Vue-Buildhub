import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectFloorParams implements Params {
  public project_floor_id: number;
  public allLocales: boolean | undefined;
  public static readonly validation = new ClassValidation().setRules({
    project_floor_id: { required: true },
  });

  constructor(data: { project_floor_id: number; allLocales?: boolean }) {
    this.project_floor_id = data.project_floor_id;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number | boolean> {
    const map: Record<string, number | boolean> = { project_floor_id: this.project_floor_id };
    if (this.allLocales) map.allLocales = this.allLocales;
    return map;
  }
  validate() {
    return ShowProjectFloorParams.validation.validate(this);
  }
  validateOrThrow() {
    return ShowProjectFloorParams.validation.validateOrThrow(this);
  }
}
