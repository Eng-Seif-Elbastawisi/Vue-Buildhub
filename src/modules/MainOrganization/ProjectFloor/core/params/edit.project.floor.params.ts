import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type FloorNumber } from '../constants/floor.number.enum';
import type { ProjectFloorSpaceParams } from './add.project.floor.params';

export default class EditProjectFloorParams implements Params {
  public id?: number;
  public project_id?: number;
  public project_preview_id?: number;
  public floor_number?: FloorNumber;
  public site_description?: string;
  public technical_general_notes?: string;
  public inspection_recommendations?: string;
  public spaces?: ProjectFloorSpaceParams[];

  public static readonly validation = new ClassValidation().setRules({});

  constructor(data: {
    id?: number;
    project_id?: number;
    project_preview_id?: number;
    floor_number?: FloorNumber;
    site_description?: string;
    technical_general_notes?: string;
    inspection_recommendations?: string;
    spaces?: ProjectFloorSpaceParams[];
  }) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.project_preview_id = data.project_preview_id;
    this.floor_number = data.floor_number;
    this.site_description = data.site_description;
    this.technical_general_notes = data.technical_general_notes;
    this.inspection_recommendations = data.inspection_recommendations;
    this.spaces = data.spaces;
  }

  toMap(): Record<string, unknown> {
    return {
      id: this.id,
      project_id: this.project_id,
      project_preview_id: this.project_preview_id,
      floor_number: this.floor_number,
      site_description: this.site_description,
      technical_general_notes: this.technical_general_notes,
      inspection_recommendations: this.inspection_recommendations,
      spaces: this.spaces,
    };
  }

  validate() {
    return EditProjectFloorParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditProjectFloorParams.validation.validateOrThrow(this);
  }
}
