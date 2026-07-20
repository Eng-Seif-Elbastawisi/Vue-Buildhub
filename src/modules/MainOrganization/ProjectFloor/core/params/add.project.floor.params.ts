import type Params from '@/base/Core/Params/params';

import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { FloorNumber } from '../constants/floor.number.enum';

export interface ProjectFloorAttachmentParams {
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
  attachments?: ProjectFloorAttachmentParams[];
}

export interface ProjectFloorItemParams {
  floor_number: FloorNumber;
  attachments?: ProjectFloorAttachmentParams[];
  spaces: ProjectFloorSpaceParams[];
}

const removeUndefinedValues = (data: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};

export const mapProjectFloorAttachmentsToPayload = (
  attachments?: ProjectFloorAttachmentParams[],
): Record<string, unknown>[] | undefined => {
  if (!attachments?.length) {
    return undefined;
  }

  return attachments.map((attachment) =>
    removeUndefinedValues({
      file: attachment.file,
      alt: attachment.alt,
      link: attachment.link,
    }),
  );
};

export const mapProjectFloorSpacesToPayload = (
  spaces?: ProjectFloorSpaceParams[],
): Record<string, unknown>[] | undefined => {
  if (!spaces?.length) {
    return undefined;
  }

  return spaces.map((space) =>
    removeUndefinedValues({
      space_id: Number(space.space_id),
      length: Number(space.length),
      width: Number(space.width),
      height: Number(space.height),
      notes: space.notes,

      attachments: mapProjectFloorAttachmentsToPayload(space.attachments),
    }),
  );
};

export const mapProjectFloorsToPayload = (
  floors?: ProjectFloorItemParams[],
): Record<string, unknown>[] | undefined => {
  if (!floors?.length) {
    return undefined;
  }

  return floors.map((floor) =>
    removeUndefinedValues({
      floor_number: Number(floor.floor_number),

      attachments: mapProjectFloorAttachmentsToPayload(floor.attachments),

      spaces: mapProjectFloorSpacesToPayload(floor.spaces),
    }),
  );
};

export default class AddProjectFloorParams implements Params {
  public project_id: number;

  public project_preview_id?: number;

  public site_description: string;

  public technical_general_notes: string;

  public inspection_recommendations: string;

  /**
   * جميع الأدوار التي سيتم إرسالها مرة واحدة.
   */
  public floors: ProjectFloorItemParams[];

  public static readonly validation = new ClassValidation().setRules({
    project_id: {
      required: true,

      custom: (value) => {
        const projectId = Number(value);

        return Number.isInteger(projectId) && projectId > 0;
      },
    },

    /**
     * الـ Preview اختياري.
     * لكن لو اتبعت لازم يكون ID صحيح.
     */
    project_preview_id: {
      custom: (value) => {
        if (value === undefined || value === null || value === '') {
          return true;
        }

        const previewId = Number(value);

        return Number.isInteger(previewId) && previewId > 0;
      },
    },

    floors: {
      required: true,

      custom: (value) => {
        if (!Array.isArray(value) || !value.length) {
          return false;
        }

        return value.every((floor) => {
          if (!floor || typeof floor !== 'object') {
            return false;
          }

          const floorData = floor as ProjectFloorItemParams;

          const floorNumber = Number(floorData.floor_number);

          const validFloorNumber = Object.values(FloorNumber)
            .filter((item) => typeof item === 'number')
            .includes(floorNumber as FloorNumber);

          const hasSpaces = Array.isArray(floorData.spaces) && floorData.spaces.length > 0;

          return validFloorNumber && hasSpaces;
        });
      },
    },
  });

  constructor(data: {
    project_id: number;
    project_preview_id?: number;
    site_description?: string;
    technical_general_notes?: string;
    inspection_recommendations?: string;
    floors?: ProjectFloorItemParams[];
  }) {
    this.project_id = Number(data.project_id);

    this.project_preview_id =
      data.project_preview_id !== undefined && data.project_preview_id !== null
        ? Number(data.project_preview_id)
        : undefined;

    this.site_description = data.site_description ?? '';

    this.technical_general_notes = data.technical_general_notes ?? '';

    this.inspection_recommendations = data.inspection_recommendations ?? '';

    this.floors = data.floors ?? [];
  }

  toMap(): Record<string, unknown> {
    const validProjectPreviewId =
      Number.isInteger(this.project_preview_id) && Number(this.project_preview_id) > 0
        ? this.project_preview_id
        : undefined;

    const payload: Record<string, unknown> = {
      project_id: this.project_id,

      project_preview_id: validProjectPreviewId,

      site_description: this.site_description,

      technical_general_notes: this.technical_general_notes,

      inspection_recommendations: this.inspection_recommendations,

      floors: mapProjectFloorsToPayload(this.floors),
    };

    return removeUndefinedValues(payload);
  }

  validate() {
    return AddProjectFloorParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectFloorParams.validation.validateOrThrow(this);
  }
}
