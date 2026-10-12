import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
export default class AddProjectFloorSpaceParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    spaceId: {
      required: true,
      custom: (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value > 0,
    },
    length: {
      required: true,
      custom: (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0,
    },
    width: {
      required: true,
      custom: (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0,
    },
    height: {
      required: true,
      custom: (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0,
    },
  });
  public spaceId: number;
  public length: number;
  public width: number;
  public height: number;
  public notes: string;
  constructor(spaceId: number, length: number, width: number, height: number, notes: string) {
    this.spaceId = spaceId;
    this.length = length;
    this.width = width;
    this.height = height;
    this.notes = notes;
  }
  toMap() {
    return {
      space_id: this.spaceId,
      length: this.length,
      width: this.width,
      height: this.height,
      notes: this.notes,
    };
  }
  validate() {
    return AddProjectFloorSpaceParams.validation.validate(this);
  }
  validateOrThrow() {
    AddProjectFloorSpaceParams.validation.validateOrThrow(this);
  }
}
