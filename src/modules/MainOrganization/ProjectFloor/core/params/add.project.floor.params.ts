import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type Status } from '../constants/status.enum';

export default class AddProjectFloorParams implements Params {
  public project_id: number;
  public status?: Status;
  public project_preview_id?: number;
  public floor_number?: string;
  public site_description?: string;
  public technical_general_notes?: string;
  public inspection_recommendations?: string;

  public static readonly validation = new ClassValidation().setRules({
    project_id: { required: true },
    project_preview_id: { required: true },
    floor_number: { required: true },
    site_description: { required: true },
    technical_general_notes: { required: true },
    inspection_recommendations: { required: true },
  });

  constructor(data: {
    project_id: number;
    status?: Status;
    project_preview_id?: number;
    floor_number?: string;
    site_description?: string;
    technical_general_notes?: string;
    inspection_recommendations?: string;
  }) {
    this.project_id = data.project_id;
    this.status = data.status;
    this.project_preview_id = data.project_preview_id;
    this.floor_number = data.floor_number;
    this.site_description = data.site_description;
    this.technical_general_notes = data.technical_general_notes;
    this.inspection_recommendations = data.inspection_recommendations;
  }

  toMap(): Record<string, unknown> {
    return {
      project_id: this.project_id,
      status: this.status,
      project_preview_id: this.project_preview_id,
      floor_number: this.floor_number,
      site_description: this.site_description,
      technical_general_notes: this.technical_general_notes,
      inspection_recommendations: this.inspection_recommendations,
    };
  }

  validate() {
    return AddProjectFloorParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectFloorParams.validation.validateOrThrow(this);
  }
}
