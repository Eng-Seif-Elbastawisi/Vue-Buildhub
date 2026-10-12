import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import AddProjectFloorSpaceParams from './add.project.floor.space.params';
export default class AddProjectFloorSpacesParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    projectFloorId: {
      required: true,
      custom: (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value > 0,
    },
    spaces: {
      required: true,
      custom: (value: unknown) =>
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(
          (space) => space instanceof AddProjectFloorSpaceParams && space.validate().isValid,
        ),
    },
  });
  public projectFloorId: number;
  public spaces: AddProjectFloorSpaceParams[];
  constructor(projectFloorId: number, spaces: AddProjectFloorSpaceParams[]) {
    this.projectFloorId = projectFloorId;
    this.spaces = spaces;
  }
  toMap() {
    return {
      project_floor_id: this.projectFloorId,
      spaces: this.spaces.map((space) => space.toMap()),
    };
  }
  validate() {
    return AddProjectFloorSpacesParams.validation.validate(this);
  }
  validateOrThrow() {
    AddProjectFloorSpacesParams.validation.validateOrThrow(this);
  }
}
