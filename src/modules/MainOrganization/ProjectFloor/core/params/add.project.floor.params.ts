import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { FloorNumber } from '../constants/floor.number.enum';

export interface ProjectFloorSpaceAttachmentParams {
  file: string;
  alt?: string | null;
  link?: string | null;
}

export interface ProjectFloorSpaceParams {
  space_id: number;
  length: number;
  width: number;
  height: number;
  notes?: string;
  attachments?: ProjectFloorSpaceAttachmentParams[];
}

export const mapProjectFloorSpacesToPayload = (
  spaces?: ProjectFloorSpaceParams[],
): Record<string, unknown>[] | undefined => {
  return spaces?.map((space) => {
    const attachments = space.attachments?.map((attachment) =>
      Object.fromEntries(Object.entries(attachment).filter(([, value]) => value !== undefined)),
    );
    const payload: Record<string, unknown> = {
      space_id: space.space_id,
      length: space.length,
      width: space.width,
      height: space.height,
      notes: space.notes,
      attachments,
    };

    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
  });
};

export default class AddProjectFloorParams implements Params {
  public project_id: number;
  public project_preview_id?: number;
  public floor_number: FloorNumber;
  public site_description: string;
  public technical_general_notes: string;
  public inspection_recommendations: string;
  public spaces?: ProjectFloorSpaceParams[];

  public static readonly validation = new ClassValidation().setRules({
    project_id: {
      required: true,
      custom: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    },
    project_preview_id: {
      custom: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    },
    floor_number: {
      required: true,
      custom: (value) => Object.values(FloorNumber).includes(Number(value) as FloorNumber),
    },
    // site_description: { required: true },
    // technical_general_notes: { required: true },
    // inspection_recommendations: { required: true },
    spaces: { required: true },
  });

  constructor(data: {
    project_id: number;
    project_preview_id?: number;
    floor_number: FloorNumber;
    site_description: string;
    technical_general_notes: string;
    inspection_recommendations: string;
    spaces?: ProjectFloorSpaceParams[];
  }) {
    this.project_id = data.project_id;
    this.project_preview_id = data.project_preview_id;
    this.floor_number = data.floor_number;
    this.site_description = data.site_description;
    this.technical_general_notes = data.technical_general_notes;
    this.inspection_recommendations = data.inspection_recommendations;
    this.spaces = data.spaces;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      project_id: this.project_id,
      ...(Number.isInteger(this.project_preview_id) && Number(this.project_preview_id) > 0
        ? { project_preview_id: this.project_preview_id }
        : {}),
      floor_number: this.floor_number,
      site_description: this.site_description,
      technical_general_notes: this.technical_general_notes,
      inspection_recommendations: this.inspection_recommendations,
      spaces: mapProjectFloorSpacesToPayload(this.spaces),
    };

    return Object.fromEntries(Object.entries(map).filter(([, value]) => value !== undefined));
  }

  validate() {
    return AddProjectFloorParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectFloorParams.validation.validateOrThrow(this);
  }
}
