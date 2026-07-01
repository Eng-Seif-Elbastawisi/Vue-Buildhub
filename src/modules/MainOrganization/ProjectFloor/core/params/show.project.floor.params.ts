import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectFloorParams implements Params {
  public projectFloorId: number;
  public allLocales: boolean | undefined;
  public static readonly validation = new ClassValidation().setRules({
    projectFloorId: { required: true },
  });

  constructor(data: { projectFloorId: number; allLocales?: boolean }) {
    this.projectFloorId = data.projectFloorId;
    this.allLocales = data.allLocales;
  }
  toMap(): Record<string, number | boolean> {
    const map: Record<string, number | boolean> = { project_floor_id: this.projectFloorId };
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
