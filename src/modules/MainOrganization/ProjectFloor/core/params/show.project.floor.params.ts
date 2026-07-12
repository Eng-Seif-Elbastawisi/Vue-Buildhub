import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

export default class ShowProjectFloorParams implements Params {
  public project_floor_id?: number;
  public project_id?: number;
  public allLocales?: boolean;

  public static readonly validation = new ClassValidation().setRules({
    project_id: { required: true },
  });

  constructor(data: { project_floor_id?: number; project_id?: number; allLocales?: boolean }) {
    this.project_floor_id = data.project_floor_id;
    this.project_id = data.project_id;
    this.allLocales = data.allLocales;
  }

  toMap(): Record<string, number | boolean> {
    const map: Record<string, number | boolean> = {};

    if (this.project_floor_id) {
      map.project_floor_id = this.project_floor_id;
    }

    if (this.project_id) {
      map.project_id = this.project_id;
    }

    if (this.allLocales !== undefined) {
      map.allLocales = this.allLocales;
    }

    return map;
  }

  validate() {
    return ShowProjectFloorParams.validation.validate(this);
  }

  validateOrThrow() {
    return ShowProjectFloorParams.validation.validateOrThrow(this);
  }
}
