import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { FloorNumber } from '../constants/floor.number.enum';

import {
  mapProjectFloorAttachmentsToPayload,
  mapProjectFloorSpacesToPayload,
  type ProjectFloorAttachmentParams,
  type ProjectFloorSpaceParams,
} from './add.project.floor.params';

export interface EditProjectFloorItemParams {
  project_floor_id?: number;

  floor_number: FloorNumber;

  attachments?: ProjectFloorAttachmentParams[];

  spaces: ProjectFloorSpaceParams[];
}

export interface EditSingleProjectFloorSpaceParams {
  space_id: number;
  length: number;
  width: number;
  height: number;
  notes: string | null;
}

export interface EditSingleProjectFloorParamsData {
  project_floor_id: number;
  project_id: number;
  project_preview_id: number;
  spaces: EditSingleProjectFloorSpaceParams[];
}

export interface EditProjectFloorsParamsData {
  id: number;
  project_id: number;
  project_preview_id?: number;
  site_description?: string;
  technical_general_notes?: string;
  inspection_recommendations?: string;
  floors?: EditProjectFloorItemParams[];
}

const removeUndefinedValues = (data: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};

export const mapEditProjectFloorsToPayload = (
  floors?: EditProjectFloorItemParams[],
): Record<string, unknown>[] | undefined => {
  if (!Array.isArray(floors) || floors.length === 0) {
    return undefined;
  }

  return floors.map((floor) => {
    const validProjectFloorId =
      Number.isInteger(Number(floor.project_floor_id)) && Number(floor.project_floor_id) > 0
        ? Number(floor.project_floor_id)
        : undefined;

    return removeUndefinedValues({
      project_floor_id: validProjectFloorId,

      floor_number: Number(floor.floor_number),

      attachments: mapProjectFloorAttachmentsToPayload(floor.attachments),

      spaces: mapProjectFloorSpacesToPayload(floor.spaces),
    });
  });
};

const isPositiveInteger = (value: unknown): boolean => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0;
};

const isPositiveNumber = (value: unknown): boolean => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0;
};

const areValidSingleFloorSpaces = (value: unknown): boolean => {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  return value.every((space) => {
    if (!space || typeof space !== 'object') {
      return false;
    }

    const spaceData = space as EditSingleProjectFloorSpaceParams;

    return (
      isPositiveInteger(spaceData.space_id) &&
      isPositiveNumber(spaceData.length) &&
      isPositiveNumber(spaceData.width) &&
      isPositiveNumber(spaceData.height)
    );
  });
};

export const mapSingleProjectFloorSpacesToPayload = (
  spaces: EditSingleProjectFloorSpaceParams[],
): EditSingleProjectFloorSpaceParams[] => {
  return spaces.map((space) => ({
    space_id: Number(space.space_id),
    length: Number(space.length),
    width: Number(space.width),
    height: Number(space.height),
    notes: typeof space.notes === 'string' ? space.notes.trim() || null : null,
  }));
};

export default class EditProjectFloorParams implements Params {
  public id: number;

  public project_floor_id: number;

  public project_id: number;

  public project_preview_id?: number;

  public site_description: string;

  public technical_general_notes: string;

  public inspection_recommendations: string;

  /**
   * جميع الأدوار المرسلة في طلب التعديل.
   */
  public floors: EditProjectFloorItemParams[];

  public spaces: EditSingleProjectFloorSpaceParams[];

  private readonly singleFloorUpdate: boolean;

  public static readonly validation = new ClassValidation().setRules({
    id: {
      required: true,

      custom: (value) => {
        const id = Number(value);

        return Number.isInteger(id) && id > 0;
      },
    },

    project_id: {
      required: true,

      custom: (value) => {
        const projectId = Number(value);

        return Number.isInteger(projectId) && projectId > 0;
      },
    },

    /**
     * الـ Preview اختياري.
     * لكن عند وجوده يجب أن يكون ID صحيحًا.
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
        if (!Array.isArray(value) || value.length === 0) {
          return false;
        }

        return value.every((floor) => {
          if (!floor || typeof floor !== 'object') {
            return false;
          }

          const floorData = floor as EditProjectFloorItemParams;

          const floorNumber = Number(floorData.floor_number);

          const validFloorNumber = Object.values(FloorNumber)
            .filter((item) => typeof item === 'number')
            .includes(floorNumber as FloorNumber);

          const validSpaces = Array.isArray(floorData.spaces) && floorData.spaces.length > 0;

          const validProjectFloorId =
            floorData.project_floor_id === undefined ||
            (Number.isInteger(Number(floorData.project_floor_id)) &&
              Number(floorData.project_floor_id) > 0);

          return validFloorNumber && validSpaces && validProjectFloorId;
        });
      },
    },

    site_description: {
      required: true,
    },

    technical_general_notes: {
      required: true,
    },

    inspection_recommendations: {
      required: true,
    },
  });

  public static readonly singleFloorValidation = new ClassValidation().setRules({
    project_floor_id: {
      required: true,
      custom: isPositiveInteger,
    },
    project_id: {
      required: true,
      custom: isPositiveInteger,
    },
    project_preview_id: {
      required: true,
      custom: isPositiveInteger,
    },
    spaces: {
      required: true,
      custom: areValidSingleFloorSpaces,
    },
  });

  constructor(data: EditProjectFloorsParamsData | EditSingleProjectFloorParamsData) {
    const singleFloorUpdate = 'project_floor_id' in data;

    this.singleFloorUpdate = singleFloorUpdate;
    this.id = Number(singleFloorUpdate ? data.project_floor_id : data.id);
    this.project_floor_id = this.id;

    this.project_id = Number(data.project_id);

    if (singleFloorUpdate) {
      this.project_preview_id = Number(data.project_preview_id);
    } else {
      this.project_preview_id =
        data.project_preview_id !== undefined &&
        data.project_preview_id !== null &&
        Number.isInteger(Number(data.project_preview_id)) &&
        Number(data.project_preview_id) > 0
          ? Number(data.project_preview_id)
          : undefined;
    }

    this.site_description = 'site_description' in data ? (data.site_description ?? '') : '';

    this.technical_general_notes =
      'technical_general_notes' in data ? (data.technical_general_notes ?? '') : '';

    this.inspection_recommendations =
      'inspection_recommendations' in data ? (data.inspection_recommendations ?? '') : '';

    this.floors = 'floors' in data ? (data.floors ?? []) : [];
    this.spaces = singleFloorUpdate ? mapSingleProjectFloorSpacesToPayload(data.spaces) : [];
  }

  toMap(): Record<string, unknown> {
    if (this.singleFloorUpdate) {
      return {
        project_floor_id: this.project_floor_id,
        project_id: this.project_id,
        project_preview_id: this.project_preview_id,
        spaces: mapSingleProjectFloorSpacesToPayload(this.spaces),
      };
    }

    const payload: Record<string, unknown> = {
      project_floor_id: this.id,

      project_id: this.project_id,

      project_preview_id: this.project_preview_id,

      site_description: this.site_description,

      technical_general_notes: this.technical_general_notes,

      inspection_recommendations: this.inspection_recommendations,

      floors: mapEditProjectFloorsToPayload(this.floors),
    };

    return removeUndefinedValues(payload);
  }

  validate() {
    return this.singleFloorUpdate
      ? EditProjectFloorParams.singleFloorValidation.validate(this)
      : EditProjectFloorParams.validation.validate(this);
  }

  validateOrThrow() {
    return this.singleFloorUpdate
      ? EditProjectFloorParams.singleFloorValidation.validateOrThrow(this)
      : EditProjectFloorParams.validation.validateOrThrow(this);
  }
}
