import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';

import { FloorNumber } from '../constants/floor.number.enum';

import {
  mapProjectFloorAttachmentsToPayload,
  mapProjectFloorSpacesToPayload,
  type ProjectFloorAttachmentParams,
  type ProjectFloorSpaceParams,
} from './add.project.floor.params';

/**
 * شكل كل دور داخل floors في طلب التعديل.
 */
export interface EditProjectFloorItemParams {
  /**
   * يكون موجودًا للدور المحفوظ المراد تعديله.
   * ويمكن أن يكون undefined عند إضافة دور جديد.
   */
  project_floor_id?: number;

  floor_number: FloorNumber;

  attachments?: ProjectFloorAttachmentParams[];

  spaces: ProjectFloorSpaceParams[];
}

/**
 * حذف undefined فقط مع الإبقاء على:
 * null
 * 0
 * النص الفارغ
 */
const removeUndefinedValues = (data: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};

/**
 * تجهيز floors بالشكل المطلوب للـ API.
 */
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

export default class EditProjectFloorParams implements Params {
  /**
   * ID الخاص بالدور الرئيسي المفتوح للتعديل.
   */
  public id: number;

  public project_id: number;

  /**
   * اختياري لأن المشروع قد يكون بدون Preview.
   */
  public project_preview_id?: number;

  public site_description: string;

  public technical_general_notes: string;

  public inspection_recommendations: string;

  /**
   * جميع الأدوار المرسلة في طلب التعديل.
   */
  public floors: EditProjectFloorItemParams[];

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

    // يمكن تفعيلها لو أصبحت مطلوبة من الـ Backend:
    // site_description: {
    //   required: true,
    // },
    //
    // technical_general_notes: {
    //   required: true,
    // },
    //
    // inspection_recommendations: {
    //   required: true,
    // },
  });

  constructor(data: {
    id: number;
    project_id: number;
    project_preview_id?: number;
    site_description?: string;
    technical_general_notes?: string;
    inspection_recommendations?: string;
    floors?: EditProjectFloorItemParams[];
  }) {
    this.id = Number(data.id);

    this.project_id = Number(data.project_id);

    this.project_preview_id =
      data.project_preview_id !== undefined &&
      data.project_preview_id !== null &&
      Number.isInteger(Number(data.project_preview_id)) &&
      Number(data.project_preview_id) > 0
        ? Number(data.project_preview_id)
        : undefined;

    this.site_description = data.site_description ?? '';

    this.technical_general_notes = data.technical_general_notes ?? '';

    this.inspection_recommendations = data.inspection_recommendations ?? '';

    this.floors = data.floors ?? [];
  }

  toMap(): Record<string, unknown> {
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
    return EditProjectFloorParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditProjectFloorParams.validation.validateOrThrow(this);
  }
}
